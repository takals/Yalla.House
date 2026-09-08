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
        disallow: [
          '/owner/', '/hunter/', '/agent/', '/admin/', '/api/',
          // Honeypot paths (lib/security/honeypot.ts). Compliant crawlers read
          // this and stay away; anything that visits them anyway is ignoring
          // robots.txt by definition and gets blocked. Keep in sync.
          '/.env', '/.git/', '/wp-admin', '/wp-login.php', '/phpmyadmin',
          '/administrator', '/.aws/', '/backup.sql',
        ],
      },
    ],
    sitemap: 'https://yalla.house/sitemap.xml',
  }
}
