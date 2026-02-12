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

function getPath(envKey) {
  const raw = (process.env[envKey] || '').trim()
  return raw.replace(/^"+|"+$/g, '')
}

function launchExe(envKey, notConfiguredMessage, failMessage) {
  const exePath = getPath(envKey)
  if (!exePath) {
    return Promise.resolve({ ok: false, error: notConfiguredMessage })
  }
  try {
    spawn(exePath, [], { detached: true, stdio: 'ignore' }).unref()
    return Promise.resolve({ ok: true })
  } catch (err) {
    return Promise.resolve({ ok: false, error: err.message || failMessage })
  }
}

const LAUNCHER_TOOLS = {
  wincc: () => launchWinCC('runtime'),
  hminavi: () => launchHminavi('app'),
  'prosys-opc': () => launchExe('PROSYS_OPC_PATH', 'Prosys OPC UA Simulator path not configured. Set PROSYS_OPC_PATH.', 'Failed to start Prosys OPC UA Simulator.'),
  'ua-expert': () => launchExe('UA_EXPERT_PATH', 'UA Expert path not configured. Set UA_EXPERT_PATH.', 'Failed to start UA Expert.'),
  modbuspal: () => launchExe('MODBUSPAL_PATH', 'ModbusPal path not configured. Set MODBUSPAL_PATH.', 'Failed to start ModbusPal.'),
  qmodmaster: () => launchExe('QMODMASTER_PATH', 'QModMaster path not configured. Set QMODMASTER_PATH.', 'Failed to start QModMaster.'),
  'mqtt-explorer': () => launchExe('MQTT_EXPLORER_PATH', 'MQTT Explorer path not configured. Set MQTT_EXPLORER_PATH.', 'Failed to start MQTT Explorer.'),
  mosquitto: () => launchExe('MOSQUITTO_PATH', 'Mosquitto path not configured. Set MOSQUITTO_PATH.', 'Failed to start Mosquitto.'),
  'bacnet-explorer': () => launchExe('BACNET_EXPLORER_PATH', 'BACnet Explorer path not configured. Set BACNET_EXPLORER_PATH.', 'Failed to start BACnet Explorer.'),
  'onvif-device-manager': () => launchExe('ONVIF_DEVICE_MANAGER_PATH', 'ONVIF Device Manager path not configured. Set ONVIF_DEVICE_MANAGER_PATH.', 'Failed to start ONVIF Device Manager.')
}

function launcherLaunch(toolId) {
  const launch = LAUNCHER_TOOLS[toolId]
  if (!launch) {
    return Promise.resolve({ ok: false, error: `Unknown tool: ${toolId}` })
  }
  return launch()
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
ipcMain.handle('launcher:launch', (_event, toolId) => launcherLaunch(toolId))

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
