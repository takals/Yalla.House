// =============================================================================
// HubSpot client-side events (browser only)
// =============================================================================
//
// Wraps the `_hsq` queue that the HubSpot tracking script exposes on
// `window`. All functions are no-ops on the server.

import type { YallaLocale, YallaUserRole, YallaMarket } from './types'

type HsqCommand = unknown[]

// We deliberately avoid the DOM lib in this Node-typed package and access
// `window` through `globalThis` with a narrow cast. The function is a no-op
// on the server, so calling it from RSC / API routes is safe.
interface BrowserGlobal {
  _hsq?: HsqCommand[]
}

function queue(): HsqCommand[] | null {
  const g = globalThis as unknown as { window?: BrowserGlobal }
  if (!g.window) return null
  g.window._hsq = g.window._hsq || []
  return g.window._hsq
}

/**
 * Identify the current logged-in user. Pass the same email used for the
 * HubSpot contact record so visit history is merged with the contact.
 */
export interface IdentifyPayload {
  email: string
  id?: string | number
  role?: YallaUserRole
  market?: YallaMarket
  locale?: YallaLocale
  /** Any other property the user wants tied to the contact */
  [key: string]: unknown
}

export function identifyUser(payload: IdentifyPayload): void {
  const q = queue()
  if (!q) return
  q.push(['identify', payload])
  q.push(['trackPageView'])
}

/**
 * Track a custom behavioral event. The event name is prefixed with the
 * portal-id-scoped prefix HubSpot requires for custom events.
 *
 * @param portalId  Numeric HubSpot portal id (from NEXT_PUBLIC_HUBSPOT_PORTAL_ID)
 * @param name      Event short name (e.g. "listing_created")
 * @param properties Optional event properties
 */
export function trackEvent(
  portalId: string | number,
  name: string,
  properties: Record<string, unknown> = {},
): void {
  const q = queue()
  if (!q) return
  q.push([
    'trackCustomBehavioralEvent',
    { name: `pe${portalId}_${name}`, properties },
  ])
}

/** Manually fire a page view (useful for SPA route changes). */
export function trackPageView(path?: string): void {
  const q = queue()
  if (!q) return
  if (path) q.push(['setPath', path])
  q.push(['trackPageView'])
}

/** Revoke tracking consent (call when a user declines cookies). */
export function revokeConsent(): void {
  const q = queue()
  if (!q) return
  q.push(['revokeCookieConsent'])
}
