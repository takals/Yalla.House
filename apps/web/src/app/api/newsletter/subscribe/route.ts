import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isValidEmail } from '@/lib/email-domain'

/**
 * POST /api/newsletter/subscribe   (public, no account required)
 * Body: { email, locale?, source?, role?, country_code? }
 *
 * Double opt-in: stores a pending subscriber and emails a confirm link. The
 * subscriber only becomes active once they click it (GDPR-friendly consent).
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yalla.house'
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Yalla.House <noreply@yalla.house>'

function confirmEmail(locale: string, token: string): { subject: string; html: string } {
  const link = `${BASE_URL}/api/newsletter/confirm?token=${token}`
  const de = locale.startsWith('de')
  const subject = de ? 'Bitte bestätige deine Newsletter-Anmeldung' : 'Confirm your Yalla.House newsletter sign-up'
  const heading = de ? 'Nur noch ein Klick' : 'One quick click'
  const body = de
    ? 'Bestätige deine E-Mail-Adresse, um den Yalla.House-Newsletter zu erhalten:'
    : 'Confirm your email address to start receiving the Yalla.House newsletter:'
  const button = de ? 'Anmeldung bestätigen' : 'Confirm subscription'
  const foot = de
    ? 'Wenn du das nicht warst, ignoriere diese E-Mail einfach.'
    : "If this wasn't you, just ignore this email."
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1F2933">
      <h2 style="color:#1F2933;margin:0 0 8px">${heading}</h2>
      <p style="color:#5B6672;margin:0 0 20px">${body}</p>
      <a href="${link}" style="display:inline-block;background:#D4764E;color:#fff;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">${button}</a>
      <p style="color:#9AA3AF;font-size:13px;margin:22px 0 0">${foot}</p>
    </div>`
  return { subject, html }
}

async function sendConfirm(to: string, locale: string, token: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.error('newsletter subscribe: RESEND_API_KEY missing'); return false }
  const { subject, html } = confirmEmail(locale, token)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return true
  } catch (e) {
    console.error('newsletter confirm send error:', e)
    return false
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body?.email ?? '').trim().toLowerCase()
  const locale = String(body?.locale ?? 'en').slice(0, 5)
  const source = body?.source ? String(body.source).slice(0, 40) : null
  const role = body?.role ? String(body.role).slice(0, 20) : null
  const countryCode = body?.country_code ? String(body.country_code).slice(0, 2).toUpperCase() : null

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: existing } = await (service.from('newsletter_subscribers') as any)
    .select('id, confirm_token, confirmed_at, unsubscribed_at')
    .ilike('email', email)
    .maybeSingle()

  if (existing) {
    if (existing.confirmed_at && !existing.unsubscribed_at) {
      return NextResponse.json({ ok: true, status: 'already_subscribed' })
    }
    // Re-activate a pending or previously-unsubscribed address and re-send confirm.
    await (service.from('newsletter_subscribers') as any)
      .update({ unsubscribed_at: null, locale, source, role, country_code: countryCode, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    await sendConfirm(email, locale, existing.confirm_token)
    return NextResponse.json({ ok: true, status: 'pending' })
  }

  const { data: inserted, error } = await (service.from('newsletter_subscribers') as any)
    .insert({ email, locale, source, role, country_code: countryCode })
    .select('confirm_token')
    .single()

  if (error || !inserted) {
    console.error('newsletter subscribe insert error:', error)
    return NextResponse.json({ error: 'store_failed' }, { status: 500 })
  }

  await sendConfirm(email, locale, inserted.confirm_token)
  return NextResponse.json({ ok: true, status: 'pending' })
}
