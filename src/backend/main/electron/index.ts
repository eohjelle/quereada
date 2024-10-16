import * as preinitialization from './preinitialization'; // Although no functions are called, this module sets up environmental variables and logging. It should be imported first.
import { app, BrowserWindow } from 'electron';
import { ElectronEndpointBackend } from '$bridge/api_endpoint/electron/backend';
import { ElectronStreamBackend } from '$bridge/loading_items_to_feed/electron/backend';
import path from 'path';
import { fileURLToPath } from 'url';

const __main_filename = fileURLToPath(import.meta.url);
const __main_dirname = path.dirname(__main_filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: false,
      preload: path.join(__main_dirname, '..', 'preload', 'preload.mjs')
    }
  });
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(path.join(__main_dirname, '..', 'renderer', 'index.html'));
  }
}

app.whenReady().then(
  () => {
    const endpointBackend = new ElectronEndpointBackend();
    const streamBackend = new ElectronStreamBackend();
    createWindow();
  }
);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
