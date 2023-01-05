const Turtle = require("../TurtleFiles/Turtle.js");
const SaveLoadManager = require("../TurtleFiles/SaveLoadManager.js");

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

//Make sure our turtle has the necessary items
async function checkItems(turtle, list) {

    for(let i = 0; i < list.length; i++) {
        let itemName = list[i];

        if(await turtle.selectItemByName(itemName) == false) {
            console.log(itemName + " not found.");
            return false;
        }
    }

    return true;
}

//Try to place block
async function tryToPlace(turtle, itemName) {
    await turtle.selectItemByName(itemName);

    let placeForward = await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
    if(placeForward == false) {
        await turtle.executeAction(Turtle.Actions.DIGFORWARD);
        await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
    }
}

//Find fuel and give it to the turtle
async function giveFuel(turtle) {
    let fuelTypes = ["minecraft:coal", "minecraft:charcoal", "minecraft:coal_block", "minecraft:lava_bucket", "minecraft:oak_planks", "minecraft:oak_log"];
    let flag = false;
    let inventory = turtle.inventory;

    for(let i = 0; i < inventory.length; i++) {
        let item = inventory[i];

        //Select the fuel types location
        if(item != undefined && fuelTypes.indexOf(item.label) != -1) {
            await turtle.executeAction(Turtle.Actions.SELECTITEM, i + 1);
            flag = true;
            break;
        }
    }

    if(flag == true) {
        await turtle.executeAction(Turtle.Actions.DROPFORWARD);
    } else {
        console.log("No fuel to give.");
    }
}

//Boots up the turtle with new data
async function startUpTurtle(turtle) {
    //Give the turtle some time to boot up
    await delay(1000);
    await turtle.executeAction(Turtle.Actions.TURNONTURTLE, { "direction": "front" });

    //Try to get the new turtles name, once it's able to do so that means the turtle is on
    let data;
    let tries = 0;
    while((data = (await turtle.executeAction(Turtle.Actions.GETTURTLEDATA, { "direction": "front" }))).label == 'undefined' || data.label == undefined) {
        //Try every 150ms
        await delay(150);
        tries++;

        if(tries > 100) {
            console.log("New turtle not found error.");
            return false;
        }
    }

    //Update the turtles attributes
    let x = turtle.position.x + Math.round(Math.cos(turtle.rotation * (Math.PI/180)));
    let y = turtle.position.y;
    let z = turtle.position.z + Math.round(Math.sin(turtle.rotation * (Math.PI/180)));
    let newTurtleData = SaveLoadManager.getTurtleDataByLabel(data.label, data.computerId);
    newTurtleData.x = x;
    newTurtleData.y = y;
    newTurtleData.z = z;
    newTurtleData.rotation = turtle.rotation;
    newTurtleData.mapLocation = turtle.mapLocation;

    //Try to give the turtle fuel
    await giveFuel(turtle);

    //Reboot the turtle so that the new world data is shown
    await turtle.executeAction(Turtle.Actions.REBOOTTURTLE, { "direction": "front" });

    //Give it a second to reboot
    await delay(1000);

    //Update the turtle data
    SaveLoadManager.updateTurtleByData(newTurtleData);
}

async function Replicate(turtle) {
    let itemList = ["computercraft:disk_drive", "computercraft:disk", "computercraft:turtle_normal"];
    if((await checkItems(turtle, itemList)) == false) {
        return false;
    }

    //Try to place disk drive
    await tryToPlace(turtle, itemList[0]);

    //Try to place disk
    await turtle.selectItemByName(itemList[1]);
    await turtle.executeAction(Turtle.Actions.DROPFORWARD);

    //Move up and place a turtle
    await turtle.executeAction(Turtle.Actions.UP);
    await tryToPlace(turtle, itemList[2]);

    //Start up the turtle
    await startUpTurtle(turtle);

    //Move down and break the chest
    await turtle.executeAction(Turtle.Actions.DOWN);
    await turtle.executeAction(Turtle.Actions.DIGFORWARD);

    //Update this turtles inventory
    await turtle.updateInventory();
}

module.exports = { Replicate };