/**
 * Server-side helpers for syncing Yalla.House users to HubSpot.
 *
 * Used from the auth callback (every successful signup/login fires upsertHubSpotContact).
 * All functions are best-effort: HubSpot failures are logged but never break the
 * caller's flow. Safe to call even when HUBSPOT_PRIVATE_APP_TOKEN is missing
 * (e.g. local dev without HubSpot configured) — the helper short-circuits.
 */

import { hubspot } from '@yalla/integrations'

type YallaUserRole = hubspot.YallaUserRole
type YallaMarket = hubspot.YallaMarket
type YallaLocale = hubspot.YallaLocale

/** Role priority for picking the primary persona when a user has multiple roles. */
const ROLE_PRIORITY: YallaUserRole[] = [
  'admin',
  'agent',
  'owner',
  'partner',
  'referrer',
  'hunter',
]

export interface SyncUserInput {
  email: string
  fullName?: string | null
  roles?: string[] // raw user_roles.role values
  language?: string | null // 'de' | 'en' from public.users.language
  market?: YallaMarket // optional explicit override
  referralSource?: string // from cookie / utm capture
}

/**
 * Pick the highest-priority role from the user's role set. Defaults to 'hunter'
 * (lowest-priority bucket) when no roles are set yet — new signups land in the
 * role-picker flow but should still be tracked.
 */
export function pickPrimaryRole(roles?: string[]): YallaUserRole {
  if (!roles || roles.length === 0) return 'hunter'
  const set = new Set(roles)
  for (const r of ROLE_PRIORITY) {
    if (set.has(r)) return r
  }
  return 'other'
}

function pickLocale(language?: string | null): YallaLocale {
  return language === 'en' ? 'en' : 'de'
}

function pickName(fullName?: string | null): {
  firstName?: string
  lastName?: string
} {
  if (!fullName) return {}
  const trimmed = fullName.trim()
  if (!trimmed) return {}
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0] }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

/**
 * Upsert a Yalla user into HubSpot. Best-effort: never throws.
 *
 * Returns true on success, false on skip (no token) or failure.
 */
export async function upsertHubSpotContact(
  input: SyncUserInput,
): Promise<boolean> {
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    // Silent skip — local dev, CI, or feature-flagged-off env
    return false
  }

  try {
    const client = new hubspot.HubSpotClient()
    const { firstName, lastName } = pickName(input.fullName)
    const now = new Date()

    await hubspot.upsertContact(client, {
      email: input.email,
      firstName,
      lastName,
      role: pickPrimaryRole(input.roles),
      market: input.market ?? 'DE',
      locale: pickLocale(input.language),
      referralSource: (input.referralSource as
        | 'organic'
        | 'direct'
        | 'paid_search'
        | 'paid_social'
        | 'content'
        | 'referrer'
        | 'partner'
        | 'outbound'
        | 'other'
        | undefined) ?? 'direct',
      signupAt: now,
      lastActiveAt: now,
    })

    return true
  } catch (err) {
    // Log but don't surface — auth must not fail because HubSpot is down.
    console.error('[hubspot] upsertContact failed:', err)
    return false
  }
}
