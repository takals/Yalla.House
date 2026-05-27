/**
 * UTM capture & propagation.
 *
 * On landing, captures utm_source / utm_medium / utm_campaign / utm_content /
 * utm_term from the URL into a first-party cookie `yh_attribution`. The cookie
 * survives 90 days. On signup, the server reads the cookie and stamps the
 * referral source onto the HubSpot contact (see auth/callback/route.ts).
 *
 * Why a cookie and not localStorage:
 *   - Cookies are sent on every server request, so the auth callback can read
 *     them without JS hydration
 *   - First-party cookie = no CMP banner needed for this strictly necessary
 *     attribution data (it's needed to fulfill the user's intent)
 */

const COOKIE_NAME = 'yh_attribution'
const COOKIE_MAX_AGE_S = 90 * 24 * 60 * 60 // 90 days

export interface UtmParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  /** Page that captured them — useful for debugging */
  landing?: string
  /** ISO timestamp */
  ts?: string
}

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

/**
 * Parse UTM params from a URL string. Returns an object only if at least one
 * UTM param is present. Used both on client (window.location.href) and server.
 */
export function parseUtm(urlStr: string): UtmParams | null {
  let url: URL
  try {
    url = new URL(urlStr)
  } catch {
    return null
  }
  const out: UtmParams = {}
  let any = false
  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key)
    if (v) {
      out[key] = v
      any = true
    }
  }
  if (!any) return null
  out.landing = url.pathname
  out.ts = new Date().toISOString()
  return out
}

/**
 * Captures UTM from the current URL into the yh_attribution cookie.
 * No-op on server, no-op if no UTM params present (so it never overwrites
 * an earlier first-touch attribution).
 */
export function captureUtmFromUrl(urlStr: string): void {
  if (typeof document === 'undefined') return
  const utm = parseUtm(urlStr)
  if (!utm) return
  const value = encodeURIComponent(JSON.stringify(utm))
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_MAX_AGE_S}; Path=/; SameSite=Lax${secure}`
}

/**
 * Parse the cookie value back into UtmParams. Returns null if missing or
 * malformed. Used from the auth callback (server-side).
 */
export function parseAttributionCookie(value: string | undefined | null): UtmParams | null {
  if (!value) return null
  try {
    return JSON.parse(decodeURIComponent(value)) as UtmParams
  } catch {
    return null
  }
}

/**
 * Map UTM source to the HubSpot yh_referral_source enum value we created in
 * the property setup script.
 */
export function utmToReferralSource(
  utm: UtmParams | null,
):
  | 'organic'
  | 'direct'
  | 'paid_search'
  | 'paid_social'
  | 'content'
  | 'referrer'
  | 'partner'
  | 'outbound'
  | 'other' {
  if (!utm) return 'direct'
  const m = (utm.utm_medium || '').toLowerCase()
  const s = (utm.utm_source || '').toLowerCase()

  if (m === 'cpc' || m === 'ppc' || m === 'paidsearch' || m === 'paid_search') return 'paid_search'
  if (m === 'social' || m === 'paidsocial' || m === 'paid_social' || m === 'cpm') {
    if (s === 'facebook' || s === 'meta' || s === 'instagram' || s === 'tiktok' || s === 'linkedin') {
      return 'paid_social'
    }
    return 'paid_social'
  }
  if (m === 'organic') return 'organic'
  if (m === 'email' || m === 'newsletter') return 'content'
  if (m === 'referral') return 'referrer'
  if (m === 'partner') return 'partner'
  if (m === 'content' || s === 'blog' || s === 'youtube') return 'content'

  return 'other'
}
