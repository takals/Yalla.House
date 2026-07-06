import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { AuthGateProvider } from '@/components/auth-gate-provider'
import { HubSpotTracking } from '@/components/hubspot-tracking'
import { Analytics, GTMNoScript } from '@/components/analytics'
import '../globals.css'

const locales = ['de', 'en'] as const

type LocaleParam = (typeof locales)[number]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'
  const t = await getTranslations('meta')

  const baseTitle = t('siteTitle')
  const baseDescription = t('siteDescription')

  return {
    title: {
      default: baseTitle,
      template: '%s | Yalla.House',
    },
    description: baseDescription,
    // NOTE: canonical + hreflang alternates are set per page via
    // pageAlternates() in lib/seo.ts — a layout-level canonical would
    // wrongly point every subpage at the homepage.
    openGraph: {
      type: 'website',
      siteName: 'Yalla.House',
      locale: isEnglish ? 'en_GB' : 'de_DE',
      alternateLocale: isEnglish ? ['de_DE'] : ['en_GB'],
      title: baseTitle,
      description: baseDescription,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: baseTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description: baseDescription,
      images: ['/og-image.png'],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as LocaleParam)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <GTMNoScript />
      <AuthGateProvider locale={locale}>
        {children}
      </AuthGateProvider>
      <HubSpotTracking />
      <Analytics />
    </NextIntlClientProvider>
  )
}
