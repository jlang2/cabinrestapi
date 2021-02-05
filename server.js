const http = require('http');
const app = require('./app');

//Definierar portnummer
const port = process.env.port || 8080;

const server = http.createServer(app)

//Startar servern och börjar lyssna på porten
server.listen(port);
console.log("listening on port " + port);