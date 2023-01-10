const fs = require("fs");
const Pathfind = require('./Pathfind.js');
const Turtle = require('../TurtleFiles/Turtle.js');
const TurtleUtil = require('../TurtleFiles/TurtleUtil.js');

const selectionDir = './src/backend/resources/selections/';

function addCoordsToBlocks(turtle, blocks) {
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        block.x += turtle.position.x;
        block.y += turtle.position.y + 1;
        block.z += turtle.position.z;
    }
}

//Gets the distance between xyz coordinates
function distancePos(x1, y1, z1, x2, y2, z2) {
    let deltaX = x2 - x1;
    let deltaY = y2 - y1;
    let deltaZ = z2 - z1;
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

    return distance;
}

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

function getLowestYFromBlocks(blocks) {
    let min = blocks[0].y;

    for(let i = 1; i < blocks.length; i++) {
        let block = blocks[i];

        if(block.y < min) {
            min = block;
        }
    }

    return min;
}

async function Build(turtle, selectionName) {
    let data = await fs.readFileSync(selectionDir + selectionName);
    data = JSON.parse(data);
    console.log(data);

    let blocks = data.blocks;
    let blockCount = data.blockCount;

    //Make all the blocks relative to the turtle
    addCoordsToBlocks(turtle, blocks);

    //While there are still blocks to be placed loop
    while(blocks.length > 0) {
        let lowestY = getLowestYFromBlocks(blocks);
        let block = getClosestBlockOnLowestY(turtle, blocks, lowestY);

        await Pathfind.Pathfind(turtle, block.x, block.y + 1, block.z, undefined, true, false);

        await turtle.selectItemByName(block.name);
        await TurtleUtil.dig(turtle, Turtle.Actions.DIGDOWN, false, false, undefined);
        await turtle.executeAction(Turtle.Actions.PLACEDOWN);

        const index = blocks.indexOf(block);
        if (index > -1) {
            blocks.splice(index, 1);
        }
    }
    /*
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        await Pathfind.Pathfind(turtle, block.x, block.y + 1, block.z, undefined, true, false);

        await turtle.selectItemByName(block.name);
        await turtle.executeAction(Turtle.Actions.PLACEDOWN);
        //await TurtleUtil.detectAll(turtle, undefined);
    }*/

    console.log("Finished building: " + selectionName);
}

module.exports = { Build };