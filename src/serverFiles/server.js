/*
* Creates a WebSocketServer. Whenever a client connects it creates a new object with the corresponding data allowing for
* the server to send data to each client.
*/

const { WebSocketServer } = require("ws");
const Turtle = require("./Turtle.js");
const { ipcMain } = require('electron');
const main = require("../main.js");

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

    //Randomly call actions on a turtle for testing purposes
    while(true) {
        let letters = ["w", "a", "s", "d", " ", "z", "x", "c", "v"];
        let move = letters[Math.trunc(Math.random() * letters.length)];
        if(move == 'w') {
            await turtle.moveForward();
        } else if(move == 'a') {
            await turtle.turnLeft();
        } else if(move == 's') {
            await turtle.moveBackward();
        } else if(move == 'd') {
            await turtle.turnRight();
        } else if(move == ' ') {
            await turtle.moveUp();
        } else if(move == 'z') {
            await turtle.moveDown();
        } else if(move == 'x') {
            await turtle.digForward();
        } else if(move == 'c') {
            await turtle.digDown();
        } else if(move == 'v') {
            await turtle.digUp();
        }

        console.log(turtle.position);
    }
});

//Display the server is running
console.log(`Listening at ${port}...`);

module.exports = { turtles };
