import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Simple in-memory rate limiter for provider registration (anti-spam)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // 5 registrations per IP per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  entry.count++
  return entry.count <= RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      businessName,
      email,
      phone,
      website,
      categoryId,
      areas,
      accreditation,
      accreditationRef,
      _hp, // honeypot field — bots fill this in, humans don't
    } = body

    // Honeypot check — reject if hidden field is filled
    if (_hp) {
      // Silently accept but don't create anything (fool the bot)
      return NextResponse.json({ success: true, id: 'ok' })
    }

    // Basic validation
    if (!businessName || !email || !phone || !categoryId || !areas) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Create provider record
    // Use type assertion since marketplace tables were added after initial type generation
    const { data: rawProvider, error: providerError } = await (supabase
      .from('providers' as 'users') as unknown as ReturnType<typeof supabase.from>)
      .insert({
        business_name: businessName,
        email,
        phone,
        website: website || null,
        accreditation_body: accreditation || null,
        accreditation_ref: accreditationRef || null,
        // Listed straight away. 'pending' waited on an approval queue that
        // does not exist, so a signup was invisible for ever. Verification is
        // the earned badge (and still gates routed jobs), not the door.
        status: 'active',
        // providers_source_check permits only manual, directory_seed,
        // va_outreach, organic and referral. This route sent 'self_signup',
        // so EVERY provider signup failed on the insert from the day the form
        // shipped — which is why the table had no rows at all. A self-serve
        // signup is 'organic', or 'referral' when a referral link brought them.
        source: hdrs.get('cookie')?.includes('yalla_ref=') ? 'referral' : 'organic',
      } as Record<string, unknown>)
      .select('id')
      .single()

    if (providerError) {
      console.error('Provider insert error:', providerError)
      return NextResponse.json(
        { error: 'Failed to create provider' },
        { status: 500 }
      )
    }

    const provider = rawProvider as { id: string } | null

    // Link to service category
    if (provider) {
      await (supabase.from('provider_services' as 'users') as unknown as ReturnType<typeof supabase.from>)
        .insert({
          provider_id: provider.id,
          category_id: categoryId,
        } as Record<string, unknown>)

      // Add coverage areas (split by comma, trim whitespace)
      const postcodes = areas
        .split(',')
        .map((p: string) => p.trim().toUpperCase())
        .filter(Boolean)

      if (postcodes.length > 0) {
        await (supabase.from('provider_coverage_areas' as 'users') as unknown as ReturnType<typeof supabase.from>)
          .insert(
            postcodes.map((prefix: string) => ({
              provider_id: provider.id,
              postcode_prefix: prefix,
            } as Record<string, unknown>))
          )
      }
    }

    // Send them the magic link that turns this into an account.
    //
    // This is the whole point of the change: the form used to end at "your
    // listing is being reviewed, we'll email you" — no account, no dashboard,
    // and nothing in the product read the row it had just written. Now the
    // same submit that registers the business signs them in, and the callback
    // claims the row, grants the partner role and seeds partner_profiles.
    let magicLinkSent = false
    try {
      const auth = await createClient()
      const origin = hdrs.get('origin')
        ?? (hdrs.get('host') ? `https://${hdrs.get('host')}` : 'https://yalla.house')
      const { error: otpError } = await auth.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/api/auth/callback?next=%2Fpartner` },
      })
      if (otpError) console.error('Provider magic link error:', otpError)
      else magicLinkSent = true
    } catch (e) {
      // The business is registered either way — they can sign in from
      // /auth/login with the same address and the claim still runs.
      console.error('Provider magic link failed:', e)
    }

    return NextResponse.json({ success: true, id: provider?.id, magicLinkSent })
  } catch (err) {
    console.error('Provider registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
