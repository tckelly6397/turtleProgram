/*
Craft:
	Arguments: item-name count
	Get item list from json file
	Check if it has necessary items
    Check max item crafting
	If Place chest is false
		Mine forward
		Place chest
	Sort inventory
	Empty inventory(all, filter: [necessary items])
	Transfer Inventory side rows
	--Transfer siderows crafting recipe at max crafting amount
	Empty(side rows)
	Craft item-name (count > max amount ? count : max amount)
	Suck all chest
	Dig chest
*/

/*=========================== Imports ===========================*/
const fs = require('fs');
const Drop = require('./Drop.js');
const SortInventory = require('./SortInventory.js');
const TransferItems = require('./TransferItems.js');
const Turtle = require('../TurtleFiles/Turtle.js');

/*=========================== Variables ===========================*/
//Location of recipes
const recipeDir = "./src/backend/resources/Crafting-Recipes/";

/*=========================== Functions ===========================*/
//A map of item names to recipe location
const recipeLocations = {
	"computer_normal": recipeDir + "computer.json",
	"turtle_normal": recipeDir + "turtle.json",
	"chest": recipeDir + "chest.json",
	"crafting_table": recipeDir + "crafting_table.json",
	"diamond_pickaxe": recipeDir + "diamond_pickaxe.json",
	"disk_drive": recipeDir + "disk_drive.json",
	"floppy_disk": recipeDir + "floppy_disk.json",
	"full_turtle": recipeDir + "full_turtle.json",
	"furnace": recipeDir + "furnace.json",
	"glass_pane": recipeDir + "glass_pane.json",
	"oak_planks": recipeDir + "oak_planks.json",
	"sticks": recipeDir + "sticks.json"
}

//Get the minimum number from the list
function getMin(list) {
	let min = list[0];

	for(let i = 1; i < list.length; i++) {
		let value = list[i];

		if(value < min) {
			min = value;
		}
	}

	return min;
}

//Loop through an inventory searching for a item and return the total amount of the item
function getCountOfItemFromInventory(name, inventory) {
	let sum = 0;

	//Loop through the inventory
	inventory.forEach(item => {
		//If the item is equal to what we're searching for then add its count to the sum
		if(item != undefined && item.label == name) {
			sum += item.count;
		}

	});

	return sum;
}

//Gets the data of a item in a recipe in a more readable way
function getKeyData(key, name, itemMap) {
	let data = {
		"name": name,
		"count": 0,
		"slots": []
	};

	let slot = 1;
	for(let i = 0; i < itemMap.length; i++) {

		if(itemMap[i] == key) {
			data.count++;
			data.slots.push(slot);
		}

		//Increment slot
		//If its a edge increment by 2 so that it corresponds to the turtles inventory
		if((i + 1) % 3 == 0) {
			slot += 2;
		} else {
			slot += 1;
		}
	}

	return data;
}

//Gets all the keyData from the recipeData
function getKeyDataList(recipeData) {
	let keyData = [];
	let items = recipeData.items;

	//Sort out the itemMap into keyData to make it more readable
	for(const key in items) {
		let itemMap = recipeData.map;
		let items = recipeData.items;

		keyData.push(getKeyData(key, items[key], itemMap));
	}

	return keyData;
}

//Taking in keyData list return a list of their names
function getItemNamesAsList(keyData) {
	let nameList = [];

	keyData.forEach(key => {
		nameList.push(key.name);
	});

	return nameList;
}

//Return transfer data based on a transfer key and locations within the inventory
function getTransferData(keyData, maxCraft, inventory) {
	let data = {
		"name": keyData.name,
		"amount": maxCraft,
		"toSlots": keyData.slots,
		"fromSlots": []
	}

	//Loop through the inventory
	for(let i = 0; i < inventory.length; i++) {
		let item = inventory[i];

		//If you find the search for item add its location to the toSlots list
		if(item != undefined && item.label == keyData.name) {
			let itemData = {
				"count": item.count,
				"slot": i + 1
			}
			data.fromSlots.push(itemData);
		}
	}

	return data;
}

async function loadRecipe(name) {
	let data;
	try {
		data = await fs.readFileSync(recipeLocations[name]);
	} catch(err) {
		console.log("Error found: " + err);
		return;
	}

	return JSON.parse(data);
}

//Maybe check if chest is already in front and if so don't place chest?
//Edge case: If the chest in front already has items this will break the algorithm
async function tryToPlaceChest(turtle) {
	//Select the chest
	let selectChest = await turtle.selectItemByName("minecraft:chest");
	if(selectChest == false) {
		console.log("Chest not found.");
		return false;
	}

	//Try to place the chest
	let placeForward = await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
	if(placeForward == false) {
		await turtle.executeAction(Turtle.Actions.DIGFORWARD);
		await turtle.executeAction(Turtle.Actions.PLACEFORWARD);
	}

	return true;
}

function getMaxCraft(amount, keyData, inventory) {
	//Holds a list of each keys max craft amount
	let maxCraftList = [];

	//For each key data look in the turtles inventory
	keyData.forEach(key => {
		let value = Math.floor(getCountOfItemFromInventory(key.name, inventory) / key.count);
		maxCraftList.push(value);
	});

	//Get the minimum max crafting from the maxCraftList, thats the minimum for the whole craft
	let maxCraft = getMin(maxCraftList);
	amount = amount > maxCraft ? maxCraft : amount;

	return amount;
}

async function transferAlgorithm(turtle, keyData, inventory, amount) {
	//Transfer to the side slots
	await TransferItems.TransferItems(turtle, TransferItems.DefinedSlots.SideSlots);

	//Transfer items to their correct spots
	//Creates transfer data and sends it to the Transfer class
	//Max craft is the amount of items to put in each slot
	for(const key of keyData) {
		let transferData = getTransferData(key, amount, inventory);
		await TransferItems.TransferSpecificItem(turtle, transferData);
	}

	await Drop.DropAllFilter(turtle, "Forward", Drop.DefinedSlots.SideSlots);
}

//If it successfully crafts return true
async function Craft(turtle, name, amount) {
	//Update the inventory
	await turtle.updateInventory();

	//Read in the file data
	let recipeData = await loadRecipe(name);

	//Place Chest
	let chestPlaced = await tryToPlaceChest(turtle);
	if(chestPlaced == false) {
		console.log("Cancelling craft...");
		return false;
	}

	//Holds all the sorted data of the recipe
	let keyData = getKeyDataList(recipeData);
	let inventory = turtle.inventory;

	//Get the maximum allowed crafting amount
	amount = getMaxCraft(amount, keyData, inventory);

	//Display and destroy chest
	if(amount == 0) {
		console.log("Not all items are present.");
		await turtle.executeAction(Turtle.Actions.DIGFORWARD);
		return false;
	} else {
		console.log("Starting to craft: " + amount);
	}

	//Sort the inventory
	await SortInventory.SortWithChest(turtle, "Forward");

	//Drop all the items except for necessary items
	let filter = getItemNamesAsList(keyData);
	await Drop.DropAllFilter(turtle, "Forward", filter);

	//Transfer
	await transferAlgorithm(turtle, keyData, inventory, amount);

	let args = {
		"amount": amount
	}
	//Craft
	await turtle.executeAction(Turtle.Actions.CRAFT, args);

	//Pickup chest and items
	await turtle.executeAction(Turtle.Actions.DIGFORWARD);

	//Update the inventory
	await turtle.updateInventory();

	return true;
}

module.exports = { Craft, recipeLocations };