const { WebSocketServer } = require("ws");
const Turtle = require("./Turtle.js");


const prompt = require('prompt-sync')();

//The port
const port = 2553;

//WebSocket server started on this machine on specified port
const wss = new WebSocketServer({port});

//When a websocket connects to the server...
wss.on('connection', async (ws) => {
    let turtle = new Turtle(ws);
    while(true) {
        //const move = prompt("move: ");
        let letters = ["w", "a", "s", "d", " ", "z", "x", "c", "v"];
        let move = letters[0];
        console.log(move);
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

        setTimeout(() => {  console.log("World!"); }, 2000);
    }
});


console.log(`Listening at ${port}...`);

