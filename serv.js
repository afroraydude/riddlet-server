var http = require('http');

app = http.createServer();

var riddlet = require("./index").Riddlet(app)

const port = process.env.port || 8080;
app.listen(port);
console.log("http listening on port ", port);

setTimeout(process.exit(), 10000);
