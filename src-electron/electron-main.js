import { app, BrowserWindow, shell, Menu } from "electron";
import path from "path";
import os from "os";

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, "icons/icon.png"), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  // Adding a handler for opening new windows
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Create context menu with keyboard shortcuts
  const contextMenu = Menu.buildFromTemplate([
    { role: 'cut', label: 'Cut', accelerator: 'CmdOrCtrl+X' },
    { role: 'copy', label: 'Copy', accelerator: 'CmdOrCtrl+C' },
    { role: 'paste', label: 'Paste', accelerator: 'CmdOrCtrl+V' },
    { type: 'separator' },
    { role: 'selectAll', label: 'Select All', accelerator: 'CmdOrCtrl+A' }
  ]);

  mainWindow.webContents.on('context-menu', (e, params) => {
    contextMenu.popup(mainWindow, params.x, params.y);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
