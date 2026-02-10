const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  winccLaunch: (method) => ipcRenderer.invoke('wincc:launch', method),
  hminaviLaunch: (method) => ipcRenderer.invoke('hminavi:launch', method)
})
