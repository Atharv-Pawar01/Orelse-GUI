import Keycloak from 'keycloak-js'
import { keycloakConfig, getKeycloakRealmUrl } from '../config/keycloak.js'
import { getRolesFromToken, mapKeycloakRolesToAppRole } from './keycloakRoles.js'

const KEYCLOAK_CHECK_TIMEOUT_MS = 5000

/**
 * Check if the Keycloak server is reachable (e.g. before redirecting to login).
 * @returns {Promise<boolean>}
 */
export function checkKeycloakReachable() {
  let timeoutId
  try {
    const realmUrl = getKeycloakRealmUrl()
    const url = `${realmUrl}/.well-known/openid-configuration`
    const controller = new AbortController()
    timeoutId = setTimeout(() => controller.abort(), KEYCLOAK_CHECK_TIMEOUT_MS)
    return fetch(url, { method: 'GET', signal: controller.signal, mode: 'cors' })
      .then((res) => {
        clearTimeout(timeoutId)
        return res.ok
      })
      .catch(() => {
        clearTimeout(timeoutId)
        return false
      })
  } catch (e) {
    if (timeoutId) clearTimeout(timeoutId)
    return Promise.resolve(false)
  }
}

let keycloakInstance = null
let initPromise = null

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
 *
 * Guards against concurrent calls: the first call creates the promise, all
 * subsequent calls (including React StrictMode double-mount) await the same one.
 *
 * @returns {Promise<Keycloak>} The initialized Keycloak instance
 */
export function initKeycloak() {
  // If already initialised (or initialising), return the same promise
  if (initPromise) {
    return initPromise
  }

  const config = getConfig()
  if (!config.url || !config.realm || !config.clientId) {
    return Promise.reject(new Error('Keycloak config missing. Set VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT_ID.'))
  }

  keycloakInstance = new Keycloak(config)

  // Auto-refresh token before it expires to prevent re-auth flicker
  keycloakInstance.onTokenExpired = () => {
    keycloakInstance.updateToken(30).catch(() => {
      // Token refresh failed — user will need to re-authenticate
      console.warn('[keycloak] Token refresh failed')
    })
  }

  // Use origin only so it matches Keycloak client "Valid redirect URIs" (e.g. http://localhost:5173)
  const redirectUri = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : undefined

  initPromise = keycloakInstance.init({
    onLoad: 'check-sso',
    redirectUri: redirectUri || undefined,
    flow: 'standard',
    pkceMethod: 'S256',
    // Disable login iframe / 3p-cookies check so Electron does not hit ERR_BLOCKED_BY_RESPONSE
    checkLoginIframe: false
  }).then(() => keycloakInstance)

  return initPromise
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
