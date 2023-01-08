/*=========================== Imports ===========================*/
const Turtle = require('../TurtleFiles/Turtle.js');
const SaveLoadManager = require('../TurtleFiles/SaveLoadManager');
const { dig } = require('../TurtleFiles/TurtleUtil.js');

/*=========================== Variables ===========================*/
const oreFuelTypes = {
    "minecraft:coal_block": 80,
    "miencraft:coal": 8,
    "miencraft:charcoal": 8
}

const organicFuelTypes = {
    "miencraft:blaze_rod": 12,
    "miencraft:dried_kelp_block": 20,
    "minecraft:bamboo": 0.25
}

const woodFuelTypes = {
    "miencraft:oak_log": 1.5,
    "miencraft:spruce_log": 1.5,
    "miencraft:birch_log": 1.5,
    "miencraft:jungle_log": 1.5,
    "miencraft:acacia_log": 1.5,
    "miencraft:dark_oak_log": 1.5,
    "miencraft:mangrove_log": 1.5,
    "miencraft:crimson_stem": 1.5,
    "miencraft:warped_stem": 1.5,
    "miencraft:oak_planks": 1.5,
    "miencraft:spruce_planks": 1.5,
    "miencraft:birch_planks": 1.5,
    "miencraft:jungle_planks": 1.5,
    "miencraft:acacia_planks": 1.5,
    "miencraft:dark_oak_planks": 1.5,
    "miencraft:mangrove_planks": 1.5,
    "miencraft:crimson_planks": 1.5,
    "miencraft:warped_planks": 1.5,
}

const allFuelTypes = {
    oreFuelTypes,
    organicFuelTypes,
    woodFuelTypes
};

/*=========================== Functions ===========================*/
async function isFurnaceInFront(turtle) {
    let map = SaveLoadManager.getWorldData(turtle.mapLocation);
    let x = turtle.x + Math.round(Math.cos(turtle.rotation * (Math.PI/180)));
    let y = turtle.y;
    let z = turtle.z + Math.round(Math.sin(turtle.rotation * (Math.PI/180)));
    let block = SaveLoadManager.getBlock(x, y, z, map);

    //If a furnace is in the block in front then return
    if(block.name == "minecraft:furnace") {
        return true;
    }

    return false;
}

async function tryToPlace(turtle) {
    let placed = await turtle.executeAction(Turtle.Actions.PLACEFORWARD);

    if(placed == false) {
        let didDig = dig(turtle, Turtle.Actions.DIGFORWARD);
        if(didDig == false) {
            console.log("cannot dig here.");
            return false;
        }

        return placed = await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
    }

    return true;
}

async function getFurnace(turtle) {
    let isFurnace = await isFurnaceInFront(turtle);
    let findFurnace;

    if(isFurnace == false) {
        findFurnace = await turtle.selectItemByName("minecraft:furnace");
        let place = await tryToPlace(turtle);
        if(place == false) {
            console.log("Cannot place furnace.");
            return false;
        }
        return true;
    }

    if(!isFurnace && !findFurnace) {
        return false;
    }

    return true;
}

function getItemData(item, slot) {
    let data = {
        "name": item.label,
        "slot": slot,
        "count": item.count
    }
}

function getSmeltData(turtle, recipe, fuelType) {
    let inventory = turtle.inventory;

    //Define the smelt data
    let smeltData = {
        "input": {
            "items": [],
            "count": 0
        },
        "fuel": {
            "items": [],
            "count": 0
        }
    };

    //Loop through the inventory items
    for(let i = 0; i < inventory.length; i++) {
        let item = inventory[i];

        if(recipe == item.label) {
            let data = getItemData(item, i + 1);
            smeltData.input.items.push(data);
            smeltData.input.count += data.count;
        } else if(fuelType.get(item.label) != -1) {
            let data = getItemData(item, i + 1);
            smeltData.fuel.items.push(data);
            smeltData.fuel.count += fuelType[item.label];
        }
    }

    return smeltData;
}

//Get the minimum value gives a list of numbers
function getMin(list) {
    let min = list[0];

    for(let i = 0; i < list.length; i++) {
        let value = list[i];

        if(value < min) {
            min = value;
        }
    }

    return min;
}

//Used to move to the top of the furnace so you can access input
async function moveToTopOfFurnace(turtle) {
    const upAction = await turtle.executeAction(Turtle.Actions.UP);
    const forwardAction = await turtle.executeAction(Turtle.Actions.FORWARD);

    return (upAction && forwardAction);
}

//Used to move to the front of the furnace so you can access fuel
async function moveToFrontOfFurnace(turtle) {
    const backAction = await turtle.executeAction(Turtle.Actions.BACK);
    const downAction = await turtle.executeAction(Turtle.Actions.DOWN);

    return (backAction && downAction);
}

async function smelt(turtle, recipe, amount, fuelType) {
    //If the amount is -1 set it to smelt all it can
    if(amount == - 1) {
        amount == 9999999;
    }

    //Get the recipe
    let smeltData = getSmeltData(turtle, recipe, fuelType);

    if(smeltData.input.count == 0) {
        console.log(recipe + " not found.");
        return false;
    } else if(smeltData.fuel.count == 0) {
        console.log("No fuel found.");
        return false;
    }

    //Doing the smelting
    let maxSmelt = getMin(amount, smeltData.input.count, smeltData.fuel.count);

    if(maxSmelt == 0) {
        console.log("Unable to craft as maximum mumber of items able to be smelted is 0");
        return false;
    }

    //Furnace stuff
    let isFurnace = await getFurnace(turtle);
    if(isFurnace == false) {
        console.log("Furnace not found.");
        return false;
    }

    //Smelting

    //UNFINISHED BECAUSE 1.18.2 Fabric suck up on furnace does not get the output
}

module.exports = { smelt, oreFuelTypes, organicFuelTypes, allFuelTypes };