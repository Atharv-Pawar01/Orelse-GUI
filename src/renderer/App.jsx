import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LauncherSection } from './components/sections/LauncherSection'
import { AnalyserSection } from './components/sections/AnalyserSection'
import { colors } from './theme/colors'

const LOADING_FALLBACK_MS = 12000

function AppContent() {
  const { user, authReady, authError, login, clearAuthError } = useAuth()
  const [section, setSection] = useState('launcher')
  const [showLoadingFallback, setShowLoadingFallback] = useState(false)

  useEffect(() => {
    if (user || authError) return
    const t = setTimeout(() => setShowLoadingFallback(true), LOADING_FALLBACK_MS)
    return () => clearTimeout(t)
  }, [user, authError])

  // ── Error state (including fallback when loading never resolves) ─────
  const errorMessage = authError || (showLoadingFallback ? 'Unable to connect to Keycloak. Is the server running? Check VITE_KEYCLOAK_URL in .env and try again.' : null)
  if (errorMessage) {
    return (
      <div style={splashStyles.container}>
        <div style={splashStyles.card}>
          <p style={splashStyles.error}>{errorMessage}</p>
          <button
            type="button"
            style={splashStyles.button}
            onClick={() => {
              setShowLoadingFallback(false)
              clearAuthError()
              login()
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // ── Loading / redirecting state ──────────────────────────────
  if (!user) {
    const message = !authReady
      ? 'Loading…'
      : (isKeycloakCallback() ? 'Loading…' : 'Redirecting to login…')

    return (
      <div style={splashStyles.container}>
        <p style={splashStyles.text}>{message}</p>
      </div>
    )
  }

  // ── Authenticated ────────────────────────────────────────────
  const sectionContent = {
    launcher: <LauncherSection />,
    analyser: <AnalyserSection />
  }

  return (
    <Layout
      currentSection={section}
      onSectionChange={setSection}
      isLoading={false}
    >
      <div style={splashStyles.contentFadeIn}>
        {sectionContent[section] ?? <LauncherSection />}
      </div>
    </Layout>
  )
}

function isKeycloakCallback() {
  if (typeof window === 'undefined' || !window.location || !window.location.search) return false
  const q = window.location.search
  return q.includes('code=') || q.includes('state=')
}

const splashStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgPrimary,
    fontFamily: 'system-ui, sans-serif',
    color: colors.textPrimary
  },
  text: {
    margin: 0,
    fontSize: 14,
    color: colors.textSecondary
  },
  contentFadeIn: {
    animation: 'arconContentFadeIn 0.2s ease-out'
  },
  card: {
    background: colors.bgSecondary,
    padding: 24,
    borderRadius: 8,
    minWidth: 280,
    border: `1px solid ${colors.border}`
  },
  error: {
    margin: '0 0 16px',
    fontSize: 14,
    color: colors.statusAlarm
  },
  button: {
    padding: '10px 16px',
    fontSize: 14,
    background: colors.buttonPrimary,
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    width: '100%'
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
