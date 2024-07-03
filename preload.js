const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  fetchAvailability: () => ipcRenderer.invoke('fetch-availability'),
});
