import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'
import { upsertHubSpotContact } from '@/lib/hubspot'
import { inngest } from '@/lib/inngest/client'

/** Map the post-login destination onto the role the referral is credited as. */
function roleFromDestination(destination: string): 'owner' | 'hunter' | 'agent' | 'partner' {
  if (/^\/(en\/|de\/)?owner\b/.test(destination)) return 'owner'
  if (/^\/(en\/|de\/)?agent\b/.test(destination)) return 'agent'
  if (/^\/(en\/|de\/)?partner\b/.test(destination)) return 'partner'
  return 'hunter'
}

/**
 * Turn a referral cookie into a referrals row plus the SIGNUP milestone.
 *
 * Best-effort throughout: a broken referral must never stop someone signing in.
 */
async function attributeReferral({
  supabase,
  referredUserId,
  refCode,
  destination,
}: {
  supabase: any
  referredUserId: string
  refCode: string
  destination: string
}): Promise<void> {
  try {
    const { data: referrer } = await supabase
      .from('referrers')
      .select('id, user_id')
      .eq('referrer_code', refCode.toUpperCase())
      .eq('status', 'active')
      .maybeSingle()

    // Unknown code, or someone following their own link.
    if (!referrer || referrer.user_id === referredUserId) return

    // Already credited to someone — first referrer wins.
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', referredUserId)
      .maybeSingle()
    if (existing) return

    const { error } = await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_user_id: referredUserId,
      referred_role: roleFromDestination(destination),
    })
    if (error) return

    await inngest.send({
      name: 'referral/event.created',
      data: { referredUserId, milestone: 'SIGNUP' },
    })
  } catch (err) {
    console.error('Referral attribution failed:', err)
  }
}

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

      // Determine redirect — respect explicit `next` param, otherwise
      // route to the user's highest-priority dashboard based on roles.
      let redirectUrl = next

      // Safety: ensure URL is relative
      if (!redirectUrl.startsWith('/')) {
        redirectUrl = '/hunter'
      }

      // Redirect legacy routes to their replacements
      if (redirectUrl.match(/^\/(en\/)?owner\/new\b/)) {
        redirectUrl = redirectUrl.replace(/owner\/new/, 'owner/workspace')
      }

      // Pull roles once — used both for dashboard routing and HubSpot sync.
      const { data: rolesRows } = await (supabase.from('user_roles') as any)
        .select('role')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
      const userRoles: string[] = Array.isArray(rolesRows)
        ? rolesRows.map((r: { role: string }) => r.role)
        : []

      // If no explicit destination was set (default /hunter fallback),
      // route to the user's highest-priority dashboard based on roles.
      const isDefaultRedirect = redirectUrl === '/hunter'
      if (isDefaultRedirect) {
        if (userRoles.length > 0) {
          const roleSet = new Set(userRoles)
          // Priority: admin > agent > owner > hunter
          if (roleSet.has('admin')) {
            redirectUrl = '/admin'
          } else if (roleSet.has('agent')) {
            redirectUrl = '/agent'
          } else if (roleSet.has('owner')) {
            redirectUrl = '/owner'
          }
          // else stays /hunter (default)
        } else {
          // No roles at all — first-time user, show role picker
          redirectUrl = '/auth/welcome'
        }
      }

      // Credit the referrer who sent them, if a referral link brought them here.
      // First sign-in only: the UNIQUE constraint on (referrer_id,
      // referred_user_id) makes a repeat harmless, but there's no reason to try.
      const refCode = cookieStore.get('yalla_ref')?.value
      if (refCode) {
        await attributeReferral({
          supabase,
          referredUserId: data.user.id,
          refCode,
          destination: redirectUrl,
        })
        cookieStore.set('yalla_ref', '', { path: '/', maxAge: 0 })
      }

      // Best-effort sync to HubSpot. Never blocks auth — see lib/hubspot.ts.
      await upsertHubSpotContact({
        email: data.user.email ?? '',
        fullName: meta.full_name ?? meta.name ?? null,
        roles: userRoles,
        language: 'de',
        referralSource: cookieStore.get('yalla_referral_source')?.value,
      })

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
