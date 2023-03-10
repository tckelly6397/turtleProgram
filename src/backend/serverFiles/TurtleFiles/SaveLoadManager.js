/*
* Handles reading and writing to files
* Keeps track of current list of turtles
* and a list of local world data
*/

/*=========================== Imports ===========================*/
const fs = require('fs');

/*=========================== Variables ===========================*/
let turtleList;
const worldsDir = './src/backend/resources/worlds/';
const selectionDir = './src/backend/resources/selections/';
const turtleListPath = './src/backend/resources/TurtleData/turtleList.json';
let win;

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
function getTurtleIndex(turtle) {

    for(let i = 0; i < turtleList.length; i++) {
        let turtleData = turtleList[i];

        if(isTurtlesEqual(turtle, turtleData)) {
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
        let dataBlock = {"name": block.name, "x": block.x, "y": block.y, "z": block.z, "placedByTurtle": block.placedByTurtle}
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
function loadLocalWorld(turtle) {
    let worldName = turtle.mapLocation;

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
function updateLocalWorld(turtle, blocks, updateVisual) {
    let worldName = turtle.mapLocation;
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

    updateTurtle(turtle);

    if(updateVisual) {
        win.webContents.send("detected", JSON.stringify(blocks));
    }
}

//Given a turtle, update turtle data
function updateTurtle(turtle) {
    //Get reference to location of turtle data
    let turtleIndex = getTurtleIndex(turtle);

    //Update the turtle data
    turtleList[turtleIndex] = turtle.getTurtleData();
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
function saveTurtle(turtle) {
    console.log("Saving " + turtle.label + " data");
    saveWorld(turtle.mapLocation, LocalWorldMap.get(turtle.mapLocation));
    updateTurtle(turtle);

    //Writes it to the file
    updateTurtleList();
}

//Get the world data by name
function getWorldData(worldName) {
    return LocalWorldMap.get(worldName);
}

//Get a block given a coordiante and a map
//Return -1 if a block is not found
function getBlock(turtle, x, y, z) {
    let map = LocalWorldMap.get(turtle.mapLocation);
    for(let i = 0; i < map.length; i++) {
        let block = map[i];

        let checkX = x; //+ Math.round(Math.cos(turtle.rotation * (Math.PI/180)));
        let checkY = y;
        let checkZ = z; //+ Math.round(Math.sin(turtle.rotation * (Math.PI/180)));

        if(block.x == checkX && block.y == checkY && block.z == checkZ) {
            return block;
        }
    }

    return -1;
}

function getMinFromList(list, value) {
    let min = list[0][value];

    for(let i = 1; i < list.length; i++) {
        if(list[i][value] < min) {
            min = list[i][value];
        }
    }

    return min;
}

function isBlockInList(block, blocks) {
    for(let i = 0; i < blocks.length; i++) {
        let b = blocks[i];

        if(block.x == b.x && block.y == b.y && block.z == b.z) {
            console.log("WORKING");
            return true;
        }
    }

    return false;
}

//Save a selection
async function saveSelection(selections, name, mapLocation) {
    console.log("Saving selection " + name);
    let worldData = LocalWorldMap.get(mapLocation);
    let data = {
        "blocks": [],
        "blockCount": {}
    }

    let absMinX = getMinFromList(selections, 'x');
    let absMinY = getMinFromList(selections, 'y');
    let absMinZ = getMinFromList(selections, 'z');
    //Increment by two getting the selection to make the outline of what is selected
    for(let i = 0; i + 2 <= selections.length; i+=2) {
        let select1 = selections[i];
        let select2 = selections[i + 1];
        let minX = Math.min(select1.x, select2.x);
        let minY = Math.min(select1.y, select2.y);
        let minZ = Math.min(select1.z, select2.z);
        let deltaX = Math.abs(select1.x - select2.x) + 1;
        let deltaY = Math.abs(select1.y - select2.y) + 1;
        let deltaZ = Math.abs(select1.z - select2.z) + 1;

        let offsetX = 0;
        let offsetZ = 0;
        for(let y = 0; y < deltaY; y++) {
            for(let x = 0; x < deltaX; x++) {
                for(let z = 0; z < deltaZ; z++) {
                    let block = getBlockByPosition(worldData, x + minX, y + minY, z + minZ);

                    if(block == -1) {
                        continue;
                    }

                    let blockData = {
                        "name": block.name,
                        "x": x + minX - absMinX,
                        "y": y + minY - absMinY,
                        "z": z + minZ - absMinZ
                    }
                    if(!isBlockInList(blockData, data.blocks)) {
                        data.blocks.push(blockData);
                    }

                    if(data.blockCount[block.name] == undefined) {
                        data.blockCount[block.name] = 0;
                    }
                    data.blockCount[block.name] += 1;
                }
                if(offsetZ == 0) {
                    offsetZ = -1 * (deltaZ - 1);
                } else {
                    offsetZ = 0;
                }
            }
            if(offsetX == 0) {
                offsetX = -1 * (deltaX - 1);
            } else {
                offsetX = 0;
            }
        }
    }

    await fs.writeFileSync(selectionDir + name, JSON.stringify(data));
}

function updateWin(_win) {
    win = _win;
}

module.exports = { initialize, update, updateTurtle, updateLocalWorld, saveWorlds, saveTurtle, getWorldData, getTurtleDataByLabel, updateTurtleByData, updateTurtleList, getBlock, saveSelection, updateWin, LocalWorldMap };

//Usage
//initialize(list): read in the turtle list and apply it to the local list as well as loading in the local world map data
//update(turtle): takes in a turtleJSON and updates its map data
//updateTurtle(turtle): Update the local turtle json data
//updateLocalWorld(turtle, blocks): Updates the local world data and turtle data
//saveWorlds(): Saves all the worlds and turtles data

//Call initialize on startup
//Call update whenever a new turtle connects
//Call updateLocalWorld whenever a turtle moves
//Call saveWorlds on exit