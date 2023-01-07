const Turtle = require("../TurtleFiles/Turtle.js");
const SaveLoadManager = require("./SaveLoadManager.js");

//The block filter
const excludeBlockFilter = [
    "minecraft:chest", "computercraft:turtle_normal", "computercraft:turtle_advanced", "computercraft:disk_drive", "computercraft:speaker",
    "computercraft:monitor_normal", "computercraft:monitor_advanced", "minecraft:hopper"
];
//Can do a include block list, just an idea

//Call detect on the turtle and send the data to the frontend
//Returns the list of detected blocks
async function detectAll(turtle, win) {
    let jsonData = await turtle.detect();

    //Send to the save load manager
    SaveLoadManager.updateLocalWorld(turtle, jsonData);

    //If win is provided then send it to the front end
    if(win != undefined) {
        win.webContents.send("detected", jsonData);
    }

    return jsonData;
}

//Check the filter given a coordinate and a map
function checkFilter(x, y, z, map) {
    //Loop through the turtle's map and find the corresponding block
    for(let i = 0; i < map.length; i++) {
        let block = map[i];

        //If the block is found then check it
        if(block.x == x && block.y == y && block.z == z) {

            //If the name is within the excludeBlockFilter list then don't dig and return false
            if(excludeBlockFilter.indexOf(block.name) != -1) {
                return false;
            }
            break;
        }
    }
}

//Given a turtle, the action and should it abide by the exclude block filter
async function dig(turtle, action, overrideBlockFilter, win) {
    let map = SaveLoadManager.LocalWorldMap.get(turtle.mapLocation);
    let digAction;
    let deltaX = 0;
    let deltaY = 0;
    let deltaZ = 0;

    //Apply the corresponding dig action
    if(action == Turtle.Actions.UP) {
        digAction = Turtle.Actions.DIGUP;
        deltaY = 1;
    } else if(action == Turtle.Actions.DOWN) {
        digAction = Turtle.Actions.DIGDOWN;
        deltaY = -1;
    } else if(action == Turtle.Actions.FORWARD) {
        digAction = Turtle.Actions.DIGFORWARD;
        deltaX = Math.round(Math.cos(turtle.rotation * (Math.PI/180)));
        deltaZ = Math.round(Math.sin(turtle.rotation * (Math.PI/180)))
    } else {
        console.log("INVALID ACTION");
        return false;
    }

    //Check the block filter if overriding it is false
    if(!overrideBlockFilter) {
        let x = turtle.position.x + deltaX;
        let y = turtle.position.y + deltaY;
        let z = turtle.position.z + deltaZ;
        let filter = checkFilter(x, y, z, map);

        if(filter == false) {
            return false;
        }
    }

    //If it made it past the filter then dig
    await turtle.executeAction(digAction);
    SaveLoadManager.updateLocalWorld(turtle, await detectAll(turtle, win));
}

module.exports = { excludeBlockFilter, detectAll, dig };