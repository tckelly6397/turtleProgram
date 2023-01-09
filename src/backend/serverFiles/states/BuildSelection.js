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

async function Build(turtle, selectionName) {
    let data = await fs.readFileSync(selectionDir + selectionName);
    data = JSON.parse(data);
    console.log(data);

    let blocks = data.blocks;
    let blockCount = data.blockCount;

    addCoordsToBlocks(turtle, blocks);
    for(let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        await Pathfind.Pathfind(turtle, block.x, block.y, block.z, undefined, true);

        await turtle.selectItemByName(block.name);
        await turtle.executeAction(Turtle.Actions.PLACEDOWN);
        await TurtleUtil.detectAll(turtle, undefined);
    }

    console.log("Finished building: " + selectionName);
}

module.exports = { Build };