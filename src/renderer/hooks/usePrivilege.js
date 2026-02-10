import { useAuth } from '../contexts/AuthContext'
import {
  canViewHmi,
  canLaunchWinCC,
  canRequestEditConfig,
  canAccessAdminControls
} from '../../shared/rbac'
import { PRIVILEGED_ACTIONS } from '../../shared/roles'

/**
 * Central hook for role + PAM state. Use for UI and to pass to main process.
 */
export function usePrivilege() {
  const { role, hasPrivilegedAccess } = useAuth()

  return {
    // Role-based (no PAM)
    canViewHmi: role ? canViewHmi(role) : false,
    canLaunchWinCC: role ? canLaunchWinCC(role) : false,
    // Privileged: role allows and PAM approved (time-limited)
    canRequestEditConfig: role ? canRequestEditConfig(role) : false,
    canAccessAdminControls: role ? canAccessAdminControls(role) : false,
    hasEditConfigPrivilege: role ? hasPrivilegedAccess(PRIVILEGED_ACTIONS.EDIT_CONFIG) : false,
    hasAdminPrivilege: role ? hasPrivilegedAccess(PRIVILEGED_ACTIONS.ADMIN_CONTROLS) : false
  }
}
