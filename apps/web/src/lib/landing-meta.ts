import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'

/**
 * Metadata for the three role landing pages (/owner/info, /hunter/info,
 * /agent/info) and other audience-specific public pages.
 *
 * These pages live inside the dashboard route segments, whose layouts set
 * `robots: { index: false }` so the actual dashboards stay out of Google.
 * Next.js merges page metadata over layout metadata, so setting
 * `robots.index = true` here re-opens the landing page for indexing while the
 * dashboard pages around it stay hidden. It also gives each page its own
 * description + social card instead of the site-wide "Sell your property"
 * fallback, and emits canonical + hreflang via pageAlternates().
 */
export function landingMeta(opts: {
  locale: string
  path: string
  title: string
  description: string
}): Metadata {
  const { locale, path, title, description } = opts
  const url = locale === 'en' ? `https://yalla.house/en${path}` : `https://yalla.house${path}`
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: pageAlternates(locale, path),
    openGraph: {
      type: 'website',
      siteName: 'Yalla.House',
      locale: locale === 'en' ? 'en_GB' : 'de_DE',
      url,
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}
