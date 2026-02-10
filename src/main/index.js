const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

function getRuntimePath() {
  const raw = (process.env.WINCC_RUNTIME_PATH || process.env.TEST_LAUNCH_EXE || '').trim()
  return raw.replace(/^"+|"+$/g, '')
}

function launchWinCC(method) {
  if (method === 'runtime') {
    const exePath = getRuntimePath()
    if (!exePath) {
      return Promise.resolve({ ok: false, error: 'Path not configured. Set WINCC_RUNTIME_PATH (or TEST_LAUNCH_EXE for testing). Restart the app after changing environment variables.' })
    }
    try {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref()
      return Promise.resolve({ ok: true })
    } catch (err) {
      return Promise.resolve({ ok: false, error: err.message || 'Failed to start WinCC Runtime.' })
    }
  }
  return Promise.resolve({ ok: false, error: 'Unknown launch method.' })
}

function getHminaviPath() {
  const raw = (process.env.HMINAVI_PATH || process.env.TEST_HMINAVI_EXE || '').trim()
  return raw.replace(/^"+|"+$/g, '')
}

function launchHminavi(method) {
  if (method === 'app') {
    const exePath = getHminaviPath()
    if (!exePath) {
      return Promise.resolve({ ok: false, error: 'HmiNavi path not configured. Set HMINAVI_PATH (or TEST_HMINAVI_EXE for testing). Restart the app after changing environment variables.' })
    }
    try {
      spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref()
      return Promise.resolve({ ok: true })
    } catch (err) {
      return Promise.resolve({ ok: false, error: err.message || 'Failed to start HmiNavi.' })
    }
  }
  return Promise.resolve({ ok: false, error: 'Unknown launch method.' })
}

const isDev = process.env.ELECTRON_RENDERER_URL != null
const preloadPath = path.join(__dirname, '../preload/index.js')
const rendererIndex = path.join(__dirname, '../renderer/index.html')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(rendererIndex)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.handle('ping', () => 'pong')
ipcMain.handle('wincc:launch', (_event, method) => launchWinCC(method))
ipcMain.handle('hminavi:launch', (_event, method) => launchHminavi(method))

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
