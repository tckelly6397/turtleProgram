/*
* Handles reading and writing to files
* Keeps track of current list of turtles
* and a list of local world data
*/

/*=========================== Imports ===========================*/
const { Console } = require('console');
const fs = require('fs');

/*=========================== Variables ===========================*/
let turtleList;
const worldsDir = './src/backend/resources/worlds/';
const turtleListPath = './src/backend/resources/TurtleData/turtleList.json';

//Maps a world name to local world data
let LocalWorldMap = new Map();

/*=========================== Functions ===========================*/
//Initialize turtleList and localWorld lists
function initialize(_turtleList) {
    turtleList = _turtleList;

    //Updates the turtle map in full
    for(let i = 0; i < turtleList.length; i++) {
        let turtle = turtleList[i];

        loadLocalWorld(turtle);
    }
}

//On new turtle update the turtle
function update(turtleData) {
    //Updates the local world map
    loadLocalWorld(turtleData);
}

//Takes in a turtle class and a turtle json and checks if equal
function isTurtlesEqual(turtleClass, turtleData) {
    if(turtleClass.label === turtleData.label && turtleClass.computerId === turtleData.computerId) {
      return true;
    } else {
      return false;
    }
}

function updateTurtleList() {
    fs.writeFileSync(turtleListPath, JSON.stringify(turtleList), (err) => {
        return null;
    });
}

//Gets the data in turtleList corresponding to the passed in turtle
function getTurtleIndex(Turtle) {

    for(let i = 0; i < turtleList.length; i++) {
        let turtleData = turtleList[i];

        if(isTurtlesEqual(Turtle, turtleData)) {
            return i;
        }
    }
}

//Check if two block positions are equal
function equalBlock(block, x, y, z) {
    if(block.x == x && block.y == y && block.z == z) {
        return true;
    }

    return false;
}

//Return a block if found
//Return -1 if not
function getBlockByPosition(WorldData, x, y, z) {
    for(let i = 0; i < WorldData.length; i++) {
        let block = WorldData[i];

        if(equalBlock(block, x, y, z)) {
            return block;
        }
    }

    return -1;
}

//Adds a block to the list
function addBlock(worldName, block) {
    let WorldData = LocalWorldMap.get(worldName);
    let oldBlock = getBlockByPosition(WorldData, block.x, block.y, block.z);

    if(oldBlock != -1 && oldBlock.name != block.name) {
        removeBlock(worldName, block.x, block.y, block.z);
    }

    if(oldBlock == -1) {
        let dataBlock = {"name": block.name, "x": block.x, "y": block.y, "z": block.z}
        WorldData.push(dataBlock);
    }
}

//Takes an x and y coordinate and if there is a block in the world data with those coordinates
//then remove t
function removeBlock(worldName, x, y, z) {
    let WorldData = LocalWorldMap.get(worldName);

    for(let i = 0; i < WorldData.length; i++) {
        let block = WorldData[i];

        //If they're equal then remove the block
        if(equalBlock(block, x, y, z)) {
            WorldData.splice(i, 1);
        }
    }
}

//Reads in a file location and sets the local world data to the corresponding data
function loadLocalWorld(Turtle) {
    let worldName = Turtle.mapLocation;

    //If the world data isn't already found then add it to the map
    if(LocalWorldMap.get(worldName) == undefined) {
        fs.readFile(worldsDir + worldName, function read(err, data) {
            if(err) {
                LocalWorldMap.set(worldName, []);
                return;
            }
            LocalWorldMap.set(worldName, JSON.parse(data));
        });
    }
}

//Updates the local world data
//Takes in a list of blocks and updates the world data with those blocks
//If the block is air then remove the block from the world data
//Else add it to the local world data
function updateLocalWorld(Turtle, blocks) {
    let worldName = Turtle.mapLocation;
    blocks = JSON.parse(blocks);

    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        //If the block is air try and remove it, else add it to the list
        if(block.name == 'air') {
            removeBlock(worldName, block.x, block.y, block.z);
        } else {
            addBlock(worldName, block);
        }
    }

    updateTurtle(Turtle);
}

//Given a turtle, update turtle data
function updateTurtle(Turtle) {
    //Get reference to location of turtle data
    let turtleIndex = getTurtleIndex(Turtle);

    //Update the turtle data
    turtleList[turtleIndex] = Turtle.getTurtleData();
}

//Given a turtle label and id, return the corresponding data
function getTurtleIndexByLabel(label, id) {
    for(let i = 0; i < turtleList.length; i++) {
        let turtleData = turtleList[i];

        if(label == turtleData.label && id == turtleData.computerId) {
            return i;
        }
    }
}

//Update a turtleData given a turtleData
function updateTurtleByData(turtleData) {
    //Get reference to location of turtle data
    let turtleIndex = getTurtleIndexByLabel(turtleData.label, turtleData.computerId);

    //Update the turtle data
    turtleList[turtleIndex] = turtleData;
}

function getTurtleDataByLabel(label, id) {
    for(let i = 0; i < turtleList.length; i++) {
        let turtleData = turtleList[i];

        if(label == turtleData.label && id == turtleData.computerId) {
            return turtleData;
        }
    }

    return undefined;
}

//Takes the local data and stores it in the correct map location
async function saveWorld(worldName, worldData) {
    if(worldData.length == 0) {
        return;
    }

    console.log("Saving " + worldName + " data.");
    await fs.writeFileSync(worldsDir + worldName, JSON.stringify(worldData), (err) => {
        return null;
    });
}

//Saves all the worlds in the map as well as the saves the turtleList
async function saveWorlds() {
    console.log("Saving all...");
    for (let [key, value] of LocalWorldMap) {
        await saveWorld(key, value);
    }

    updateTurtleList();
}

//Save a turtle
//Updates the turtle as well as the turtle map
/*
* Very useful for saving any turtle
*/
function saveTurtle(Turtle) {
    saveWorld(Turtle.mapLocation, LocalWorldMap.get(Turtle.mapLocation));
    updateTurtle(Turtle);
    updateTurtleList();
}

//Get the world data by name
function getWorldData(worldName) {
    return LocalWorldMap.get(worldName);
}

module.exports = { initialize, update, updateTurtle, updateLocalWorld, saveWorlds, saveTurtle, getWorldData, getTurtleDataByLabel, updateTurtleByData, updateTurtleList, LocalWorldMap };

//Usage
//initialize(list): read in the turtle list and apply it to the local list as well as loading in the local world map data
//update(turtle): takes in a turtleJSON and updates its map data
//updateTurtle(Turtle): Update the local turtle json data
//updateLocalWorld(Turtle, blocks): Updates the local world data and turtle data
//saveWorlds(): Saves all the worlds and turtles data

//Call initialize on startup
//Call update whenever a new turtle connects
//Call updateLocalWorld whenever a turtle moves
//Call saveWorlds on exit