/*=========================== Imports ===========================*/
const server = require('../server.js');
const { ipcMain } = require('electron');
const SaveLoadManager = require('./SaveLoadManager');
const Turtle = require('./Turtle.js');
const prompt = require('electron-prompt');
const fs = require('fs');
const StateHandler = require('./StateHandler.js');

/*=========================== Variables ===========================*/
let win;
let selectedTurtle;
const selectionDir = './src/backend/resources/selections/';

/*=========================== Util Functions ===========================*/
//Call detect on the turtle and send the data to the frontend
async function detectAll(Turtle) {
  let jsonData = await Turtle.detect();
  win.webContents.send("detected", jsonData);

  //Send to the save load manager
  SaveLoadManager.updateLocalWorld(Turtle, jsonData, false);
}

//Takes in a turtle class and a turtle json and checks if equal
function isTurtlesEqual(turtleClass, turtleData) {
  if(turtleClass.label === turtleData.label && turtleClass.computerId === turtleData.computerId) {
    return true;
  } else {
    return false;
  }
}

//Get the turtle and world data and send to front end
function syncWorld() {
  let data = SaveLoadManager.getWorldData(selectedTurtle.mapLocation);

  let newData = {
    "blocks": data,
    "turtle": selectedTurtle.getTurtleData()
  }

  win.webContents.send("backSyncWorldData", newData);
}

//Update the window
function updateWin(_win) {
  win = _win;
}

async function askPathfind(x, y, z, canMine) {
  prompt({
    title: 'Place block',
    label: 'Coords',
    value: `{ "x": ${x}, "y": ${y}, "z": ${z}, "canMine": ${canMine}}`,
    inputAttrs: {
        type: 'name'
    },
    type: 'input'
  })
  .then(async (r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
        let data = JSON.parse(r);
        await StateHandler.Pathfind(selectedTurtle, data.x, data.y, data.z, win, data.canMine, false);
    }
  })
  .catch(console.error);
}

async function getInputString(title, label) {
  let response;
  await prompt({
    title: title,
    label: label,
    value: '',
    inputAttrs: {
        type: 'name'
    },
    type: 'input'
  })
  .then(async (r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
        response = r;
    }
  })
  .catch(console.error);

  return response;
}

//Updates the turtle data as well as sends the turtle data to the front end
async function updateData() {
  //Update the slot
  await selectedTurtle.updateSelectedSlot();

  win.webContents.send("updateTurtleData", JSON.stringify(selectedTurtle.getTurtleData()));

  //On movement detect
  await detectAll(selectedTurtle);
}

/*=========================== Events ===========================*/
ipcMain.on("frontAction", async (event, args) => {
  let data = JSON.parse(args);

  //Execute the action
  await selectedTurtle.executeAction(data.action, data.args);

  //When you move update the turtle position send to front end the new data
  selectedTurtle.fuel = await selectedTurtle.executeAction(Turtle.Actions.GETFUEL);
  await updateData();
});

//Save selected turtle data
ipcMain.on("frontUpdateWorld", (event, args) => {
  console.log(selectedTurtle.getTurtleData());
  SaveLoadManager.saveTurtle(selectedTurtle);
});

//Print the list of turtles data
ipcMain.on("frontPrintAllTurtleData", (event, args) => {
  server.turtles.forEach(turtle => {
    console.log(turtle.getTurtleData());
  })
});

//Select the turtle
ipcMain.on("frontSelectTurtle", (event, args) => {
  let flag = false;

  for(let i = 0; i < server.turtles.length; i++) {
    turtleClass = server.turtles[i];
    if(isTurtlesEqual(turtleClass, args)) {
      selectedTurtle = turtleClass;
      syncWorld();
      flag = true;
    }
  }

  if(flag === false) {
    console.log(args.label + ": offline");
  }
});

//Activate state
ipcMain.on("frontState", async (event, args) => {
  let data = JSON.parse(args);
  let state = data.state;
  let argument = data.args;

  console.log(args);
  console.log(data);
  console.log(state);
  console.log(argument);

  var startTime = performance.now()

  if(state == 'suck') {
    await StateHandler.SuckAll(selectedTurtle, argument);
  } else if(state == 'drop') {
    //await Drop.DropAllFilter(selectedTurtle, argument, ["minecraft:dirt", "minecraft:stone"]); //["minecraft:dirt"]
    await StateHandler.DropAll(selectedTurtle, argument);
    //await Drop.DropSlots(selectedTurtle, argument, Drop.DefinedSlots.SideSlots);
  } else if(state == 'transfer') {
    await StateHandler.TransferItems(selectedTurtle, TransferItems.DefinedSlots.SideSlots);
  } else if(state == 'replicate') {
    await StateHandler.Replicate(selectedTurtle);
  } else if(state == 'pathfind') {
    //Don't mine
    //Move to specified path
    await StateHandler.Pathfind(selectedTurtle, 1, 0, -9, win, false, false);
  } else if(state == 'pathfindClick') {
    await askPathfind(argument.x, argument.y, argument.z, argument.canMine);
  } else if(state == 'craft') {
    await StateHandler.Craft(selectedTurtle, argument, 64);
  } else if(state == 'build') {
    await StateHandler.Build(selectedTurtle, argument, win);
  }

  var endTime = performance.now();
  console.log(`state ${state} took ${endTime - startTime} milliseconds`);

  win.webContents.send("updateTurtleData", JSON.stringify(selectedTurtle.getTurtleData()));
});

//Save selection
ipcMain.on("frontSaveSelection", async (event, args) => {
  let data = JSON.parse(args);

  let name = await getInputString("Name the file", "name");

  await SaveLoadManager.saveSelection(data, name, selectedTurtle.mapLocation);

  let files = fs.readdirSync(selectionDir);
  win.webContents.send("backSendSelectionList", JSON.stringify(files));
});

module.exports = { updateWin };