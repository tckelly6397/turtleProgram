/*=========================== Imports ===========================*/
const server = require("./server.js");
const fs = require('fs');
const { ipcMain } = require('electron');
const SaveLoadManager = require('./SaveLoadManager');

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

function updateTurtleData() {
  let data = selectedTurtle.getTurtleData();

  win.webContents.send("updateTurtleData", JSON.stringify(data));
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

/*=========================== Events ===========================*/
ipcMain.on("frontAction", async (event, args) => {
  await selectedTurtle.executeAction(args);

  //When you move update the turtle position
  updateTurtleData();

  //On movement detect
  detectAll();
});

//When called return world data
ipcMain.on("frontSynchWorld", (event, args) => {
  //syncWorld();
});

//Save selected turtle data
ipcMain.on("frontUpdateWorld", (event, args) => {
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