![logo](https://riddletchat.firebaseapp.com/static/media/logo.786543bd.png)

# riddlet-server

The server library for Riddlet, the anonymous chat app. A simple, upgradable wrapper for Socket.IO.

[![NPM](https://nodei.co/npm/riddlet-server.png)](https://www.npmjs.com/package/riddlet-server)

## Installation

Setup is very simple just `npm install --save riddlet-server`.

**Note**: nsure you have a C++11 compiler available (available in GCC 4.9+). This allows for node-gyp to build the hashtable dependency that fast-ratelimit depends on. (*Windows: you may have to install windows-build-tools globally using: npm install -g windows-build-tools to be able to compile*)

## Usage

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

## Issues
Report issues to the issues tab on GitHub (go [here](https://github.com/afroraydude/riddlet-server/issues))

## Planned

* [ ] OTR (Off the record messaging)
  * [ ] Implement crypto library inside the web app and server
  * [ ] Allow for usage of sending all messages through an encrypted medium - diffrent keys for different clients
  * [ ] Client key changes each use of server
* [ ] Major code cleanup
  * [ ] Don't mix semicolons and no semicolons
  * [ ] Switch out most vars with let/const
* [ ] Small features
  * [ ] Allow for more customization of the Riddlet platform with adapters/plugins
    * [ ] Allow for overriding of the message handler through adapters
    * [ ] Allow for overriding of the authentication system through adapters
  * [ ] Allow for async usage of adapter methods
