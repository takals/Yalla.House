'use client'

import Script from 'next/script'

/**
 * Loads the HubSpot tracking script.
 *
 * Mount this once in the root `[locale]/layout.tsx`. If
 * NEXT_PUBLIC_HUBSPOT_PORTAL_ID is missing (e.g. in local dev without
 * HubSpot configured), the component renders nothing — silent no-op so
 * the site continues to work.
 */
export function HubSpotTracking() {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID
  if (!portalId) return null

  return (
    <Script
      id="hs-script-loader"
      strategy="afterInteractive"
      src={`//js-eu1.hs-scripts.com/${portalId}.js`}
    />
  )
}
