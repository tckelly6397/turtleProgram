const server = require("./serverFiles/server.js");
const fs = require('fs');
const { Vector3 } = require("three");
const { ipcMain } = require('electron');

let win;

//Call detect on the turtle and send the data to the frontend
function detectAll() {
  let jsonData = server.turtles[0].detect();
  jsonData.then((data) => {
    win.webContents.send("detected", data);
  });
}

function updateTurtleData() {
  let data = server.turtles[0].getTurtleData();

  win.webContents.send("updateTurtleData", JSON.stringify(data));
}

//I dont think this needs to be async, test later I guess
ipcMain.on("frontAction", async (event, args) => {
  await server.turtles[0].executeAction(args);

  //When you move update the turtle position
  updateTurtleData();

  //On movement detect
  detectAll();
});

//When called return world data
ipcMain.on("frontSynchWorld", (event, args) => {
  fs.readFile("./src/backend/worlds/exampleWorld.json", (err, data) => {
    let jsonData = JSON.parse(data);
    let jsonTurtle = jsonData.turtle;
    server.turtles[0].position = new Vector3(
      jsonTurtle.x,
      jsonTurtle.y,
      jsonTurtle.z
    );
    server.turtles[0].rotation = jsonTurtle.rotation;
    server.turtles[0].fuel = jsonTurtle.fuel;
    server.turtles[0].computerId = jsonTurtle.computerId;
    win.webContents.send("backSynchWorldData", jsonData);
  });
});

//Update world
//Args are all the new blocks
ipcMain.on("frontUpdateWorld", (event, args) => {
  let worldD = {
    turtle: {
      label: server.turtles[0].label,
      computerId: server.turtles[0].computerId,
      fuel: server.turtles[0].fuel,
      rotation: server.turtles[0].rotation,
      x: server.turtles[0].position.x,
      y: server.turtles[0].position.y,
      z: server.turtles[0].position.z,
    },
    WorldData: {
      blocks: args,
    },
  };

  fs.writeFile(
    "./src/backend/worlds/exampleWorld.json",
    JSON.stringify(worldD),
    (err) => {}
  );
});

//Print the turtle data
ipcMain.on("frontPrintAllTurtleData", (event, args) => {

  server.turtles.forEach(turtle => {
    console.log(turtle.getStats());
  })
});

function updateWin(_win) {
    win = _win;
}

module.exports = { updateWin };