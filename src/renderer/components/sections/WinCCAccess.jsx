import React, { useState } from 'react'
import { usePrivilege } from '../../hooks/usePrivilege'
import { colors } from '../../theme/colors'

export function WinCCAccess() {
  const { canLaunchWinCC } = usePrivilege()
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(null)

  async function handleLaunch(method) {
    if (!window.electronAPI?.winccLaunch) {
      setMessage({ type: 'error', text: 'WinCC launch not available in this environment.' })
      return
    }
    setMessage(null)
    setLoading(method)
    try {
      const result = await window.electronAPI.winccLaunch(method)
      setLoading(null)
      if (result.ok) {
        setMessage({ type: 'success', text: 'WinCC Runtime starting.' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Launch failed.' })
      }
    } catch (err) {
      setLoading(null)
      setMessage({ type: 'error', text: err.message || 'Launch failed.' })
    }
  }

  if (!canLaunchWinCC) {
    return (
      <div>
        <h2 style={styles.h2}>WinCC Access</h2>
        <p style={styles.muted}>Not available for your role.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={styles.h2}>WinCC Access</h2>
      <p style={styles.p}>
        Access to WinCC is mediated by PAM. Launch the WinCC Runtime application on this PC.
      </p>
      {message && (
        <div style={{ ...styles.message, ...(message.type === 'error' ? styles.messageError : styles.messageSuccess) }}>
          {message.text}
        </div>
      )}
      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>WinCC Runtime</h3>
          <p style={styles.cardP}>Launch WinCC Runtime executable on this PC.</p>
          <button
            type="button"
            style={styles.button}
            onClick={() => handleLaunch('runtime')}
            disabled={loading != null}
          >
            {loading === 'runtime' ? 'Launching…' : 'Launch Runtime'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  h2: { margin: '0 0 8px', fontSize: 22 },
  p: { margin: '0 0 16px', color: colors.textSecondary, fontSize: 14 },
  message: {
    padding: '10px 12px',
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 14,
    maxWidth: 520
  },
  messageError: { background: '#3d1f1f', color: '#f28b82' },
  messageSuccess: { background: '#1e3a2f', color: colors.statusOk },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16
  },
  card: {
    background: colors.bgSecondary,
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${colors.border}`
  },
  cardTitle: { margin: '0 0 8px', fontSize: 16 },
  cardP: { margin: '0 0 12px', color: colors.textSecondary, fontSize: 13 },
  button: {
    padding: '10px 16px',
    fontSize: 14,
    background: colors.buttonPrimary,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer'
  },
  muted: { color: colors.textMuted, fontSize: 14 }
}
