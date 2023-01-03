/*=========================== Imports ===========================*/
const server = require("./server.js");
const { ipcMain } = require('electron');
const SaveLoadManager = require('./SaveLoadManager');
const Turtle = require('./Turtle.js');
const prompt = require('electron-prompt');

/*=========================== Variables ===========================*/
let win;
let selectedTurtle;

/*=========================== Util Functions ===========================*/
//Call detect on the turtle and send the data to the frontend
function detectAll() {
  let jsonData = selectedTurtle.detect();
  jsonData.then((data) => {
    win.webContents.send("detected", data);

    //Send to the save load manager
    SaveLoadManager.updateLocalWorld(selectedTurtle, data);
  });
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

  win.webContents.send("backSynchWorldData", newData);
}

//Update the window
function updateWin(_win) {
  win = _win;
}

//If called then ask user for type of block to place, it will look for the block and select it
//then place it update update the data
async function placeAction(action) {
  prompt({
    title: 'Place block',
    label: 'Name',
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
        console.log('result', r);
        let flag = await selectedTurtle.selectItemByName(r);

        if(flag) {
          await selectedTurtle.executeAction(action);

          await updateData();
        } else {
          console.log("Block not found.");
        }
    }
  })
  .catch(console.error);
}

async function updateData() {
  //Update the slot
  await selectedTurtle.updateSelectedSlot();

  win.webContents.send("updateTurtleData", JSON.stringify(selectedTurtle.getTurtleData()));

  //On movement detect
  detectAll();
}

/*=========================== Events ===========================*/
ipcMain.on("frontAction", async (event, args) => {
  let data = JSON.parse(args);

  //If it's a place action and the argument is true then ask for block name
  if(data.args == 'true' && (data.action == "placeForward" || data.action == "placeUp" || data.action == "placeDown")) {
    placeAction(data.action);
  } else {
    await selectedTurtle.executeAction(data.action, data.args);
  }
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

module.exports = { updateWin };