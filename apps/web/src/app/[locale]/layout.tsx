import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

const locales = ['de', 'en'] as const

type LocaleParam = (typeof locales)[number]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  const baseTitle = isEnglish ? 'Yalla.House — Sell Your Home. Keep Every Pound.' : 'Yalla.House — Immobilie selbst verkaufen'
  const baseDescription = isEnglish
    ? 'Sell your home without an agent. Free. Commission-free. Keep every pound.'
    : 'Verkaufen Sie Ihre Immobilie ohne Makler. Kostenlos. Behalten Sie jede Provision.'

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
      locale: isEnglish ? 'en_GB' : 'de_DE',
      alternateLocale: isEnglish ? ['de_DE'] : ['en_GB'],
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
      {children}
    </NextIntlClientProvider>
  )
}
