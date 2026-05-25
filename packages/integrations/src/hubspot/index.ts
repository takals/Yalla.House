// =============================================================================
// @yalla/integrations/hubspot
// =============================================================================
//
// HubSpot CRM integration. Two surfaces:
//
//   1. Server-side: HubSpotClient + upsertContact / getContactByEmail
//      (used in API routes and Inngest functions).
//   2. Client-side: identifyUser / trackEvent / trackPageView
//      (used in React components after the tracking script loads).

export * from './types'
export { HubSpotClient, HubSpotError } from './client'
export type { HubSpotClientOptions } from './client'
export {
  mapYallaToHubSpot,
  upsertContact,
  getContactByEmail,
  deleteContactByEmail,
} from './contacts'
export {
  identifyUser,
  trackEvent,
  trackPageView,
  revokeConsent,
} from './events'
export type { IdentifyPayload } from './events'
