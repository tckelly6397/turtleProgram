/*
* Creates the Electron application and window
*/
const { app, BrowserWindow } = require('electron');
const path = require("path");
const turtleApi = require("./turtleApi");

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

  //Set the turtleApis win
  turtleApi.updateWin(win);
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
