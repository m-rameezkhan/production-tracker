const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveProduction: (row) => ipcRenderer.send("update-production", row), // ✅ added alias
  updateProduction: (row) => ipcRenderer.send("update-production", row),
  
  deleteProduction: (date) => ipcRenderer.invoke("delete-production", date),

  onProductionUpdated: (callback) =>
    ipcRenderer.on("production-updated", (event, status) => callback(status)),

  getProductionData: (filter) => ipcRenderer.invoke("get-production-data", filter),
  printPage: (id) => ipcRenderer.send("print-page", id),
});

