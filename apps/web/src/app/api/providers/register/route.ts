import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
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
        status: 'pending',
        source: 'self_signup',
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

    return NextResponse.json({ success: true, id: provider?.id })
  } catch (err) {
    console.error('Provider registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
