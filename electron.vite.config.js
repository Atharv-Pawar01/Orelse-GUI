const { defineConfig } = require('electron-vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()]
  }
})
