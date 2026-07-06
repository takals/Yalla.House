import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://yalla.house'

// Regenerate at most once a day.
export const revalidate = 86400

/**
 * Public, indexable static pages (locale-less paths).
 * German (default) is unprefixed, English lives under /en —
 * both variants are emitted for every path.
 */
const STATIC_PATHS: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}> = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/owner/info', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/hunter/info', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/agent/info', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/listings', priority: 0.8, changeFrequency: 'daily' },
  { path: '/agents', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/marketplace', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/partners', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/security', priority: 0.3, changeFrequency: 'yearly' },
]

function entriesForPath(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  lastModified: Date
): MetadataRoute.Sitemap {
  const deUrl = `${BASE_URL}${path}` || BASE_URL
  const enUrl = `${BASE_URL}/en${path}`
  const alternates = { languages: { de: deUrl, en: enUrl } }

  return [
    { url: deUrl, lastModified, changeFrequency, priority, alternates },
    {
      url: enUrl,
      lastModified,
      changeFrequency,
      priority: Math.max(priority - 0.1, 0.1),
      alternates,
    },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((p) =>
    entriesForPath(p.path, p.priority, p.changeFrequency, now)
  )

  // Published listing pages (/p/<slug>). Uses the anon key — listings shown
  // here are public anyway, and RLS applies. Failures degrade gracefully to
  // the static list so the sitemap never 500s.
  try {
    const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
    const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    if (url && anonKey) {
      const supabase = createClient(url, anonKey)
      const { data: listings } = await supabase
        .from('listings')
        .select('slug, place_id, updated_at')
        .in('status', ['published', 'active'])
        .limit(5000)

      for (const listing of listings ?? []) {
        const ref = listing.slug || listing.place_id
        if (!ref) continue
        entries.push(...entriesForPath(
          `/p/${ref}`,
          0.7,
          'weekly',
          listing.updated_at ? new Date(listing.updated_at) : now
        ))
      }
    }
  } catch {
    // Sitemap must never fail the build or the request.
  }

  return entries
}
