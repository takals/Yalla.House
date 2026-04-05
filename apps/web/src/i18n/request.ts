import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['de', 'en'] as const
type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = ((await requestLocale) ?? 'de') as Locale

  if (!locales.includes(locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
