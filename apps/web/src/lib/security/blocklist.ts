import { edgeServiceClient } from './edge-client'

/**
 * Cached IP blocklist for middleware.
 *
 * Do NOT query the database per request — that adds a round trip to every page
 * load to defend against traffic that is a rounding error. The list is refreshed
 * at most once per TTL, in the background.
 *
 * FAILS OPEN. If Supabase is unreachable the previous list is reused, never
 * emptied, and a failure never blocks. A security feature that takes the site
 * down during an outage is worse than the threat it prevents.
 */
const TTL_MS = 60_000

let cache = new Set<string>()
let fetchedAt = 0
let inflight: Promise<void> | null = null

async function refresh(): Promise<void> {
  try {
    const { data, error } = await edgeServiceClient()
      .from('security_blocked_ips')
      .select('ip, expires_at')
      .is('released_at', null)
    if (error || !data) return

    const now = Date.now()
    cache = new Set(
      data
        .filter(r => !r.expires_at || new Date(r.expires_at as string).getTime() > now)
        .map(r => r.ip as string),
    )
    fetchedAt = now
  } catch {
    // keep previous cache
  }
}

export async function isBlocked(ip: string): Promise<boolean> {
  if (Date.now() - fetchedAt > TTL_MS && !inflight) {
    inflight = refresh().finally(() => { inflight = null })
  }
  if (fetchedAt === 0 && inflight) await inflight  // cold start only
  return cache.has(ip)
}

/** Fire-and-forget. Caller wraps in event.waitUntil(). */
export async function recordHoneypotHit(input: {
  ip: string
  path: string
  method: string
  userAgent: string | null
  referer: string | null
  country: string | null
}): Promise<void> {
  try {
    await edgeServiceClient().rpc('record_honeypot_hit', {
      p_ip: input.ip,
      p_path: input.path.slice(0, 500),
      p_method: input.method,
      p_user_agent: input.userAgent?.slice(0, 500) ?? null,
      p_referer: input.referer?.slice(0, 500) ?? null,
      p_country: input.country,
    })
  } catch {
    // never let logging failure affect the response
  }
}

/**
 * Client IP. On Vercel `request.ip` is authoritative. Fallback takes the LAST
 * x-forwarded-for entry — Vercel appends the true client IP there. Taking the
 * first is the classic mistake: a client can send its own X-Forwarded-For and
 * get someone else blocked.
 */
export function clientIp(req: { ip?: string; headers: Headers }): string | null {
  if (req.ip) return req.ip
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1] ?? null
  }
  return req.headers.get('x-real-ip')
}
