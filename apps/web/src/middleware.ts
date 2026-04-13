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

// Routes that require authentication.
// TEMPORARILY EMPTY — dashboards are open during the public preview phase so
// visitors can explore each role without creating an account.
//
// When ready to gate dashboards, add paths like:
//   const protectedPaths = ['/owner', '/hunter', '/agent', '/admin']
//
// This will enforce session validation and redirect unauthenticated users to /auth/login
const protectedPaths: string[] = []

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path (stripped of locale prefix) is protected
  const pathnameWithoutLocale = pathname.replace(/^\/(de|en)/, '')
  const isProtected = protectedPaths.some(p => pathnameWithoutLocale.startsWith(p))

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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
