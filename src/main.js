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

ipcMain.on("getMap", (event, args) => {
  //console.log(args);
  console.log(server);
  if(server.turtles[0] != undefined) {
      let position = server.turtles[0].getPositionAsJSON();
      console.log("test: " + JSON.parse(position));
      if(position != undefined && win != 'undefined') {
          win.webContents.send("updatedMap", position);
      }
  }
});