exports.randtext = makeid
exports.encryptMessage = encryptMessage
exports.decryptMessage = decryptMessage

var fs = require('fs')
var crypto = require("crypto")
var path = require("path")
var NodeRSA = require('node-rsa')

function makeid(chars) {
  var len = chars || 15
  var text = ""
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (var i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function encryptMessage(message, key) {
  var buffer = new Buffer(message)
  var encrypted = crypto.privateEncrypt(key, buffer)
  return encrypted.toString("base64")
}

function decryptMessage(message, key) {
  var buffer = new Buffer(message, "base64")
  var decrypted = crypto.publicDecrypt(key, buffer)
  return decrypted.toString("utf8")
}
