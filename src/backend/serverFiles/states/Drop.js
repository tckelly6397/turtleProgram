const Turtle = require('../Turtle.js');

//direction: Up Down Forward
async function DropAll(turtle, direction) {
    for(let i = 0; i < 16; i++) {
        //If a item exists
        if(turtle.inventory[i] != undefined) {
            await turtle.executeAction(Turtle.Actions.SELECTITEM, i + 1)
            await turtle.executeAction("drop" + direction);
        }
    }
}

//Drop all the items with a filter of what not to drop
//direction: Up Down Forward
async function DropAllFilter(turtle, direction, filter) {

    for(let i = 0; i < 16; i++) {
        //Get the item from selected slot
        let item = turtle.inventory[i];

        //If the item is not in the filter then drop it
        if(item != undefined && filter.indexOf(item.label) == -1) {
            await turtle.executeAction(Turtle.Actions.SELECTITEM, i + 1)
            await turtle.executeAction("drop" + direction);
        }
    }
}

module.exports = { DropAll, DropAllFilter };