var jwt = require("jsonwebtoken");
var fs = require('fs');
var keypair = require('keypair');
var path = require('path');
const riddletMessage = require('riddlet-core').RiddletMessage
const riddletUser = require('riddlet-core').RiddletUser
const serverUser = new riddletUser("Server", "Riddlet", "red", null, null)

colors = ["black", "blue", "green", "orange", "sienna", "coral", "purple", "gold", "royalblue", "silver", "olive", "orchid"];

var makeid = require('./util').generateName

function RiddletIdentification(token, io, socket, messages, code, serverInfo, privateKey, publicKey, users) {
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

    token = jwt.sign({ name: socket.name, color: colorChoice, nickname: socket.name, img: null }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
  }
  var message = new riddletMessage('Welcome!', "#all", serverUser)
  if (serverInfo.encrypt === "true")
    message.encrypt(privateKey)
  socket.emit("message", message);
  socket.emit("version", serverInfo.version);
  serverInfo.users++;
  socket.join("#default");
  socket.token = token
  var user = {name: socket.name, id: socket.id}
  users.push(user)
}

function RiddletNonIdentification(io, socket, messages, code, serverInfo, privateKey, publicKey, users) {
  this.RiddletKeyHandler(socket, publicKey);
  socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    token = jwt.sign({ name: socket.name, color: colorChoice, nickname: socket.name, img: null }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      token: token
    });
  var message = new riddletMessage('Welcome!', "#all", serverUser)
  if (serverInfo.encrypt === "true")
    message.encrypt(privateKey)
  socket.emit("message", message);
    socket.emit("version", serverInfo.version);
    serverInfo.users++;
    socket.token = token
    var user = {name: socket.name, id: socket.id}
    users.push(user)
  }

function RiddletReIdentify(io, socket, messages, code, serverInfo, privateKey, publicKey, users) {
  this.RiddletKeyHandler(socket, publicKey);
  var x = makeid(15);
  socket.name = x;
  var colorChoice = colors[Math.floor(Math.random() * colors.length)];
  token = jwt.sign({ id: socket.name, color: colorChoice, nickname: socket.name, img: null }, code);
  socket.emit("identification", { id: x, color: colorChoice, token: token });
  var message = new riddletMessage('Welcome!', "#all", serverUser)
  if (serverInfo.encrypt === "true")
    message.encrypt(privateKey)
  socket.emit("message", message);
  socket.emit("version", serverInfo.version);
  socket.join("#default");
  socket.token = token
  var user = {name: socket.name, id: socket.id}
  users.push(user)
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
    nickname: "Riddlet",
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
    socket.emit("message", {
    id: String(Date.now()),
    client: "Server",
    color: "red",
    room: "#all",
    nickname: "Riddlet",
    data: "Nickname set!"
    });
    token = jwt.sign({ name: decoded.name, color: decoded.color, nickname: nickname }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      nickname: nickname,
      img: null,
      token: token
    });
  }
  socket.token = token
}

function RiddletSetImage(socket, nickname, code) {
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
      nickname: "Riddlet",
      data: "Image set!"
    });
    socket.name = decoded.name;
    decoded.img = nickname
    socket.emit("identification", {
      id: decoded.name,
      color: decoded.color,
      token: jwt.sign(decoded, code)
    });
    token = jwt.sign({ name: decoded.name, color: decoded.color, nickname: decoded.nickname, img: nickname }, code);
  } else {
    socket.name = makeid(15);
    var colorChoice = colors[Math.floor(Math.random() * colors.length)];
    socket.emit("message", {
      id: String(Date.now()),
      client: "Server",
      color: "red",
      room: "#all",
      nickname: "Riddlet",
      data: "Image set!"
    });
    token = jwt.sign({ name: socket.name, color: colorChoice, nickname: socket.name, img: nickname }, code);
    socket.emit("identification", {
      id: socket.name,
      color: colorChoice,
      nickname: socket.name,
      img: nickname,
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
exports.RiddletSetImage = RiddletSetImage