/*
* Creates the Electron application and window
*/

//Server is used to seperate files to be more organized, still running the server file
const server = require("./serverFiles/server.js");
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const fs = require('fs');
const { Vector3 } = require("three");

var win;

function createWindow () {
  win = new BrowserWindow({
    useContentSize: true,
    width: 800,
    height: 600,

    // The lines below solved the issue
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
  })

  win.loadFile(`./src/frontend/index.html`);

  // main process
  win.webContents.send('store-data', "data");
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//When called send back the turtles position
ipcMain.on("getMap", (event, args) => {

  //If there is a turtle then continue
  if(server.turtles[0] != undefined) {
      let position = server.turtles[0].getPositionAsJSON();
      if(position != undefined && win != 'undefined') {

        //Send the data
        win.webContents.send("updatedMap", position);
      }
  }
});

ipcMain.on("move", (event, args) => {
  if(server.turtles[0].isBusy() === false) {
  if(args == "forward") {
    server.turtles[0].moveForward();
  } else if(args == "turnRight") {
    server.turtles[0].turnRight();
  } else if(args == "turnLeft") {
    server.turtles[0].turnLeft();
  } else if(args == "up") {
    server.turtles[0].moveUp();
  } else if(args == "down") {
    server.turtles[0].moveDown();
  } else if(args == "back") {
    server.turtles[0].moveBackward();
  } else if(args == "stats") {
    console.log(server.turtles[0].getStats());
  }
  }
});

//When called return world data
ipcMain.on("getWorld", (event, args) => {
  fs.readFile('./src/backend/worlds/exampleWorld.json', (err, data)=>{
    let jsonData = JSON.parse(data);
    let jsonTurtle = jsonData.turtle;
    server.turtles[0].position = new Vector3(jsonTurtle.x, jsonTurtle.y, jsonTurtle.z);
    server.turtles[0].rotation = jsonTurtle.rotation;
    win.webContents.send("world", jsonData);
  });
});

//When called return detected blocks
ipcMain.on("detect", (event, args) => {
  detectAll();
});

function detectAll() {
  if(server.turtles[0].isBusy() === false) {
    let jsonData = server.turtles[0].detect();
    jsonData.then((data) => {
      win.webContents.send("detected", data);
    });
  } else {
    setTimeout(detectAll, 10);
  }
}

//Update world
ipcMain.on("updateWorld", (event, args) => {
  fs.readFile('./src/backend/worlds/exampleWorld.json', (err, data)=>{

    let worldD = {
      "turtle": {
        "label": server.turtles[0].label,
        "computerId": server.turtles[0].computerId,
        "fuel": server.turtles[0].fuel,
        "rotation": server.turtles[0].rotation,
        "x": server.turtles[0].position.x,
        "y": server.turtles[0].position.y,
        "z": server.turtles[0].position.z
      },
      "WorldData": {
        "blocks": args
      }
    }

    fs.writeFile('./src/backend/worlds/exampleWorld.json', JSON.stringify(worldD), err => {});
  });
});