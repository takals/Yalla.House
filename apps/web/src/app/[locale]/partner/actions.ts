'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

/** Only these categories exist — anything else would never match a request. */
const ALLOWED_CATEGORIES = new Set([
  'address-updates', 'broadband', 'cleaning', 'conveyancing', 'eicr', 'energy',
  'epc', 'gas-safety', 'home-staging', 'insurance', 'interior-design', 'inventory',
  'mortgage-brokers', 'photography', 'removals', 'rent-collection', 'storage',
  'surveyors', 'tenant-referencing', 'tradespeople',
])

/** UK outward code or a prefix of one — e.g. IG, IG1, IG11. */
const POSTCODE_PREFIX = /^[A-Z]{1,2}\d{0,2}[A-Z]?$/

/**
 * Save the two fields that decide whether a provider gets sent work:
 * which services they offer, and which postcode areas they cover.
 *
 * These are edited in place on the dashboard. There is deliberately no
 * /partner/profile page — the dashboard used to link to one three times and it
 * never existed, which left every provider stuck on "Complete your profile".
 */
export async function saveCoverageAction(input: {
  categories: string[]
  postcodes: string
}): Promise<{ success: true } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const categories = Array.from(new Set(input.categories))
    .filter(c => ALLOWED_CATEGORIES.has(c))

  const prefixes = Array.from(
    new Set(
      input.postcodes
        .split(',')
        .map(p => p.trim().toUpperCase().replace(/\s+/g, ''))
        .filter(Boolean)
    )
  )

  const badPrefix = prefixes.find(p => !POSTCODE_PREFIX.test(p))
  if (badPrefix) {
    return { error: `"${badPrefix}" isn't a postcode area. Use the first part only, like IG1 or E11.` }
  }
  if (prefixes.length > 40) {
    return { error: 'That is a lot of areas — keep it to 40 or fewer so the matches stay relevant.' }
  }

  const supabase = await createClient()

  // Shape must match what route-service-request reads: [{ postcode_prefixes: [...] }]
  const { error } = await (supabase.from('partner_profiles') as any).upsert(
    {
      user_id: auth.userId,
      service_types: categories,
      coverage_areas: prefixes.length > 0 ? [{ postcode_prefixes: prefixes }] : [],
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('saveCoverageAction error:', error)
    return { error: 'Could not save that. Please try again.' }
  }

  revalidatePath('/partner')
  return { success: true }
}
