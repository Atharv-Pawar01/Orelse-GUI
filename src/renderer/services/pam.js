import { ROLES, PRIVILEGE_DURATION_MINUTES } from '../../shared/roles.js'

// Mock users: password is same as username for demo (operator/operator, etc.)
const MOCK_USERS = [
  { username: 'operator', password: 'operator', role: ROLES.OPERATOR, displayName: 'Operator User' },
  { username: 'engineer', password: 'engineer', role: ROLES.ENGINEER, displayName: 'Engineer User' },
  { username: 'admin', password: 'admin', role: ROLES.ADMIN, displayName: 'Admin User' }
]

function findUser(username, password) {
  return MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  )
}

/**
 * Authenticate via Acronis PAM (mocked).
 * @returns {Promise<{ user: string, displayName: string, role: string, sessionId: string }>}
 * @throws on invalid credentials
 */
export function login(username, password) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const user = findUser(username, password)
      if (!user) {
        reject(new Error('Invalid credentials'))
        return
      }
      resolve({
        user: user.username,
        displayName: user.displayName,
        role: user.role,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
      })
    }, 400)
  })
}

/**
 * Request just-in-time privileged access (mocked).
 * @param {string} actionId - e.g. PRIVILEGED_ACTIONS.EDIT_CONFIG
 * @param {string} [reason] - optional reason
 * @returns {Promise<{ approved: boolean, expiresAt: number }>}
 */
export function requestPrivilegedAccess(actionId, reason) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: always approve. In production, PAM would validate and optionally require approval workflow.
      const expiresAt = Date.now() + PRIVILEGE_DURATION_MINUTES * 60 * 1000
      resolve({ approved: true, expiresAt })
    }, 300)
  })
}
