const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let pngToIco;
try {
  pngToIco = require('png-to-ico');
} catch (e) {
  pngToIco = null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 760,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // NOTE: We intentionally *do not* set disableDialogs.
      // Using a filename input instead of prompt() keeps things consistent.
    }
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'index.html'));
}

// Save handler for renderer
ipcMain.handle('ozzium:save-image', async (_event, payload) => {
  try {
    const { dataUrl, format, defaultName } = payload || {};
    if (!dataUrl || !format) return { ok: false, error: 'Missing data' };

    const filters = [
      { name: format.toUpperCase(), extensions: [format] }
    ];

    const { filePath, cancelled } = await dialog.showSaveDialog({
      defaultPath: defaultName || `ozzium_image.${format}`,
      filters
    });

    if (cancelled || !filePath) return { ok: false, cancelled: true };

    // Decode data URL to buffer
    const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl);
    if (!match) return { ok: false, error: 'Bad dataUrl' };

    const mime = match[1];
    const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');

    if (format === 'ico') {
      // Expecting PNG bytes as input (renderer sends PNG for ICO)
      if (!pngToIco) return { ok: false, error: 'png-to-ico missing' };
      const icoBuf = await pngToIco(buf);
      fs.writeFileSync(filePath, icoBuf);
      return { ok: true };
    }

    // png/jpg
    // Basic sanity check: if user chose jpg but mime isn't jpeg, we still save bytes.
    // The renderer already prepares jpeg when requested.
    fs.writeFileSync(filePath, buf);
    return { ok: true, mime };

  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
