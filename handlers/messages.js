const riddletMessage = require('riddlet-core').RiddletMessage

exports.RiddletMessage = RiddletMessage
exports.RedditDM = PrivateMessage
if (process.env.ratelimit === "true") {
  var FastRateLimit = require("fast-ratelimit").FastRateLimit
  var messageLimiter = new FastRateLimit({
    threshold: 5, // available tokens over timespan
    ttl: 5 // time-to-live value of token bucket (in seconds)
  })
}
var jwt = require("jsonwebtoken")
var io, socket, code, serverInfo



function RiddletMessage(rio, rsocket, message, messages, rcode, rserverInfo, user, privateKey) {
  io = rio
  socket = rsocket
  code = rcode
  serverInfo = rserverInfo

  var maxmsg = process.env.maxmsg || 15
  if (messages.length > maxmsg) {
    messages.shift()
  }

  /** TODO: encrypted sending and recievingh
      var xx = crypto.createDecipher(algorithm,socket.crypto)
      var yy = xx.update(message.data, 'hex', 'utf8')
      message.data = yy
   io.emit("message", message)
   messages.push(message)
   } else {
    */

  if (message.data.startsWith("/join")) {
    JoinMessage(message, privateKey)
  } else if (message.data.startsWith("/leave")) {
    LeaveMessage(message, privateKey)
  } else {
    NormalMessage(message, user, privateKey)
  }
}

function NormalMessage(message, decoded, privateKey) {
    var namespace = decoded.name
    if (process.env.ratelimit === "true") {
      messageLimiter
        .consume(namespace)
        .then(() => {
          if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
            if (serverInfo.encrypt === "true") {
              message.encrypt(privateKey)
              console.log("sending encrypted message");
            }
            io.emit("message", message);
          } else {
            socket.emit("message", {
              id: String(Date.now()),
              client: "Server",
              color: "red",
              nickname: "Riddlet",
              room: "#all",
              data:
                serverInfo.encrypt === "true"
                  ? require("./util").encryptMessage(
                      "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')",
                      privateKey
                    )
                  : "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
            });
          }
        })
        .catch(() => {
          socket.emit("message", {
            id: String(Date.now()),
            client: "Server",
            nickname: "Riddlet",
            color: "red",
            room: "#all",
            data:
                (serverInfo.encrypt === "true") ? require('./util').encryptMessage("You have been ratelimited, please wait 5 seconds before messaging again", privateKey) : "You have been ratelimited, please wait 5 seconds before messaging again"
          })
        })
    } else {
      if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
        if (serverInfo.encrypt === "true") {
          message.encrypt(privateKey)
          console.log("sending encrypted message")
        }
        io.emit("message", message)
      } else {
        socket.emit("message", {
          id: String(Date.now()),
          client: "Server",
          color: "red",
          room: "#all",
          nickname: "Riddlet",
          data:
              (serverInfo.encrypt === "true") ? require('./util').encryptMessage("Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')", privateKey) : "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
        })
      }
    }
    console.log(message)
}

function PrivateMessage(message, decoded, privateKey, client) {
    var namespace = decoded.name
    if (process.env.ratelimit === "true") {
      messageLimiter
        .consume(namespace)
        .then(() => {
          if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
            message = new riddletMessage(message.data, message.room, decoded)
            console.log(message)
            if (serverInfo.encrypt === "true") {
              message.encrypt(privateKey)
              console.log("sending encrypted message");
            }
            io.to(client.id).emit("message", message);
          } else {
            socket.emit("message", {
              id: String(Date.now()),
              client: "Server",
              color: "red",
              room: "#all",
              nickname: "Riddlet",
              data:
                serverInfo.encrypt === "true"
                  ? require("./util").encryptMessage(
                      "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')",
                      privateKey
                    )
                  : "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
            });
          }
        })
        .catch(() => {
          socket.emit("message", {
            id: String(Date.now()),
            client: "Server",
            color: "red",
            room: "#all",
            nickname: "Riddlet",
            data:
                (serverInfo.encrypt === "true") ? require('./util').encryptMessage("You have been ratelimited, please wait 5 seconds before messaging again", privateKey) : "You have been ratelimited, please wait 5 seconds before messaging again"
          })
        })
    } else {
      if (message.data !== " " && message.data.length > 0 && message.data.length <= serverInfo.maxcharlen) {
        message = new riddletMessage(message.data, message.room, decoded)
        if (serverInfo.encrypt === "true") {
          message.encrypt(privateKey)
          console.log("sending encrypted message");
        }
        io.to(client.id).emit("message", message);
      } else {
        socket.emit("message", {
          id: String(Date.now()),
          client: "Server",
          color: "red",
          room: "#all",
          nickname: "Riddlet",
          data:
              (serverInfo.encrypt === "true") ? require('./util').encryptMessage("Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')", privateKey) : "Message is too long, the server did not send it. Contact the server admin to change the server message max character length ('maxcharlen')"
        })
      }
    }
}

function JoinMessage(message, key) {
  var room = message.data.split(" ")[1]
  if (room.startsWith("#")) {
    socket.emit("join", room)
    socket.join(room)
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      nickname: "Riddlet",
      data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage(`You have joined the ${room} room, type '/switch {#RoomName}' to switch to another room`, key) : `You have joined the ${room} room, type '/switch {#RoomName}' to switch to another room`
    })
  } else {
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      nickname: "Riddlet",
      room: "#all",
      data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage('Rooms must start with the "#" sign (ex: #default)', key) : 'Rooms must start with the "#" sign (ex: #default)'
    })
  }
}

function LeaveMessage(message, key) {
  var room = message.data.split(" ")[1]
  if (room.startsWith("#")) {
    socket.emit("leave", room)
    socket.leave(room)
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      nickname: "Riddlet",
      data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage(`You have left the ${room} room, you have now been switched into another room`, key) : `You have left the ${room} room, you have now been switched into another room`
    })
  } else {
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      nickname: "Riddlet",
      room: "#all",
      data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage('Rooms must start with the "#" sign (ex: #default)', key) : 'Rooms must start with the "#" sign (ex: #default)'
    })
  }
}
