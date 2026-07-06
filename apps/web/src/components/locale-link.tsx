'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Link>

/**
 * Locale-aware drop-in replacement for next/link.
 *
 * The app uses next-intl with localePrefix 'as-needed': German (default)
 * is unprefixed, English lives under /en. Plain next/link with a root
 * path like "/services" silently drops an English visitor back to the
 * German page. This wrapper prefixes internal paths with the active
 * locale so navigation stays in the visitor's language.
 */
export function LocaleLink({ href, ...rest }: Props) {
  const locale = useLocale()

  let resolved = href
  if (
    locale !== 'de' &&
    typeof href === 'string' &&
    href.startsWith('/') &&
    !href.startsWith(`/${locale}/`) &&
    href !== `/${locale}`
  ) {
    resolved = href === '/' ? `/${locale}` : `/${locale}${href}`
  }

  return <Link href={resolved} {...rest} />
}
