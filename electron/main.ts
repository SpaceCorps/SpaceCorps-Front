import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Set CSP headers
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: file:;",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: file:;",
          "connect-src 'self' http: https: ws: wss:;"
        ].join(' ')
      }
    });
  });

  // Load the Angular app
  const indexPath = path.join(__dirname, '../../dist/space-corps-front/browser/index.html');
  win.loadFile(indexPath);

  // Handle Angular routing
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    const filePath = url.replace('file://', '');
    win.loadFile(filePath);
  });

  // Handle Angular asset loading
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Handle new window requests (for new tabs)
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Create a new tab in the same window
    win.webContents.send('open-new-tab', url);
    console.log(url);
    return { action: 'deny' }; // Prevent default behavior
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
