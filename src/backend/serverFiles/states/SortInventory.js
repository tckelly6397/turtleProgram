const Drop = require('./Drop.js');
const Suck = require('./Suck.js');
const Turtle = require('../Turtle.js');

//Maybe check if chest is already in front and if so don't place chest?
//Edge case: If the chest in front already has items this will break the algorithm
async function tryToPlaceChest(turtle) {
	//Select the chest
	let selectChest = await turtle.selectItemByName("minecraft:chest");
	if(selectChest == false) {
		console.log("Chest not found.");
		return;
	}

	//Try to place the chest
	let placeForward = await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
	if(placeForward == false) {
		await turtle.executeAction(Turtle.Actions.DIGFORWARD);
		await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
	}
}

//Try sorting no matter what
async function Sort(turtle, direction) {
    await Drop.DropAll(turtle, direction);
    await Suck.SuckAll(turtle, direction);
}

//Try sorting knowing there is a chest in front of it
async function SortWithChest(turtle, direction) {
    await Drop.DropAll(turtle, direction);
    await turtle.executeAction(Turtle.Actions.DIGFORWARD);
    await turtle.updateInventory();
    await tryToPlaceChest(turtle);
}


module.exports = { Sort, SortWithChest };