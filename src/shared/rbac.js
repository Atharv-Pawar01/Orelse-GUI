import { ROLES } from './roles.js'

/**
 * Central RBAC checks. Use these for both UI and main-process (e.g. WinCC launch).
 * Matches spec: View HMI / Launch WinCC = all; Edit config = Engineer/Admin (via PAM);
 * Admin controls = Admin only (via PAM).
 */

export function canViewHmi(role) {
  return role === ROLES.OPERATOR || role === ROLES.ENGINEER || role === ROLES.ADMIN
}

export function canLaunchWinCC(role) {
  return role === ROLES.OPERATOR || role === ROLES.ENGINEER || role === ROLES.ADMIN
}

/** Can this role ever request "Edit configuration" (subject to PAM approval)? */
export function canRequestEditConfig(role) {
  return role === ROLES.ENGINEER || role === ROLES.ADMIN
}

/** Can this role ever request "Admin controls" (subject to PAM approval)? */
export function canAccessAdminControls(role) {
  return role === ROLES.ADMIN
}
