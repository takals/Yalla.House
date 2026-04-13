import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  metadataBase: new URL('https://yalla.house'),
  title: {
    default: 'Yalla.House — Immobilie selbst verkaufen',
    template: '%s | Yalla.House',
  },
  description: 'Verkaufen Sie Ihre Immobilie in Deutschland ohne Makler — kostenloses Eigentümer-Dashboard für Provisionsfrei-Verkauf.',
  keywords: [
    'Immobilie verkaufen Deutschland',
    'Makler-Alternative',
    'Provisionsfrei',
    'ImmoScout24',
    'Immowelt',
  ],
  authors: [{ name: 'Yalla.House' }],
  creator: 'Yalla.House',
  publisher: 'Yalla.House',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    alternateLocale: ['en_GB'],
    url: 'https://yalla.house',
    siteName: 'Yalla.House',
    title: 'Yalla.House — Immobilie selbst verkaufen',
    description: 'Verkaufen Sie Ihre Immobilie ohne Makler. Kostenlos. Behalten Sie jede Provision.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Yalla.House - Immobilie selbst verkaufen',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yalla.House — Immobilie selbst verkaufen',
    description: 'Verkaufen Sie Ihre Immobilie ohne Makler. Kostenlos. Behalten Sie jede Provision.',
    images: ['/og-image.png'],
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
  '@type': 'RealEstateAgent',
  name: 'Yalla.House',
  description: 'German flat-fee property selling platform. No commission, no agent. List on ImmoScout24 and Immowelt without an estate agent.',
  url: 'https://yalla.house',
  logo: 'https://yalla.house/og-image.png',
  areaServed: { '@type': 'Country', name: 'Germany' },
  priceRange: 'Flat fee',
  sameAs: [],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="de" className={jakarta.variable}>
      <head>
        <link rel="canonical" href="https://yalla.house" />
        <link rel="alternate" hrefLang="de" href="https://yalla.house" />
        <link rel="alternate" hrefLang="en" href="https://yalla.house/en" />
        <link rel="alternate" hrefLang="x-default" href="https://yalla.house" />
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
