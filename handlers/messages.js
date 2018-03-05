
exports.RiddletMessage = RiddletMessage

var FastRateLimit = require("fast-ratelimit").FastRateLimit;
var jwt = require("jsonwebtoken");
var io, socket, code, serverInfo;
require("dotenv").config();

var messageLimiter = new FastRateLimit({
  threshold: 5, // available tokens over timespan
  ttl: 5 // time-to-live value of token bucket (in seconds)
});

function RiddletMessage(rio, rsocket, message, sockets, messages, rcode, rserverInfo, user) {
  io = rio;
  socket = rsocket;
  code = rcode;
  serverInfo = rserverInfo;

  var maxmsg = process.env.maxmsg || 15;
  if (messages.length > maxmsg) {
    messages.shift();
  }

  /** TODO: encrypted sending and recievingh
      var xx = crypto.createDecipher(algorithm,socket.crypto);
      var yy = xx.update(message.data, 'hex', 'utf8');
      message.data = yy;
   io.emit("message", message);
   messages.push(message);
   } else {
    */

  if (message.data.startsWith("/join")) {
    console.log("handled join");
    JoinMessage(message);
  } else if (message.data.startsWith("/leave")) {
    console.log("handled leave");
    LeaveMessage(message);
  } else {
    console.log("handled normal message");
    NormalMessage(message, user);
  }
}

function NormalMessage(message, decoded) {
    console.log("MessageHandler was able to decode message");
    var namespace = decoded.name;
    if (process.env.ratelimit === "true") {
      messageLimiter
        .consume(namespace)
        .then(() => {
          if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
            message.client = decoded.name;
            message.token = null;
            message.color = decoded.color;
            socket.emit("message", {
              id: String(Date.now()),
              client: "Server",
              color: "red",
              room: "#all",
              data:
                "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
            });
          }
        })
        .catch(() => {
          socket.emit("message", {
            id: String(Date.now()),
            client: "Server",
            color: "red",
            room: "#all",
            data:
              "You have been ratelimited, please wait 5 seconds before messaging again"
          });
        });
    } else {
      if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
        message.client = decoded.name;
        message.color = decoded.color;
        message.token = null;
        io.emit("message", message);
        messages.push(message);
      } else {
        socket.emit("message", {
          id: String(Date.now()),
          client: "Server",
          color: "red",
          room: "#all",
          data:
            "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
        });
      }
    }
    console.log("processed a message");
}

function JoinMessage(message) {
  var room = message.data.split(" ")[1];
  if (room.startsWith("#")) {
    socket.emit("join", room);
    socket.join(room);
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: `You have joined the ${room} room, type '/switch {#RoomName}' to switch to another room`
    });
  } else {
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: 'Rooms must start with the "#" sign (ex: #default)'
    });
  }
}

function LeaveMessage(message) {
  var room = message.data.split(" ")[1];
  if (room.startsWith("#")) {
    socket.emit("leave", room);
    socket.leave(room);
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: `You have left the ${room} room, you have now been switched into another room`
    });
  } else {
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: 'Rooms must start with the "#" sign (ex: #default)'
    });
  }
}