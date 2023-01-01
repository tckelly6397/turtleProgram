/*
* Handles reading and writing to files
* Keeps track of current world data
*/

/*=========================== Imports ===========================*/
const fs = require('fs');

/*=========================== Variables ===========================*/
let turtleList;
let WorldData;

/*=========================== Functions ===========================*/
function initialize() {
    synchTurtleList();
}

function update() {
    synchTurtleList();
}

//Takes in a turtle class and a turtle json and checks if equal
function isTurtlesEqual(turtleClass, turtleData) {
    if(turtleClass.label === turtleData.label && turtleClass.computerId === turtleData.computerId) {
      return true;
    } else {
      return false;
    }
}

//Gets data from turtleList.json and applies it to the local turtleList
function synchTurtleList() {
    fs.readFile("./src/backend/serverFiles/TurtleData/turtleList.json", (err, data) => {
        turtleList = JSON.parse(data);
    });
}

function updateTurtleList() {
    fs.writeFile("./src/backend/serverFiles/TurtleData/turtleList.json", turtleList);
}

//Gets the data in turtleList corresponding to the passed in turtle
function getTurtleData(Turtle) {

    for(let i = 0; i < turtleList.length; i++) {
        let turtleData = turtleList[i];

        if(isTurtlesEqual(Turtle, turtleData)) {
            return turtleData;
        }
    }
}

//Reads in a file location and sets the local world data to the corresponding data
function loadLocalWorld(Turtle) {
    let worldName = Turtle.mapLocation;

    fs.readFile("./src/backend/serverFiles/worlds/" + worldName, (data) => {
        this.WorldData = data;
    });
}

//Updates the local world data
//Takes in a list of blocks and updates the world data with those blocks
//If the block is air then remove the block from the world data
//Else add it to the local world data
function updateLocalWorld(blocks) {
    
}

//Takes the local data and stores it in the correct map location based on the passed in turtle
//Also saves the turtleData to the list of turtles
function saveWorld(Turtle) {
    let worldName = Turtle.mapLocation;

    fs.writeFile("./src/backend/serverFiles/worlds/" + worldName, WorldData);

    //Get reference to location of turtle data
    let turtleData = getTurtleData(Turtle);

    //Update the turtle data
    turtleData = Turtle.getTurtleData();

    fs.writeFile("./src/backend/serverFiles/TurtleData/turtleList.json", turtleList);
}

module.exports = { initialize, update };