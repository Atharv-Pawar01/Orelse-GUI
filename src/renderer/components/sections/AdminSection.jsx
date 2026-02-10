import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usePrivilege } from '../../hooks/usePrivilege'
import { PRIVILEGED_ACTIONS } from '../../../shared/roles'
import { colors } from '../../theme/colors'

export function AdminSection() {
  const { requestPrivilegedAccess } = useAuth()
  const { canAccessAdminControls, hasAdminPrivilege } = usePrivilege()
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRequest() {
    setRequesting(true)
    setMessage('')
    try {
      const result = await requestPrivilegedAccess(PRIVILEGED_ACTIONS.ADMIN_CONTROLS, 'Admin controls')
      if (result.approved) {
        const mins = Math.round((result.expiresAt - Date.now()) / 60000)
        setMessage(`Privileged access granted for ${mins} minutes.`)
      } else {
        setMessage('Privileged access denied.')
      }
    } finally {
      setRequesting(false)
    }
  }

  if (!canAccessAdminControls) {
    return (
      <div>
        <h2 style={styles.h2}>Admin</h2>
        <p style={styles.muted}>Not available for your role.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={styles.h2}>Admin controls</h2>
      <p style={styles.p}>Admin only: requires PAM approval. Time-limited access.</p>
      {message && <div style={styles.message}>{message}</div>}
      {hasAdminPrivilege ? (
        <div style={styles.card}>
          <span style={styles.unlocked}>Privileged access active (time-limited)</span>
          <p style={styles.cardP}>Admin controls placeholder — Section 5.</p>
        </div>
      ) : (
        <button
          type="button"
          style={styles.lockBtn}
          onClick={handleRequest}
          disabled={requesting}
        >
          {requesting ? 'Requesting…' : 'Request privileged access'}
        </button>
      )}
    </div>
  )
}

const styles = {
  h2: { margin: '0 0 8px', fontSize: 22 },
  p: { margin: '0 0 16px', color: colors.textSecondary, fontSize: 14 },
  message: {
    padding: '10px 12px',
    marginBottom: 16,
    background: '#1e3a5f',
    borderRadius: 4,
    fontSize: 14,
    color: colors.accent,
    maxWidth: 400
  },
  card: {
    background: colors.bgSecondary,
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    maxWidth: 400
  },
  cardP: { margin: '8px 0 0', fontSize: 14, color: colors.textSecondary },
  unlocked: { fontSize: 14, color: colors.statusOk },
  lockBtn: {
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
