const { app, BrowserWindow } = require('electron');
const path = require('path');

path.join(__dirname, './src/');

function createWindow () {
  const win = new BrowserWindow({
    useContentSize: true,
    width: 800,
    height: 600,
  })

  win.loadFile('./src/index.html')
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

