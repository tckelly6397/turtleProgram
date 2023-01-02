/*
* Creates a WebSocketServer. Whenever a client connects it creates a new object with the corresponding data allowing for
* the server to send data to each client.
*/

/*=========================== Imports ===========================*/
const { WebSocketServer } = require("ws");
const { Turtle, Actions } = require("./Turtle.js");
const SaveLoadManager = require("./SaveLoadManager.js");
const fs = require('fs');

/*=========================== Variables ===========================*/
const port = 2553;
const wss = new WebSocketServer({port});
let turtles = [];
let turtleList;
let win;

//Display the server is running
console.log(`Listening at ${port}...`);

//Update local turtleList
synchTurtleList();

//Begin pinging turtles
pingTurtles();

/*=========================== functions ===========================*/
//Update the local window
function updateWin(_win) {
    win = _win;
}

//Gets data from turtleList.json and applies it to the local turtleList
function synchTurtleList() {
    fs.readFile("./src/backend/serverFiles/TurtleData/turtleList.json", (err, data) => {
        if(data == undefined) {
            turtleList = [];
        } else {
            turtleList = JSON.parse(data);
        }
        SaveLoadManager.initialize(turtleList);

        //Send the turtle list to the front end giving time for front end to load
        setTimeout(() => {win.webContents.send("backSendTurtleList", turtleList);}, 1500);
    });
}

//Create a new turtle data in the turtleList.json
function createNewTurtle(turtle) {
    console.log("Creating new turtle data: " + turtle.label);

    //Add it to the list
    turtleList.push(turtle.getTurtleData());
    win.webContents.send("backSendTurtleList", turtleList);

    //Write to the turtleList file
    fs.writeFile(
        "./src/backend/serverFiles/TurtleData/turtleList.json",
        JSON.stringify(turtleList),
        (err) => {
            if(err) throw err;
            else {
                SaveLoadManager.update(turtle.getTurtleData());
            }
        }
    );
}

//Look for the turtle in the list of turtles
//If the turtle is there then update its data
//If the turtle is not there then create a new data in the list of turtles and write to the file
function synchTurtleData(turtle) {
    for(let i = 0; i < turtleList.length; i++) {
        let t = turtleList[i];

        if(t.label === turtle.label && t.computerId === turtle.computerId) {
            console.log("Turtle data found for: " + turtle.label);

            //Applying the new data
            turtle.position.x = t.x;
            turtle.position.y = t.y;
            turtle.position.z = t.z;
            turtle.fuel = t.fuel;
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

//Pings all the turtles
//If turtle doesn't respond by next ping then remove the turtle
function pingTurtles() {
    turtles.forEach(turtle => {
        turtle.executeAction(Actions.GETLABEL).catch(e => {
            console.log("Turtle disconnected: " + turtle.label);

            //Save the turtle
            SaveLoadManager.saveTurtle(turtle);
            //Remove the turtle
            const index = turtles.indexOf(turtle);
            if (index > -1) {
                turtles.splice(index, 1);
            }
        });
    });

    setTimeout(pingTurtles, 2000);
}

/*=========================== WebSocket Connection ===========================*/

//When a websocket connects to the server create a new Turtle object passing in it's
//corresponding WebSocket
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

module.exports = { turtles, updateWin, turtleList };
