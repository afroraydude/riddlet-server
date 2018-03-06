![logo](https://riddletchat.firebaseapp.com/static/media/logo.786543bd.png)
# riddlet-server
The server library for Riddlet, the anonymous chat app. A simple, upgradable wrapper for Socket.IO.


## Installation
Setup is very simple just `npm install --save riddlet-server`.
**Note**: ensure you have a C++11 compiler available (available in GCC 4.9+). This allows for node-gyp to build the hashtable dependency that fast-ratelimit depends on. (**Windows: you may have to install windows-build-tools globally using: npm install -g windows-build-tools to be able to compile**)

# Usage
Here are two simple examples of how you can run Riddlet.

### Example #1 - Under an existing HTTP(S) server
```javascript
var http = require('http');

app = http.createServer();

var riddlet = require("riddlet-server").Riddlet(app)

const port = process.env.port || 8080;
app.listen(port);
console.log("http listening on port ", port);

process.on("uncaughtException", function(err) {
  console.log("Caught exception: ", err);
});
```
### Example #2 - Standalone
```javascript
var riddlet = require("riddlet-server").Riddlet() // runs on either process.env.port or 8000

process.on("uncaughtException", function(err) {
  console.log("Caught exception: ", err);
});
```
## Connecting
Connecting to your server is simple. Just open up the Riddlet web client located [here](https://riddletchat.firebaseapp.com) and enter the URL for for your Riddlet server, including the port if necessary. (ie. `http://123.456.78.90:8080`) then press "Connect to Server"