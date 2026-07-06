import type { Metadata } from 'next'

const BASE_URL = 'https://yalla.house'

/**
 * Build per-page canonical + hreflang alternates.
 *
 * German is the default locale and served unprefixed; English lives
 * under /en. Every indexable public page should call this from its
 * generateMetadata so the canonical points at the page itself (never
 * the homepage) and both language variants are cross-referenced.
 *
 * @param locale current locale ('de' | 'en')
 * @param path   locale-less path starting with '/', or '' for the homepage
 */
export function pageAlternates(
  locale: string,
  path = ''
): NonNullable<Metadata['alternates']> {
  const deUrl = `${BASE_URL}${path}` || BASE_URL
  const enUrl = `${BASE_URL}/en${path}`

  return {
    canonical: locale === 'en' ? enUrl : deUrl,
    languages: {
      de: deUrl,
      en: enUrl,
      'x-default': deUrl,
    },
  }
}
