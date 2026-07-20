import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/newsletter/confirm?token=...
 * Completes double opt-in: marks the subscriber confirmed, then redirects home.
 */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yalla.house'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.redirect(`${BASE_URL}/?newsletter=invalid`)

  const service = createServiceClient()
  const { data: sub } = await (service.from('newsletter_subscribers') as any)
    .select('id, confirmed_at')
    .eq('confirm_token', token)
    .maybeSingle()

  if (!sub) return NextResponse.redirect(`${BASE_URL}/?newsletter=invalid`)

  if (!sub.confirmed_at) {
    await (service.from('newsletter_subscribers') as any)
      .update({ confirmed_at: new Date().toISOString(), unsubscribed_at: null, updated_at: new Date().toISOString() })
      .eq('id', sub.id)
  }
  return NextResponse.redirect(`${BASE_URL}/?newsletter=confirmed`)
}
