import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import * as pam from '../services/pam.js'
import {
  initKeycloak,
  getSessionFromKeycloak,
  keycloakLogin,
  keycloakLogout,
  checkKeycloakReachable
} from '../services/keycloak.js'
import { ROLES, PRIVILEGED_ACTIONS } from '../../shared/roles.js'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [approvedActions, setApprovedActions] = useState({}) // { [actionId]: expiresAt }
  const [authReady, setAuthReady] = useState(false)

  // Guard against React StrictMode double-mount: if the first effect is
  // cleaned up before the async work finishes we must not apply stale state.
  const cancelledRef = useRef(false)
  const initTimeoutRef = useRef(null)

  useEffect(() => {
    cancelledRef.current = false

    const showKeycloakUnreachable = () => {
      if (!cancelledRef.current) {
        setAuthError('Cannot reach Keycloak server. Is it running? Check VITE_KEYCLOAK_URL in .env.')
        setAuthReady(true)
      }
    }

    initTimeoutRef.current = setTimeout(() => {
      if (cancelledRef.current) return
      setAuthReady((ready) => {
        if (ready) return ready
        setAuthError('Keycloak is not responding. Please check if the Keycloak server is running.')
        return true
      })
    }, 10000)

    // 1) Check reachability first so we never redirect to a down server
    checkKeycloakReachable()
      .then((reachable) => {
        if (cancelledRef.current) return
        if (!reachable) {
          showKeycloakUnreachable()
          return
        }
        // 2) Keycloak is up: init and then redirect if no session
        return initKeycloak()
      })
      .then((kcResult) => {
        if (cancelledRef.current) return
        if (kcResult === undefined) return // we already bailed (unreachable)
        const session = getSessionFromKeycloak()
        if (session) {
          setUser(session.user)
          setRole(session.role)
          setSessionId(session.sessionId || null)
        } else {
          keycloakLogin().catch((err) => {
            if (!cancelledRef.current) {
              setAuthError(err.message || 'Login failed')
            }
          })
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          setAuthError(err.message || 'Keycloak not configured')
        }
      })
      .finally(() => {
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current)
          initTimeoutRef.current = null
        }
        if (!cancelledRef.current) {
          setAuthReady(true)
        }
      })

    return () => {
      cancelledRef.current = true
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
        initTimeoutRef.current = null
      }
    }
  }, [])

  const login = useCallback(async () => {
    setAuthError(null)
    try {
      await initKeycloak()
      const reachable = await checkKeycloakReachable()
      if (!reachable) {
        setAuthError('Cannot reach Keycloak server. Is it running? Check VITE_KEYCLOAK_URL in .env.')
        return { ok: false }
      }
      await keycloakLogin()
      return { ok: true }
    } catch (err) {
      setAuthError(err.message || 'Login failed')
      return { ok: false }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setRole(null)
    setSessionId(null)
    setAuthError(null)
    setApprovedActions({})
    keycloakLogout().catch(() => { })
  }, [])

  const requestPrivilegedAccess = useCallback(async (actionId, reason) => {
    const result = await pam.requestPrivilegedAccess(actionId, reason)
    if (result.approved) {
      setApprovedActions((prev) => ({ ...prev, [actionId]: result.expiresAt }))
      return { approved: true, expiresAt: result.expiresAt }
    }
    return { approved: false }
  }, [])

  const hasPrivilegedAccess = useCallback((actionId) => {
    const expiresAt = approvedActions[actionId]
    if (!expiresAt) return false
    return Date.now() < expiresAt
  }, [approvedActions])

  const value = {
    user,
    role,
    sessionId,
    authError,
    authReady,
    login,
    logout,
    requestPrivilegedAccess,
    hasPrivilegedAccess,
    clearAuthError: () => setAuthError(null),
    ROLES,
    PRIVILEGED_ACTIONS
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
