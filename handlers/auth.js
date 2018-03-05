var Realm = require("realm");
var FastRateLimit = require("fast-ratelimit").FastRateLimit;
var jwt = require("jsonwebtoken");

colors = ["black", "blue", "green", "orange", "sienna", "coral", "purple", "gold", "royalblue", "silver", "olive", "orchid"];

var makeid = require('./util').randtext

function RiddletIdentification(token, io, socket, sockets, messages, code, serverInfo) {
  var decoded;
  try {
    decoded = jwt.verify(token, code);
  } catch (err) {
    console.log("Someone tried to connect with invalid token, reasigning token");
  }
  if (decoded) {
    socket.name = decoded.name;
    socket.emit("identification", {
      id: decoded.name,
      color: decoded.color,
      token: jwt.sign(decoded, code)
    });
    socket.emit("messagelist", messages);
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: "Welcome!"
    });
    socket.emit("version", serverInfo.version);
  } else {
    socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    console.log(colorChoice);
    token = jwt.sign({ name: socket.name, color: colorChoice }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
    socket.emit("messagelist", messages);
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: "Welcome!"
    });
    socket.emit("version", serverInfo.version);
  }
  sockets.push(socket);
  socket.join("#default");
}

function RiddletNonIdentification(io, socket, sockets, messages, code, serverInfo) {
  socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    token = jwt.sign({ name: socket.name, color: colorChoice }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
    socket.emit("messagelist", messages);
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: "Welcome!"
    });
    socket.emit("version", serverInfo.version);
  }

function RiddletReIdentify(io, socket, sockets, messages, code, serverInfo) {
  var x = makeid(15);
  socket.name = x;
  var colorChoice = colors[Math.floor(Math.random() * colors.length)];
  token = jwt.sign({ name: socket.name, color: colorChoice }, code);
  socket.emit("identification", { id: x, color: colorChoice, token: token });
  socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    data:
      "Your user data was corrupted, you have been re-registered with new data."
  });
  socket.emit("version", serverInfo.version);
  socket.join("#default");
}

exports.RiddletReIdentify = RiddletReIdentify;
exports.RiddletNonIdentification = RiddletNonIdentification
exports.RiddletIdentification = RiddletIdentification