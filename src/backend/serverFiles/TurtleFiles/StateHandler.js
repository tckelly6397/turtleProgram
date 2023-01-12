/*=========================== Imports ===========================*/
const { SuckAll } = require('../states/Suck.js');
const { DropAll, DropAllFilter, DropSlots } = require('../states/Drop.js');
const { TransferItems, TransferSpecificItem } = require('../states/TransferItems.js');
const { Craft } = require('../states/Craft.js');
const { Replicate } = require('../states/Replicate.js');
const { Pathfind } = require('../states/Pathfind.js');
const { Build } = require('../states/BuildSelection.js');
const { Sort, SortWithChest } = require('../states/SortInventory.js');
const { Smelt } = require('../states/Smelt.js');

/*=========================== Functions ===========================*/
/*
async function Build(turtle, argument, win) {
    await BuildSelection.Build(turtle, argument, win);
}

async function Craft(turtle, argument, amount) {
    await Craft.Craft(turtle, argument, amount);
}

async function Pathfind(turtle, x, y, z, win, canMine, canMinePlacedByTurtle) {
    await Pathfind.Pathfind(turtle, x, y, z, win, canMine, canMinePlacedByTurtle);
}

async function Drop(turtle, direction) {
    await Drop.Drop(turtle, direction);
}

async function Replicate() {
    await Replicate.Replicate();
}

async function Smelt() {
    await Smelt.Smelt();
}

async function Sort() {
    await SortInventory.Sort();
}

async function Suck() {
    await Suck.Suck();
}

async function TransferItems() {
    await TransferItems.TransferItems
}
*/

module.exports = { Build, Craft, Pathfind, Replicate, Smelt, SortWithChest, Sort, SuckAll, TransferItems, TransferSpecificItem, DropAll, DropAllFilter, DropSlots };