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

    //Update the turtles data
    await turtle.updateMetaData();

    //Display
    console.log("Turtle connected: " + await turtle.getLabel());
});

//Display the server is running
console.log(`Listening at ${port}...`);

//Pings all the turtles
//If turtle doesn't respond by next ping then remove the turtle
function pingTurtles() {
    turtles.forEach(turtle => {
        turtle.getLabel().catch(e => {
            console.log("Turtle disconnected: " + turtle.label);

            //Remove the turtle
            const index = turtles.indexOf(turtle);
                if (index > -1) {
                    turtles.splice(index, 1);
                }
        });
    });

    setTimeout(pingTurtles, 2000);
}

pingTurtles();

module.exports = { turtles };
