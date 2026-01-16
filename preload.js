const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ozziumSave', {
  saveImage: (payload) => ipcRenderer.invoke('ozzium:save-image', payload)
});
