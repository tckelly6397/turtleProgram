/*
* Creates the Electron application and window
*/

/*=========================== Imports ===========================*/
const { app, BrowserWindow, dialog } = require('electron');
const path = require("path");
const turtleApi = require("./serverFiles/TurtleFiles/turtleApi.js");
const server = require("./serverFiles/server.js");
const SaveLoadManager = require("./serverFiles/TurtleFiles/SaveLoadManager.js");

/*=========================== Variables ===========================*/
var win;
const indexPath = './src/frontend/index.html';

/*=========================== Functions ===========================*/
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

//Create a window
function createWindow () {
  win = new BrowserWindow({
    useContentSize: true,
    width: 1000,
    height: 700,

    // The lines below solved the issue
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
  })

  win.loadFile(indexPath);

  //Set the turtleApis and server win
  turtleApi.updateWin(win);
  server.updateWin(win);

  //On close ask to save
  win.on('close', e => {
    windowCloseEvent(e);
  });
}

//Function to execute if user tries to exit application
function windowCloseEvent(e) {
  e.preventDefault()
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Cancel', 'Yes', 'No'],
      cancelId: 2,
      defaultId: 0,
      title: 'Save before quitting?',
      detail: 'Save world before exiting?'
    }).then(async ({ response, checkboxChecked }) => {
      if (response == 2) {
        win.destroy()
        app.quit()
      } else if (response == 1) {
        //Save
        //win.webContents.send("retrieveAndUpdateWorldData");
        SaveLoadManager.saveWorlds();

        await delay(500);
        win.destroy();
        app.quit();
      }
    });
}

/*=========================== Events ===========================*/
app.whenReady().then(() => {
  createWindow();

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
