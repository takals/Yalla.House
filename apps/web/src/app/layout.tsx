import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { getLocale } from 'next-intl/server'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

// Locale-specific metadata (title, description, canonical, og, twitter) is
// provided by src/app/[locale]/layout.tsx and the individual pages.
// This root layout only carries locale-neutral defaults.
export const metadata: Metadata = {
  metadataBase: new URL('https://yalla.house'),
  title: 'Yalla.House',
  authors: [{ name: 'Yalla.House' }],
  creator: 'Yalla.House',
  publisher: 'Yalla.House',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: '#D4764E',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Yalla.House',
  },
  applicationName: 'Yalla.House',
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Yalla.House',
  description:
    'Property technology platform. Free dashboards for owners, home hunters, and agents — sell privately or let agents compete. No commission.',
  url: 'https://yalla.house',
  logo: 'https://yalla.house/og-image.png',
  areaServed: [
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'Germany' },
  ],
  sameAs: [],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html suppressHydrationWarning lang={locale} className={jakarta.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
