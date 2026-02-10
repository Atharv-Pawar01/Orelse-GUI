const { spawn } = require('child_process')

const WINCC_RUNTIME_PATH = process.env.WINCC_RUNTIME_PATH || ''

/**
 * Launch WinCC Runtime. Access is mediated by the GUI (RBAC in renderer).
 * @param {'runtime'} method
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
function launchWinCC(method) {
  if (method === 'runtime') {
    if (!WINCC_RUNTIME_PATH || WINCC_RUNTIME_PATH.trim() === '') {
      return { ok: false, error: 'WinCC Runtime path not configured. Set WINCC_RUNTIME_PATH.' }
    }
    try {
      const exe = WINCC_RUNTIME_PATH.trim()
      spawn(exe, [], {
        detached: true,
        stdio: 'ignore'
      }).unref()
      return Promise.resolve({ ok: true })
    } catch (err) {
      return Promise.resolve({ ok: false, error: err.message || 'Failed to start WinCC Runtime.' })
    }
  }
  return Promise.resolve({ ok: false, error: 'Unknown launch method.' })
}

module.exports = { launchWinCC }
