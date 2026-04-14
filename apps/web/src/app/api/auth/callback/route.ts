import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Read the return URL from query param first, then fall back to cookie.
  // The cookie is the reliable source — Supabase's redirect chain can strip
  // query params depending on the provider and PKCE flow.
  const cookieStore = await cookies()
  const cookieReturn = cookieStore.get('yalla_auth_return')?.value
    ? decodeURIComponent(cookieStore.get('yalla_auth_return')!.value)
    : null

  const next = searchParams.get('next') ?? cookieReturn ?? '/hunter'

  if (code) {
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
      if (next && next !== '/hunter') loginUrl.searchParams.set('next', next)
      // Clear the return cookie on error too
      cookieStore.set('yalla_auth_return', '', { path: '/', maxAge: 0 })
      return NextResponse.redirect(loginUrl.toString())
    }

    if (data.user) {
      // Ensure public.users row exists (FK required by listings, agent_profiles, etc.)
      // Pull name + avatar from OAuth metadata (Google, Facebook provide these)
      const meta = data.user.user_metadata ?? {}
      await (supabase.from('users') as any).upsert(
        {
          id: data.user.id,
          email: data.user.email ?? '',
          full_name: meta.full_name ?? meta.name ?? null,
          avatar_url: meta.avatar_url ?? meta.picture ?? null,
          language: 'de',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

      // Determine redirect — use the resolved `next` value
      let redirectUrl = next

      // Safety: ensure URL is relative
      if (!redirectUrl.startsWith('/')) {
        redirectUrl = '/hunter'
      }

      // Clear the return cookie — it's been consumed
      cookieStore.set('yalla_auth_return', '', { path: '/', maxAge: 0 })

      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // No code provided — redirect to login with error
  const loginUrl = new URL('/auth/login', origin)
  loginUrl.searchParams.set('error', 'auth_failed')
  cookieStore.set('yalla_auth_return', '', { path: '/', maxAge: 0 })
  return NextResponse.redirect(loginUrl.toString())
}
