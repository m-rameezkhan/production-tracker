// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProduction: (data) => ipcRenderer.send('save-production', data),
  getProductionData: (filter) => ipcRenderer.invoke('get-production-data', filter),
  printPage: (elementId) => ipcRenderer.send('print-page', elementId)
});
