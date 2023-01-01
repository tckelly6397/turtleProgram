/*
* Creates the Electron application and window
*/
const { app, BrowserWindow, dialog } = require('electron');
const path = require("path");
const turtleApi = require("./serverFiles/turtleApi");
const server = require("./serverFiles/server");

var win;

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

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

  win.loadFile(`./src/frontend/index.html`);

  //Set the turtleApis and server win
  turtleApi.updateWin(win);
  server.updateWin(win);

  //On close ask to save
  win.on('close', e => {
    windowCloseEvent(e);
  });
}

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
        win.webContents.send("retrieveAndUpdateWorldData");

        await delay(500);
        win.destroy();
        app.quit();
      }
    });
}

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
