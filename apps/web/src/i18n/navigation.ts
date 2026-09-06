import { createSharedPathnamesNavigation } from 'next-intl/navigation'

/**
 * Locale-aware navigation primitives.
 *
 * Use `redirect` from here, never from 'next/navigation', inside the [locale]
 * tree. next/navigation's redirect('/hunter') drops the locale prefix; with
 * localePrefix 'as-needed' and default 'de', an unprefixed path IS German, so a
 * first-ever visit to /en/hunter (no NEXT_LOCALE cookie yet) landed on the
 * German page. This helper reads the request locale and prefixes correctly.
 *
 * createSharedPathnamesNavigation is the v3 API and is deprecated in favour of
 * createNavigation, whose redirect requires { href, locale } at every call site.
 * When upgrading to next-intl v4, migrate here once and pass locale through.
 *
 * Known v3 behaviour: this redirect ALWAYS prefixes, including the default
 * locale (/de/hunter/passport). The intl middleware then normalises that to
 * /hunter/passport with one extra 307. Verified 6 Sep. Acceptable: one cheap
 * hop for DE visitors versus EN visitors landing on the wrong language.
 */
export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'de'

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})
