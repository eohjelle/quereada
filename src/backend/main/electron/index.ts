import './preinitialization'; // This module sets up environmental variables and logging. It should be imported first.
import { app, BrowserWindow, shell } from 'electron';
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
      contextIsolation: true,
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

app.whenReady().then(() => {
  const endpointBackend = new ElectronEndpointBackend();
  const streamBackend = new ElectronStreamBackend();
  createWindow();
});

// Add event listener for new-window-for-tab events
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Open the URL in the default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
