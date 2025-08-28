// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "Production Dashboard App",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ===== Save Production =====
ipcMain.on('save-production', (event, formData) => {
  const filePath = path.join(__dirname, 'production.xlsx');

  let workbook, worksheet;
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets['Production'] || XLSX.utils.json_to_sheet([]);
    if (!workbook.Sheets['Production']) {
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Production');
    }
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Production');
  }

  const data = XLSX.utils.sheet_to_json(worksheet);
  data.push(formData);

  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets['Production'] = newSheet;
  XLSX.writeFile(workbook, filePath);

  console.log('Production saved:', formData);
});

// ===== Fetch Production Data =====
ipcMain.handle('get-production-data', (event, filter) => {
  const filePath = path.join(__dirname, 'production.xlsx');
  if (!fs.existsSync(filePath)) return [];

  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets['Production'];
  if (!worksheet) return [];

  const data = XLSX.utils.sheet_to_json(worksheet);

  if (filter.from && filter.to) {
    // Daily report filter
    return data.filter(row => row.Date >= filter.from && row.Date <= filter.to);
  } else if (filter.month) {
    // Monthly report filter
    return data.filter(row => row.Date.startsWith(filter.month));
  } else {
    return data;
  }
});

// ===== Print Page =====
ipcMain.on('print-page', (event, elementId) => {
  if (win) {
    win.webContents.print({ printBackground: true }, (success, errorType) => {
      if (!success) console.error(errorType);
    });
  }
});
