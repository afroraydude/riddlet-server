var Riddlet = function(app, adapters) {
  // Setup stuff
  http = require("http")
  var keypair = require('keypair')

  var pair = keypair()

  if (app)
    io = require("socket.io")(app)
  else
    io = require("socket.io")()

  var crypto = require("crypto")
  var algorithm = "aes-256-ctr"
  var jwt = require("jsonwebtoken")
  messages = []
  colors = ["black", "blue", "green", "orange", "sienna", "coral", "purple", "gold", "royalblue", "silver", "olive", "orchid"]

  var FastRateLimit = require("fast-ratelimit").FastRateLimit

  var messageLimiter = new FastRateLimit({ threshold: 5, ttl: 5 }) // available tokens over timespan // time-to-live value of token bucket (in seconds)

  var makeid = require('./handlers/util').randtext

  var code = process.env.jwtcode || makeid(25)

  var ip = require("ip")

  var serverInfo = { version: 11, title: process.env.riddlettitle || "Test Server", rooms: ["/"], maxcharlen: parseInt(process.env.maxcharlen) || 500,  ip: ip.address(), logo: process.env.logourl || "https://d30y9cdsu7xlg0.cloudfront.net/png/29558-200.png", isMod: !!adapters, encrypt: process.env.encryptMessages || "true" }

  io.on("connection", socket => {
    // send this no matter what, used in main menu of web app
    socket.emit("serverinfo", serverInfo)

    // if user has been on this server before, they should send 'identification' with a token attached. Here's what parses it
    socket.on("identification", function(token) {
      require("./handlers/auth").RiddletIdentification(token, io, socket, messages, code, serverInfo, pair.private, pair.public)
      socket.didauth = true
    })

    // If they haven't been on this server before, here's what we do
    socket.on("noid", function() {
      require("./handlers/auth").RiddletNonIdentification(io, socket, messages, code, serverInfo, pair.private, pair.public)
      socket.didauth = true
    })

    socket.on("clientkey", function(key) {
      socket.key = key
      require("./handlers/auth").RiddletKeyHandler(socket, pair.public)
      // TODO: Reimplement message list
    })

    // if they disconnect, here's what we do
    socket.on("disconnect", function(nick) {
    })
    
    socket.on("setnick", function(nick) {
      require('./handlers/auth').RiddletSetNick(socket, nick)
    })

    // for any generic message given by user input instead of client programming, here's what we do
    socket.on("message", function(message) {
      // if the user is a real user and is properly authenticated, default false
      var isReal = false
      try {
        // check if they are using a valid token given by this server
        var user = jwt.verify(socket.token, code)
        // if so, change value to true
        isReal = true
      } catch(err) {
        // give them a new token
        require('./handlers/auth').RiddletReIdentify(io, socket, messages, code, serverInfo, pair.private, pair.public)
      }
      if (isReal) {
        if (serverInfo.encrypt == "true") message.data = require('./handlers/util').decryptMessage(message.data, socket.key)

        var messageHandler = require("./handlers/messages").RiddletMessage
        // for each adapter, see if they have a "beforeMessage" function to handle stuff before the message is parsed by
        // Riddlet.
        if (adapters && typeof adapters === "object") {
          adapters.forEach(function (adapter) {
            if (typeof adapter.beforeMessage === 'function') {
              adapter.beforeMessage(io, socket, message, messages, serverInfo, user)
            }
          })
        }
        // parse the message through our message parser
        messageHandler(io, socket, message, messages, code, serverInfo, user, pair.private)
        // for each adapter, see if they have an "afterMessage" function to handle stuff after the message is parsed by
        // Riddlet
        if (adapters && typeof adapters === "object") {
          adapters.forEach(function (adapter) {
            if (typeof adapter.afterMessage === 'function') {
              adapter.afterMessage(io, socket, message, messages, serverInfo, user)
            } else {
            }
          })
        }
      }
    })
    io.emit("version", serverInfo.version)
  })

  if (!app) {
    const port = process.env.port || 8000
    io.listen(port)
  }
}

exports.Riddlet = Riddlet
