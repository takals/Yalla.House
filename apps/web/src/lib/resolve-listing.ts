// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any

/**
 * Resolves a listing identifier which can be:
 * 1. A slug (e.g. "14-maple-road-redbridge") — SEO-friendly canonical URL
 * 2. A short_id (e.g. "YH-AB12") — compact shareable/QR code URL
 * 3. A place_id (UUID) — legacy direct reference
 *
 * Returns the listing data or null if not found.
 * Also returns `matched_by` so the caller can redirect short_id/place_id hits
 * to the canonical slug URL.
 */

export type MatchedBy = 'slug' | 'short_id' | 'place_id'

export interface ResolvedListing {
  listing: Record<string, unknown>
  matched_by: MatchedBy
}

const SHORT_ID_PATTERN = /^YH-[A-Z0-9]{4,6}$/i

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

/**
 * Try to resolve a listing by the given identifier.
 * Order of resolution: slug → short_id → place_id
 *
 * @param supabase - Supabase client (anon or service)
 * @param identifier - The URL segment to resolve
 * @param select - Columns to select (defaults to '*' with listing_media)
 * @param statusFilter - Array of allowed statuses (null = no filter, for owner preview)
 */
export async function resolveListing(
  supabase: AnySupabaseClient,
  identifier: string,
  select = '*, listing_media ( id, url, thumb_url, caption_de, caption, sort_order, is_primary, type )',
  statusFilter: string[] | null = null,
): Promise<ResolvedListing | null> {
  const decoded = decodeURIComponent(identifier)

  // Determine the most likely match type to try first
  const tryOrder: Array<{ field: string; matchedBy: MatchedBy }> = []

  if (SHORT_ID_PATTERN.test(decoded)) {
    // Looks like a short_id — try that first, then fallback to slug
    tryOrder.push({ field: 'short_id', matchedBy: 'short_id' })
    tryOrder.push({ field: 'slug', matchedBy: 'slug' })
  } else if (isUUID(decoded)) {
    // UUID — try place_id first, then slug just in case
    tryOrder.push({ field: 'place_id', matchedBy: 'place_id' })
    tryOrder.push({ field: 'slug', matchedBy: 'slug' })
  } else {
    // Everything else — slug first, then place_id as fallback
    tryOrder.push({ field: 'slug', matchedBy: 'slug' })
    tryOrder.push({ field: 'place_id', matchedBy: 'place_id' })
  }

  for (const { field, matchedBy } of tryOrder) {
    let query = (supabase as any)
      .from('listings')
      .select(select)
      .eq(field, decoded)

    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter)
    }

    const { data } = await query.single()

    if (data) {
      return { listing: data, matched_by: matchedBy }
    }
  }

  return null
}

/**
 * Build the canonical listing URL path using slug when available,
 * falling back to place_id.
 */
export function canonicalListingPath(listing: Record<string, unknown>): string {
  const slug = listing['slug'] as string | null
  const placeId = listing['place_id'] as string
  return `/p/${slug ?? placeId}`
}

/**
 * Build the full canonical listing URL.
 */
export function canonicalListingUrl(
  listing: Record<string, unknown>,
  locale: string,
  baseUrl = 'https://yalla.house',
): string {
  const path = canonicalListingPath(listing)
  const prefix = locale === 'de' ? '' : `/${locale}`
  return `${baseUrl}${prefix}${path}`
}

/**
 * Build the short shareable URL using short_id.
 */
export function shortListingUrl(
  listing: Record<string, unknown>,
  locale: string,
  baseUrl = 'https://yalla.house',
): string {
  const shortId = listing['short_id'] as string | null
  const placeId = listing['place_id'] as string
  const id = shortId ?? placeId
  const prefix = locale === 'de' ? '' : `/${locale}`
  return `${baseUrl}${prefix}/p/${id}`
}
