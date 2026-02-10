// User roles (RBAC)
export const ROLES = {
  OPERATOR: 'Operator',
  ENGINEER: 'Engineer',
  ADMIN: 'Admin'
}

// Privileged action IDs (require PAM approval)
export const PRIVILEGED_ACTIONS = {
  EDIT_CONFIG: 'edit_configuration',
  ADMIN_CONTROLS: 'admin_controls'
}

// Default privilege approval duration (minutes)
export const PRIVILEGE_DURATION_MINUTES = 15
