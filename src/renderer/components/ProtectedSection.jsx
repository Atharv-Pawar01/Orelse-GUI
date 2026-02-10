import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAdminControls } from '../../shared/rbac'

/**
 * Renders children only if user is authenticated and role is in allowed set.
 * For Admin-only sections use allowedRoles={['Admin']}.
 */
export function ProtectedSection({ children, allowedRoles }) {
  const { user, role } = useAuth()
  if (!user || !role) return null
  if (allowedRoles && !allowedRoles.includes(role)) return null
  return children
}

/** Convenience: only Admin sees content */
export function AdminOnly({ children }) {
  const { user, role } = useAuth()
  if (!user || !role || !canAccessAdminControls(role)) return null
  return children
}
