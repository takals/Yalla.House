'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { captureUtmFromUrl } from '@/lib/utm'

/**
 * Single analytics layer for Yalla.House.
 *
 * - Loads Google Tag Manager (which then loads GA4, Meta Pixel, anything else
 *   you add inside GTM — no code deploys needed for marketing changes).
 * - Loads Microsoft Clarity directly (free, no GTM dependency).
 * - Captures UTM parameters from the landing URL into a first-party cookie
 *   so they survive the session and get stamped onto the HubSpot contact
 *   on signup.
 *
 * Each script renders only when its env var is set, so local dev with no
 * IDs configured stays clean.
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID

  // Capture UTM cookie on every client navigation
  useEffect(() => {
    captureUtmFromUrl(window.location.href)
  }, [])

  return (
    <>
      {gtmId && (
        <>
          {/* Google consent mode v2 — default deny, the cookie banner flips it */}
          <Script id="consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
            `}
          </Script>
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        </>
      )}

      {clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}
    </>
  )
}

/**
 * Optional <noscript> fallback iframe for GTM. Render in <body> as the first child.
 * Not strictly required for GA4 — most users have JS — but recommended.
 */
export function GTMNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
