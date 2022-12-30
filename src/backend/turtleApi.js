const server = require("./serverFiles/server.js");
const fs = require('fs');
const { Vector3 } = require("three");
const { ipcMain } = require('electron');

let win;

function detectAll() {
  let jsonData = server.turtles[0].detect();
  jsonData.then((data) => {
    win.webContents.send("detected", data);
  });
}

//When called send back the turtles position
ipcMain.on("getTurtlePosition", (event, args) => {
  //If there is a turtle then continue
  if (server.turtles[0] != undefined) {
    let position = server.turtles[0].getPositionAsJSON();
    if (position != undefined && win != "undefined") {
      //Send the data
      win.webContents.send("updateTurtlePosition", position);
    }
  }
});

ipcMain.on("move", async (event, args) => {
  if (args == "forward") {
    await server.turtles[0].moveForward();
  } else if (args == "turnRight") {
    await server.turtles[0].turnRight();
  } else if (args == "turnLeft") {
    await server.turtles[0].turnLeft();
  } else if (args == "up") {
    await server.turtles[0].moveUp();
  } else if (args == "down") {
    await server.turtles[0].moveDown();
  } else if (args == "back") {
    await server.turtles[0].moveBackward();
  } else if (args == "stats") {
    console.log(server.turtles[0].getStats());
  }

  //When you move update the turtle position
  let position = server.turtles[0].getPositionAsJSON();
  win.webContents.send("updateTurtlePosition", position);

  //On movement detect
  detectAll();
});

//When called return world data
ipcMain.on("getWorld", (event, args) => {
  fs.readFile("./src/backend/worlds/exampleWorld.json", (err, data) => {
    let jsonData = JSON.parse(data);
    let jsonTurtle = jsonData.turtle;
    server.turtles[0].position = new Vector3(
      jsonTurtle.x,
      jsonTurtle.y,
      jsonTurtle.z
    );
    server.turtles[0].rotation = jsonTurtle.rotation;
    win.webContents.send("world", jsonData);
  });
});

//When called return detected blocks
ipcMain.on("detect", (event, args) => {
  detectAll();
});

//Update world
//Args are all the new blocks
ipcMain.on("updateWorld", (event, args) => {
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

function updateWin(_win) {
    win = _win;
}

module.exports = { updateWin };