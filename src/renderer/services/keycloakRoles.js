import { ROLES } from '../../shared/roles.js'

/**
 * Map Keycloak realm/client role names to app ROLES (Operator, Engineer, Admin).
 * Keycloak roles are often lowercase; we accept both.
 * First match wins; Admin > Engineer > Operator for precedence if user has multiple.
 */
const ROLE_MAP = [
  { keycloak: ['admin', 'Admin'], app: ROLES.ADMIN },
  { keycloak: ['engineer', 'Engineer'], app: ROLES.ENGINEER },
  { keycloak: ['operator', 'Operator'], app: ROLES.OPERATOR }
]

/**
 * @param {string[]} keycloakRoles - e.g. from token realm_access.roles or resource_access[client].roles
 * @returns {string} One of ROLES.OPERATOR | ROLES.ENGINEER | ROLES.ADMIN; defaults to Operator (least privilege)
 */
export function mapKeycloakRolesToAppRole(keycloakRoles) {
  if (!Array.isArray(keycloakRoles) || keycloakRoles.length === 0) {
    return ROLES.OPERATOR
  }
  const set = new Set(keycloakRoles.map((r) => (r && typeof r === 'string' ? r.trim() : '').toLowerCase()))
  for (const { keycloak: names, app } of ROLE_MAP) {
    if (names.some((name) => set.has(name.toLowerCase()))) {
      return app
    }
  }
  return ROLES.OPERATOR
}

/**
 * Get realm and optional client roles from Keycloak token payload.
 * @param {object} tokenParsed - keycloak.tokenParsed or decoded access token payload
 * @param {string} [clientId] - Keycloak client id to read resource_access[clientId].roles
 * @returns {string[]} Combined list of role strings
 */
export function getRolesFromToken(tokenParsed, clientId) {
  const roles = []
  if (tokenParsed.realm_access && Array.isArray(tokenParsed.realm_access.roles)) {
    roles.push(...tokenParsed.realm_access.roles)
  }
  if (clientId && tokenParsed.resource_access && tokenParsed.resource_access[clientId]) {
    const clientRoles = tokenParsed.resource_access[clientId].roles
    if (Array.isArray(clientRoles)) {
      roles.push(...clientRoles)
    }
  }
  return roles
}
