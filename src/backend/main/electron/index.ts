import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ElectronEndpointBackend } from '$bridge/api_endpoint/electron/backend';
import { ElectronStreamBackend } from '$bridge/loading_items_to_feed/electron/backend';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: false,
      preload: path.join(process.cwd(), 'dist/src/backend/main/electron/preload.mjs')
    }
  });

  win.loadFile(path.join(process.cwd(), 'dist/src/frontend/index.html'));
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
