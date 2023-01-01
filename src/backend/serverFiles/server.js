/*
* Creates a WebSocketServer. Whenever a client connects it creates a new object with the corresponding data allowing for
* the server to send data to each client.
*/

const { WebSocketServer } = require("ws");
const { Turtle, Actions } = require("./Turtle.js");
const fs = require('fs');

//The port
const port = 2553;

//WebSocket server started on this machine on specified port
const wss = new WebSocketServer({port});

//Display the server is running
console.log(`Listening at ${port}...`);

let turtles = [];
let turtleList;
let win;

synchTurtleList();

function synchTurtleList() {
    fs.readFile("./src/backend/serverFiles/TurtleData/turtleList.json", (err, data) => {
        turtleList = JSON.parse(data);

        //Send the turtle list to the front end giving time for front end to load
        setTimeout(() => {win.webContents.send("backSendTurtleList", turtleList);}, 1500);
    });
}

//Create a new turtle data in the turtleList.json
function createNewTurtle(turtle) {
    console.log("Creating new turtle data: " + turtle.label);
    let newTurtle = {
        "label": turtle.label,
        "computerId": turtle.computerId,
        "fuel": turtle.fuel,
        "rotation": turtle.rotation,
        "x": turtle.position.x,
        "y": turtle.position.y,
        "z": turtle.position.z,
        "mapLocation": turtle.mapLocation
    }

    //Add it to the list
    turtleList.push(newTurtle);

    //Write to the turtleList file
    fs.writeFileSync(
        "./src/backend/serverFiles/TurtleData/turtleList.json",
        JSON.stringify(turtleList),
        (err) => {}
      );

      synchTurtleList();
}

//Look for the turtle in the list of turtles, if it is not there then add it to the list and write to the file
function synchTurtleData(turtle) {
    for(let i = 0; i < turtleList.length; i++) {
        let t = turtleList[i];

        if(t.label === turtle.label && t.computerId === turtle.computerId) {
            console.log("Turtle data found for: " + turtle.label);

            turtle.position.x = t.x;
            turtle.position.y = t.y;
            turtle.position.z = t.z;
            turtle.rotation = t.rotation;
            turtle.fuel = t.fuel;
            turtle.mapLocation = t.mapLocation;

            return;
        }
    }

    //If it makes it here the turtle is not found
    //Create a new turtle data
    createNewTurtle(turtle);
}

//When a websocket connects to the server create a new Turtle object passing in it's
//Corresponding WebSocket
wss.on('connection', async (ws) => {
    let turtle = new Turtle(ws);
    turtles.push(turtle);

    //Display
    console.log("Turtle connected: " + await turtle.executeAction(Actions.GETLABEL));

    //Update the turtles data
    await turtle.updateMetaData();

    //Synchs the position and name, if there is not turtle create a new one
    synchTurtleData(turtle);
});

//Pings all the turtles
//If turtle doesn't respond by next ping then remove the turtle
function pingTurtles() {
    turtles.forEach(turtle => {
        turtle.executeAction(Actions.GETLABEL).catch(e => {
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

//Update the window
function updateWin(_win) {
    win = _win;
}

module.exports = { turtles, updateWin, turtleList };
