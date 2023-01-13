/*=========================== Imports ===========================*/
const fs = require("fs");
const Pathfind = require('./Pathfind.js');
const Turtle = require('../TurtleFiles/Turtle.js');
const TurtleUtil = require('../TurtleFiles/TurtleUtil.js');

/*=========================== Variables ===========================*/
const selectionDir = './src/backend/resources/selections/';

/**
 * Adds coordinates to a list of blocks - This function should be split up
 * @param {Turtle} turtle the turtle of which the coordinates will be changed by
 * @param {BlockData[]} blocks a list of blocks of coordinates to be changed
 */
function addCoordsToBlocks(turtle, blocks) {
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        block.x += turtle.position.x;
        block.y += turtle.position.y + 1;
        block.z += turtle.position.z;
    }
}

/*=========================== Functions ===========================*/
/**
 * Gets the position betwee two 3d coordinates
 * @param {number} x1 first x coordinate,
 * @param {number} y1 first y coordinate,
 * @param {number} z1 first z coordinate,
 * @param {number} x2 second x coordinate,
 * @param {number} y2 second y coordinate,
 * @param {number} z2 second z coordinate,
 * @returns The distance between the two 3d coordinates.
 */
function distancePos(x1, y1, z1, x2, y2, z2) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let deltaZ = z2 - z1;
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    return distance;
}

/**
 * Gets all the blocks on the same y axis
 * @param {BlockData[]} blocks the list of blocks to search through
 * @param {number} y the y axis to search on
 * @returns All the blocks on the same y axis
 */
function getBlocksOnSameY(blocks, y) {
    let newBlocks = [];

    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        if(block.y == y) {
            newBlocks.push(block);
        }
    }

    return newBlocks;
}

/**
 * Gets the closest block on the given y level
 * @param {Turtle} turtle The current turtle, used for its position
 * @param {BlockData[]} blocks the list of blocks to search through
 * @param {number} lowestY the y level to be looking on
 * @returns The block that is closest to the turtle on the given y level
 */
function getClosestBlockOnLowestY(turtle, blocks, lowestY) {
    let allBlocks = getBlocksOnSameY(blocks, lowestY);
    let closest = allBlocks[0];
    let x = turtle.position.x;
    let y = turtle.position.y;
    let z = turtle.position.z;
    let min = distancePos(x, y, z, closest.x, closest.y, closest.z);

    for(let i = 1; i < allBlocks.length; i++) {
        let block = allBlocks[i];
        let blockDist = distancePos(x, y, z, block.x, block.y, block.z);

        if(blockDist < min) {
            min = blockDist;
            closest = block;
        }
    }

    return closest;
}

/**
 * Gets the lowest y level from a list of blocks
 * @param {BlockData[]} blocks the list of blocks to search through
 * @returns the lowest y level within the list of blocks given
 */
function getLowestYFromBlocks(blocks) {
    let min = blocks[0].y;

    for(let i = 1; i < blocks.length; i++) {
        let block = blocks[i];

        if(block.y < min) {
            min = block.y;
        }
    }

    return min;
}

/**
 * The main function to be executes, given a turtle, a selection name and a window it will build a copy of the data given
 * @param {Turtle} turtle the turtle that the build function uses to build its data
 * @param {string} selectionName the name of the file that has the selection data
 * @param {Window} win the window used to display the information that the turtle is building, not necessary
 */
async function Build(turtle, selectionName, win) {
    await turtle.updateInventory();
    let data = await fs.readFileSync(selectionDir + selectionName);
    data = JSON.parse(data);

    let blocks = data.blocks;
    let blockCount = data.blockCount;
    let hasEnough = TurtleUtil.checkInventoryForItems(turtle, blockCount);

    if(!hasEnough) {
        console.log("Not enough blocks.");
        return false;
    }

    //Make all the blocks relative to the turtle
    addCoordsToBlocks(turtle, blocks);

    //While there are still blocks to be placed loop
    while(blocks.length > 0) {
        let lowestY = getLowestYFromBlocks(blocks);
        let block = getClosestBlockOnLowestY(turtle, blocks, lowestY);

        await Pathfind.Pathfind(turtle, block.x, block.y + 1, block.z, win, true, false);

        await turtle.selectItemByName(block.name);
        await TurtleUtil.dig(turtle, Turtle.Actions.DIGDOWN, false, false, win);
        await turtle.executeAction(Turtle.Actions.PLACEDOWN);

        const index = blocks.indexOf(block);
        if(index > -1) {
            blocks.splice(index, 1);
        }
    }

    console.log("Finished building: " + selectionName);
}

module.exports = { Build };