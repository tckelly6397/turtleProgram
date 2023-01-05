const Turtle = require("../TurtleFiles/Turtle.js");
const SaveLoadManager = require("../TurtleFiles/SaveLoadManager.js");

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

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

    await turtle.executeAction(Turtle.Actions.UP);
    //Try to place turtle
    await tryToPlace(turtle, itemList[2]);

    //Give the turtle some time to boot up
    await delay(1000);
    await turtle.executeAction(Turtle.Actions.TURNONTURTLE, { "direction": "front" });

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

    let x = turtle.position.x + Math.round(Math.cos(turtle.rotation * (Math.PI/180)));
    let y = turtle.position.y;
    let z = turtle.position.z + Math.round(Math.sin(turtle.rotation * (Math.PI/180)));
    newTurtleData = SaveLoadManager.getTurtleDataByLabel(data.label, data.computerId);
    newTurtleData.x = x;
    newTurtleData.y = y;
    newTurtleData.z = z;
    newTurtleData.rotation = turtle.rotation;
    newTurtleData.mapLocation = turtle.mapLocation;

    await giveFuel(turtle);

    await turtle.executeAction(Turtle.Actions.REBOOTTURTLE, { "direction": "front" });
    await turtle.executeAction(Turtle.Actions.DOWN);
    //Give it a second to reboot
    await delay(1000);

    SaveLoadManager.updateTurtleByData(newTurtleData);
    await turtle.executeAction(Turtle.Actions.DIGFORWARD);

    await turtle.updateInventory();
}

module.exports = { Replicate };