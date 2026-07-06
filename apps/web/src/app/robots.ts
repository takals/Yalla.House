import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Public marketing pages live under the same prefixes as the
        // dashboards, so allow them explicitly. Longest-match wins, which
        // means these override the directory-level disallows below.
        allow: [
          '/',
          '/owner/info',
          '/hunter/info',
          '/agent/info',
          '/en/owner/info',
          '/en/hunter/info',
          '/en/agent/info',
        ],
        disallow: ['/owner/', '/hunter/', '/agent/', '/admin/', '/api/'],
      },
    ],
    sitemap: 'https://yalla.house/sitemap.xml',
  }
}
