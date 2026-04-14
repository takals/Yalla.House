import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/hunter'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env['NEXT_PUBLIC_SUPABASE_URL']!,
      process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Auth exchange failed — redirect to login with error
      const loginUrl = new URL('/auth/login', origin)
      loginUrl.searchParams.set('error', 'auth_failed')
      if (next && next !== '/owner') loginUrl.searchParams.set('next', next)
      return NextResponse.redirect(loginUrl.toString())
    }

    if (data.user) {
      // Ensure public.users row exists (FK required by listings)
      await (supabase.from('users') as any).upsert(
        {
          id: data.user.id,
          email: data.user.email ?? '',
          language: 'de',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      // Determine redirect based on 'next' param or default to /owner
      let redirectUrl = next
      if (!next || next === '/owner') {
        // Default: redirect to /owner dashboard
        redirectUrl = '/owner'
      }

      // Ensure URL is safe and relative
      if (redirectUrl && !redirectUrl.startsWith('/')) {
        redirectUrl = '/owner'
      }

      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // No code provided — redirect to login with error
  const loginUrl = new URL('/auth/login', origin)
  loginUrl.searchParams.set('error', 'auth_failed')
  return NextResponse.redirect(loginUrl.toString())
}
