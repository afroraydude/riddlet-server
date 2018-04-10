var jwt = require("jsonwebtoken");
var fs = require('fs');
var keypair = require('keypair');
var path = require('path');

colors = ["black", "blue", "green", "orange", "sienna", "coral", "purple", "gold", "royalblue", "silver", "olive", "orchid"];

var makeid = require('./util').randtext

function RiddletIdentification(token, io, socket, messages, code, serverInfo, privateKey, publicKey) {
  this.RiddletKeyHandler(socket, publicKey);
  var decoded;
  try {
    decoded = jwt.verify(token, code);
  } catch (err) {
    // do nothing, they will get a new token
  }
  if (decoded) {
    socket.name = decoded.name;
    socket.emit("identification", {
      id: decoded.name,
      color: decoded.color,
      token: jwt.sign(decoded, code)
    });
  } else {
    socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    console.log(colorChoice);
    token = jwt.sign({ name: socket.name, color: colorChoice, nickname: null }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
  }
  socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    data:
        (serverInfo.encrypt === "true") ? require('./util').encryptMessage("Welcome!", privateKey) : "Welcome!"
  });
  socket.emit("version", serverInfo.version);
  serverInfo.users++;
  socket.join("#default");
  socket.token = token
}

function RiddletNonIdentification(io, socket, messages, code, serverInfo, privateKey, publicKey) {
  this.RiddletKeyHandler(socket, publicKey);
  socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    token = jwt.sign({ name: socket.name, color: colorChoice, nickname: null }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage("Welcome!", privateKey) : "Welcome!"
    });
    socket.emit("version", serverInfo.version);
    serverInfo.users++;
    socket.token = token
  }

function RiddletReIdentify(io, socket, messages, code, serverInfo, privateKey, publicKey) {
  this.RiddletKeyHandler(socket, publicKey);
  var x = makeid(15);
  socket.name = x;
  var colorChoice = colors[Math.floor(Math.random() * colors.length)];
  token = jwt.sign({ id: socket.name, color: colorChoice, nickname: null }, code);
  socket.emit("identification", { id: x, color: colorChoice, token: token });
  socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    data: (serverInfo.encrypt === "true") ? require('./util').encryptMessage("Your user data was corrupted, you have been re-registered with new data.", privateKey) : "Your user data was corrupted, you have been re-registered with new data."
  });
  socket.emit("version", serverInfo.version);
  socket.join("#default");
  socket.token = token
}

function RiddletKeyHandler(socket, key) {
  socket.emit('servkey', key);
}

function RiddletSetNick(socket, nickname, code) {
  var decoded;
  try {
    decoded = jwt.verify(socket.token, code);
  } catch (err) {
    // do nothing, they will get a new token
  }
  var token;
  if (decoded) {
    socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    data: "Nickname set!"
    });
    socket.name = decoded.name;
    decoded.nickname = nickname
    socket.emit("identification", {
      id: decoded.name,
      color: decoded.color,
      nickname: nickname,
      token: jwt.sign(decoded, code)
    });
    token = jwt.sign({ name: decoded.name, color: decoded.color, nickname: nickname }, code);
  } else {
    socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    console.log(colorChoice);
    socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    data: "Nickname set!"
    });
    token = jwt.sign({ name: decoded.name, color: decoded.color, nickname: nickname }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      nickname: nickname,
      token: token
    });
  }
  socket.token = token
}

exports.RiddletSetNick = RiddletSetNick
exports.RiddletReIdentify = RiddletReIdentify
exports.RiddletNonIdentification = RiddletNonIdentification
exports.RiddletIdentification = RiddletIdentification
exports.RiddletKeyHandler = RiddletKeyHandler
