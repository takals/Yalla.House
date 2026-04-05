import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'

const locales = ['de', 'en'] as const

export const metadata: Metadata = {
  title: {
    default: 'Yalla.House — Immobilie selbst verkaufen',
    template: '%s | Yalla.House',
  },
  description: 'Verkaufen ohne Makler. Ihre Immobilie auf ImmobilienScout24, Immowelt und mehr — ohne Courtage.',
  openGraph: {
    siteName: 'Yalla.House',
    locale: 'de_DE',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
