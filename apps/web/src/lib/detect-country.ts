/**
 * Country detection utilities.
 *
 * Currently uses the URL locale (which next-intl resolves from the browser
 * Accept-Language header via localeDetection: true in middleware).
 *
 * Future extensions:
 *  - Vercel's `x-vercel-ip-country` header for IP-based geolocation
 *  - Explicit user preference stored in a cookie / Supabase profile
 */

import { getCountryConfig, type CountryConfig, DEFAULT_COUNTRY } from './country-config'

/** Map a next-intl locale slug to a country code. */
const LOCALE_TO_COUNTRY: Record<string, string> = {
  en: 'GB',
  de: 'DE',
}

/**
 * Resolve the country code from a locale string.
 * Falls back to DEFAULT_COUNTRY if the locale is unknown.
 */
export function countryFromLocale(locale: string): string {
  return LOCALE_TO_COUNTRY[locale] ?? DEFAULT_COUNTRY
}

/**
 * Get the full country config for a given locale.
 */
export function countryConfigFromLocale(locale: string): CountryConfig {
  return getCountryConfig(countryFromLocale(locale))
}

/**
 * (Server-side) Detect country from request headers.
 * Checks Vercel's geo header first, then falls back to locale mapping.
 */
export function countryFromHeaders(
  headers: Headers,
  locale: string,
): string {
  // Vercel injects this header on their edge network
  const vercelCountry = headers.get('x-vercel-ip-country')
  if (vercelCountry && getCountryConfig(vercelCountry).country_code === vercelCountry) {
    return vercelCountry
  }
  return countryFromLocale(locale)
}
