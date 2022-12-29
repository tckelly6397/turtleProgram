/*
* Creates the Electron application and window
*/

//Server is used to seperate files to be more organized, still running the server file
const server = require("./serverFiles/server");
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

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

  win.loadFile('./src/index.html')

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
  }

});