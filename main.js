const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Example of defining a global shortcut
app.on('ready', () => {
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    // Handle shortcut trigger here
    mainWindow.webContents.send('shortcut-triggered');
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
