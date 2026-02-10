import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '../theme/colors'

export function Login() {
  const [loading, setLoading] = useState(false)
  const { login, authError, clearAuthError, authReady } = useAuth()

  async function handleSignIn() {
    clearAuthError()
    setLoading(true)
    try {
      await login()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Orelse</h1>
        <p style={styles.subtitle}>Sign in with Keycloak</p>
        {!authReady ? (
          <p style={styles.loading}>Loading…</p>
        ) : (
          <>
            {authError && (
              <div style={styles.error}>{authError}</div>
            )}
            <button
              type="button"
              style={styles.button}
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? 'Redirecting…' : 'Sign in with Keycloak'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgPrimary,
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    background: colors.bgSecondary,
    padding: 32,
    borderRadius: 8,
    minWidth: 320,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: `1px solid ${colors.border}`
  },
  title: {
    margin: '0 0 4px',
    color: colors.textPrimary,
    fontSize: 24
  },
  subtitle: {
    margin: '0 0 24px',
    color: colors.textSecondary,
    fontSize: 14
  },
  loading: {
    margin: 0,
    color: colors.textSecondary,
    fontSize: 14
  },
  error: {
    color: colors.statusAlarm,
    fontSize: 13,
    marginBottom: 12
  },
  button: {
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    borderRadius: 4,
    background: colors.buttonPrimary,
    color: '#fff',
    cursor: 'pointer',
    width: '100%'
  }
}
