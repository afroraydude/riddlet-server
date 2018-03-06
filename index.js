var Riddlet = function(app, adapters) {
  // Setup stuff
  http = require("http");

  if (app)
    io = require("socket.io")(app);
  else
    io = require("socket.io")();

  var crypto = require("crypto");
  var algorithm = "aes-256-ctr";
  var jwt = require("jsonwebtoken");
  sockets = [];
  messages = [];
  colors = ["black", "blue", "green", "orange", "sienna", "coral", "purple", "gold", "royalblue", "silver", "olive", "orchid"];

  var FastRateLimit = require("fast-ratelimit").FastRateLimit;

  var messageLimiter = new FastRateLimit({ threshold: 5, ttl: 5 }); // available tokens over timespan // time-to-live value of token bucket (in seconds)

  var makeid = require('./handlers/util').randtext

  var code = process.env.jwtcode || makeid(25);
  console.log(code);

  var ip = require("ip")

  var serverInfo = { version: 10, title: process.env.riddlettitle || "Test Server", rooms: ["/"], maxcharlen: parseInt(process.env.maxcharlen) || 500,  ip: ip.address(), logo: process.env.logourl || "https://d30y9cdsu7xlg0.cloudfront.net/png/29558-200.png", users: 0, isMod: adapters ? true : false };

  // check if using custom adapters
  if (serverInfo.isMod === true) {
    console.log("Running modified script")
  }

  io.on("connection", socket => {
    console.log("connection")

    // send this no matter what, used in main menu of web app
    socket.emit("serverinfo", serverInfo);

    // if user has been on this server before, they should send 'identification' with a token attached. Here's what parses it
    socket.on("identification", function(token) {
      require("./handlers/auth").RiddletIdentification(token, io, socket, sockets, messages, code, serverInfo);
      socket.didauth = true;
      serverInfo.users = sockets.length
      console.log("user count: " + sockets.length);
    });

    // If they haven't been on this server before, here's what we do
    socket.on("noid", function() {
      require("./handlers/auth").RiddletNonIdentification(io, socket, sockets, messages, code, serverInfo);
      socket.didauth = true;
      serverInfo.users = sockets.length
      console.log("user count: "+sockets.length)
    });

    // if they disconnect, here's what we do
    socket.on("disconnect", function() {
      if (socket.didauth) {
        sockets.splice(sockets.indexOf(socket), 1);
      }
      serverInfo.users = sockets.length;
      console.log("user count: " + sockets.length);
      console.log("client left");
    });

    // for any generic message given by user input instead of client programming, here's what we do
    socket.on("message", function(message) {
      // if the user is a real user and is properly authenticated, default false
      var isReal = false
      try {
        // check if they are using a valid token given by this server
        var user = jwt.verify(message.token, code)
        // if so, change value to true
        isReal = true
      } catch(err) {
        // give them a new token
        require('./handlers/auth').RiddletReIdentify(io, socket, sockets, messages, code, serverInfo)
      }
      if (isReal) {
        var messageHandler = require("./handlers/messages").RiddletMessage;
        // for each adapter, see if they have a "beforeMessage" function to handle stuff before the message is parsed by
        // Riddlet.
        if (adapters && typeof adapters === "object") {
          adapters.forEach(function (adapter) {
            if (typeof adapter.beforeMessage === 'function') {
              adapter.beforeMessage(io, socket, message, sockets, messages, code, serverInfo, user)
            }
          });
        }
        // parse the message through our message parser
        messageHandler(io, socket, message, sockets, messages, code, serverInfo, user)
        // for each adapter, see if they have an "afterMessage" function to handle stuff after the message is parsed by
        // Riddlet
        if (adapters && typeof adapters === "object") {
          adapters.forEach(function (adapter) {
            if (typeof adapter.afterMessage === 'function') {
              adapter.afterMessage(message, user)
            } else {
              console.log("afterMessage from adapter " + adapters.indexOf(adapter) + " was a " + typeof adapter.afterMessage)
            }
          });
        }
      }
    });
  });
  setInterval(function() {
    io.emit("version", serverInfo.version);
  }, 60000);

  if (!app) {
    const port = process.env.port || 8000
    io.listen(port)
    console.log("running socketio by itself on port " + port)
  }
}

exports.Riddlet = Riddlet
