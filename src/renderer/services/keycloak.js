import Keycloak from 'keycloak-js'
import { keycloakConfig } from '../config/keycloak.js'
import { getRolesFromToken, mapKeycloakRolesToAppRole } from './keycloakRoles.js'

let keycloakInstance = null

/**
 * Get Keycloak config for the adapter. url must be the Keycloak server base URL (no /realms/xxx).
 */
function getConfig() {
  return {
    url: keycloakConfig.url.replace(/\/$/, ''),
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
  }
}

/**
 * Create and init Keycloak. Uses check-sso so we don't force login on load.
 * Redirect URI is the current origin (must be whitelisted in Keycloak client).
 * @returns {Promise<Keycloak>} The initialized Keycloak instance
 */
export function initKeycloak() {
  if (keycloakInstance) {
    return Promise.resolve(keycloakInstance)
  }
  const config = getConfig()
  if (!config.url || !config.realm || !config.clientId) {
    return Promise.reject(new Error('Keycloak config missing. Set VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT_ID.'))
  }
  keycloakInstance = new Keycloak(config)
  // Use origin only so it matches Keycloak client "Valid redirect URIs" (e.g. http://localhost:5173)
  const redirectUri = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : undefined
  return keycloakInstance.init({
    onLoad: 'check-sso',
    redirectUri: redirectUri || undefined,
    flow: 'standard',
    pkceMethod: 'S256',
    // Disable login iframe / 3p-cookies check so Electron does not hit ERR_BLOCKED_BY_RESPONSE
    checkLoginIframe: false
  }).then(() => keycloakInstance)
}

/**
 * @returns {Keycloak | null} The Keycloak instance if already initialized
 */
export function getKeycloak() {
  return keycloakInstance
}

/**
 * Get current session from Keycloak token: { user, role } or null if not authenticated.
 * @returns {{ user: string, role: string, sessionId?: string } | null}
 */
export function getSessionFromKeycloak() {
  const kc = getKeycloak()
  if (!kc || !kc.authenticated || !kc.tokenParsed) {
    return null
  }
  const token = kc.tokenParsed
  const roles = getRolesFromToken(token, keycloakConfig.clientId)
  const role = mapKeycloakRolesToAppRole(roles)
  const user = token.preferred_username || token.sub || 'user'
  return {
    user,
    role,
    sessionId: token.sub
  }
}

/**
 * Trigger Keycloak login (redirects to Keycloak).
 * @returns {Promise<void>}
 */
export function keycloakLogin() {
  const kc = getKeycloak()
  if (!kc) {
    return Promise.reject(new Error('Keycloak not initialized'))
  }
  return kc.login()
}

/**
 * Trigger Keycloak logout (redirects to Keycloak then back).
 * @returns {Promise<void>}
 */
export function keycloakLogout() {
  const kc = getKeycloak()
  if (!kc) {
    return Promise.resolve()
  }
  return kc.logout()
}
