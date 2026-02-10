/**
 * Keycloak config for the renderer. Use env vars (VITE_KEYCLOAK_*) or defaults for dev.
 * In Keycloak admin: set Valid redirect URIs to your app origin (e.g. http://localhost:5173 for dev).
 *
 * Base URL (VITE_KEYCLOAK_URL):
 * - Keycloak 17+:  http://localhost:8080
 * - Keycloak 16 and older:  http://localhost:8080/auth
 * Realm name must match the realm created in Keycloak exactly (e.g. orlese).
 */
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

const baseUrl = (env.VITE_KEYCLOAK_URL || 'http://localhost:8080').trim().replace(/\/$/, '')

export const keycloakConfig = {
  url: baseUrl,
  realm: (env.VITE_KEYCLOAK_REALM || 'orlese').trim(),
  clientId: (env.VITE_KEYCLOAK_CLIENT_ID || 'wincc-pam-gui').trim()
}

/** Full Keycloak realm URL for keycloak-js init */
export function getKeycloakRealmUrl() {
  const { url, realm } = keycloakConfig
  const base = url.replace(/\/$/, '')
  return `${base}/realms/${realm}`
}
