import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'

const locales = ['de', 'en'] as const
const defaultLocale = 'de'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',  // /de/dashboard → /dashboard in DE, /en/dashboard in EN
  localeDetection: true,  // Detect browser Accept-Language header
})

// Routes that require authentication before anything renders.
//
// Deliberately short. Every role dashboard — owner, hunter, agent, partner,
// referrer — is explorable as a guest: those pages read with PREVIEW_USER_ID
// and render their empty states, while every write goes through
// requireAuth() in its server action and returns { authRequired: true }.
// The sign-in prompt therefore appears at the moment of commitment (save,
// publish, book, propose), not at the door. Only genuinely private surfaces
// stay here: the admin console and personal account settings.
const protectedPaths = ['/admin', '/settings']

// Public pages that would otherwise be swept up by a protected prefix.
const publicExceptions: string[] = []

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path (stripped of locale prefix) is protected
  const pathnameWithoutLocale = pathname.replace(/^\/(de|en)/, '')
  const isException = publicExceptions.some(p => pathnameWithoutLocale === p || pathnameWithoutLocale === p + '/')
  // Match on whole path segments, never on a raw string prefix: "/agents"
  // must not match "/agent", and "/partners" must not match "/partner".
  const isProtected = !isException && protectedPaths.some(
    p => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(p + '/')
  )

  // Apply i18n middleware first
  const intlResponse = intlMiddleware(request)

  if (!isProtected) return intlResponse

  // For protected routes: validate Supabase session
  const response = intlResponse ?? NextResponse.next()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    // Skip static files, Next.js internals, and API routes
    // `r/` is the referral link handler — a plain route, no locale prefix.
    '/((?!api|r/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|txt|xml)$).*)',
  ],
}
