import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as pam from '../services/pam.js'
import {
  initKeycloak,
  getSessionFromKeycloak,
  keycloakLogin,
  keycloakLogout
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

  useEffect(() => {
    initKeycloak()
      .then(() => {
        const session = getSessionFromKeycloak()
        if (session) {
          setUser(session.user)
          setRole(session.role)
          setSessionId(session.sessionId || null)
        }
      })
      .catch((err) => {
        setAuthError(err.message || 'Keycloak not configured')
      })
      .finally(() => setAuthReady(true))
  }, [])

  const login = useCallback(async () => {
    setAuthError(null)
    try {
      await initKeycloak()
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
    keycloakLogout().catch(() => {})
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
