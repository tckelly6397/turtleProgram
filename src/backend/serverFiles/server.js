/*
* Creates a WebSocketServer. Whenever a client connects it creates a new object with the corresponding data allowing for
* the server to send data to each client.
*/

const { WebSocketServer } = require("ws");
const Turtle = require("./Turtle.js");

//The port
const port = 2553;

//WebSocket server started on this machine on specified port
const wss = new WebSocketServer({port});

let turtles = [];

//When a websocket connects to the server create a new Turtle object passing in it's
//Corresponding WebSocket
wss.on('connection', async (ws) => {
    let turtle = new Turtle(ws);
    turtles.push(turtle);
});

//Display the server is running
console.log(`Listening at ${port}...`);

module.exports = { turtles };
