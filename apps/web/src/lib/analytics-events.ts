/**
 * Conversion event helpers — the four events we care about across GA4,
 * HubSpot, and any future ad pixels (Meta, LinkedIn).
 *
 * Client-side: pushes to window.dataLayer (GTM picks it up and fans out).
 * Server-side: can additionally call GA4 Measurement Protocol for events
 * that fire outside the browser (e.g. listing_published happens in an
 * Inngest function).
 *
 * Event names match section 7.2 of the marketing strategy doc.
 */

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export type ConversionEventName =
  | 'lead_form_submit'
  | 'account_created'
  | 'listing_published'
  | 'sale_completed'

export interface ConversionEventProperties {
  // Common
  persona?: 'owner' | 'hunter' | 'agent' | 'partner' | 'referrer' | 'admin' | 'other'
  market?: 'DE' | 'UK' | 'both'
  locale?: 'de' | 'en'
  // Per-event
  form_id?: string
  user_id?: string
  listing_id?: string
  asking_price?: number
  sale_price?: number
  city?: string
  referral_source?: string
  days_to_sale?: number
  value?: number
  currency?: string
}

/**
 * Fire a conversion event client-side. Safe no-op on server.
 * GTM picks it up off window.dataLayer; configure each tag in the GTM UI.
 */
export function trackConversion(
  event: ConversionEventName,
  properties: ConversionEventProperties = {},
): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    ...properties,
  })
}

/**
 * Server-side: send an event to GA4 via Measurement Protocol.
 * Useful for events that happen outside the browser (Inngest functions,
 * webhook handlers, scheduled jobs).
 *
 * Requires: NEXT_PUBLIC_GA4_MEASUREMENT_ID and GA4_API_SECRET env vars.
 */
export async function trackConversionServerSide(
  clientId: string,
  event: ConversionEventName,
  properties: ConversionEventProperties = {},
): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const apiSecret = process.env.GA4_API_SECRET
  if (!measurementId || !apiSecret) {
    // Silent skip when GA4 isn't configured yet
    return
  }
  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: event, params: properties }],
        }),
      },
    )
  } catch (err) {
    // GA4 failures must not block business logic
    console.error('[ga4] server-side event failed:', err)
  }
}
