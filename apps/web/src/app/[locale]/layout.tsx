import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { AuthGateProvider } from '@/components/auth-gate-provider'
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
    alternates: {
      canonical: isEnglish ? 'https://yalla.house/en' : 'https://yalla.house',
      languages: {
        de: 'https://yalla.house',
        en: 'https://yalla.house/en',
        'x-default': 'https://yalla.house',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Yalla.House',
      locale: isEnglish ? 'en_US' : 'de_DE',
      alternateLocale: isEnglish ? ['de_DE'] : ['en_US'],
      title: baseTitle,
      description: baseDescription,
      url: isEnglish ? 'https://yalla.house/en' : 'https://yalla.house',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: baseTitle,
        },
      ],
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
      <AuthGateProvider locale={locale}>
        {children}
      </AuthGateProvider>
    </NextIntlClientProvider>
  )
}
