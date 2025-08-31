// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

let win;
let splash;

function createWindow() {
  try {
    // Get image size
    const imagePath = path.join(__dirname, 'welcome.png');
    const image = require('electron').nativeImage.createFromPath(imagePath);
    const { width, height } = image.getSize();

    // Splash Screen
    splash = new BrowserWindow({
      width,
      height,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      center: true,
      resizable: false,
      fullscreenable: false,
      show: false,
    });

    splash.loadFile(path.join(__dirname, "splash.html"));

    splash.once("ready-to-show", () => {
      splash.show();
    });

    // Main Window
    win = new BrowserWindow({
      show: false,
      width: 1200,
      height: 800,
      title: "Production Dashboard App",
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      }
    });

    win.loadFile("index.html");

    // --- Splash timing control ---
    const splashShownAt = Date.now();

    win.once("ready-to-show", () => {
      const elapsed = Date.now() - splashShownAt;
      const remaining = Math.max(0, 1500 - elapsed); // ensure at least 1s visible

      setTimeout(() => {
        if (splash) {
          splash.close();
          splash = null;
        }
        win.maximize();
        win.show();
      }, remaining);
    });

  } catch (error) {
    console.error("Error creating window:", error);
  }
}



app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ===== Update Production Data =====
ipcMain.on('update-production', (event, updatedRow) => {
  try {
    const filePath = path.join(__dirname, 'production.xlsx');
    if (!fs.existsSync(filePath)) {
      event.sender.send('production-updated', { success: false, message: "File not found" });
      return;
    }

    const workbook = XLSX.readFile(filePath);
    let worksheet = workbook.Sheets['Production'];
    if (!worksheet) {
      worksheet = XLSX.utils.json_to_sheet([]);
      workbook.SheetNames.push('Production');
      workbook.Sheets['Production'] = worksheet;
    }

    let data = XLSX.utils.sheet_to_json(worksheet);

    const index = data.findIndex(r => r.Date === updatedRow.Date);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedRow };
    } else {
      // If row not found, add new
      data.push(updatedRow);
    }

    const newSheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets['Production'] = newSheet;
    XLSX.writeFile(workbook, filePath);

    console.log('Production updated:', updatedRow);

    event.sender.send('production-updated', { success: true, message: "Production data updated successfully" });

  } catch (error) {
    console.error("Update failed:", error);
    event.sender.send('production-updated', { success: false, message: "Error updating production data" });
  }
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
    return data.filter(row => row.Date >= filter.from && row.Date <= filter.to);
  } else if (filter.month) {
    return data.filter(row => row.Date.startsWith(filter.month));
  } else {
    return data;
  }
});

// ===== Delete Production Data =====
ipcMain.handle("delete-production", async (event, date) => {
  try {
    const filePath = path.join(__dirname, "production.xlsx");
    if (!fs.existsSync(filePath)) {
      return { success: false, message: "File not found" };
    }

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets["Production"];
    if (!worksheet) {
      return { success: false, message: "No Production sheet found" };
    }

    let data = XLSX.utils.sheet_to_json(worksheet);

    // filter out row with the given date
    const newData = data.filter(r => r.Date !== date);

    // overwrite sheet with updated data
    const newSheet = XLSX.utils.json_to_sheet(newData);
    workbook.Sheets["Production"] = newSheet;
    XLSX.writeFile(workbook, filePath);

    console.log(`Row with Date ${date} deleted.`);
    return { success: true };

  } catch (error) {
    console.error("Delete failed:", error);
    return { success: false, message: error.message };
  }
});


ipcMain.on("print-page", (event, elementId) => {
  if (win) {
    win.webContents.executeJavaScript(`
      (() => {
        let section = document.getElementById("${elementId}");
        if (!section) {
          console.error("Section not found: ${elementId}");
          return;
        }

        const printWindow = window.open("", "PRINT", "height=800,width=1200");

        // Only include body + content styles; exclude any @page rules
        const styles = Array.from(document.styleSheets)
          .map(s => {
            try {
              return [...s.cssRules]
                .filter(r => r.constructor.name !== 'CSSPageRule') // FILTER OUT @page
                .map(r => r.cssText)
                .join('');
            } catch(e) { return ""; }
          })
          .join("\\n");

        printWindow.document.write(\`
          <html>
          <head>
            <title>Report</title>
            <style>
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                margin: 0;
                padding: 0;
              }
              #print-content {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
              }
              \${styles}
            </style>
          </head>
          <body>
            <div id="print-content">\${section.outerHTML}</div>
          </body>
          </html>
        \`);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      })();
    `);
  }
});

