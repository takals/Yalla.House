import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isValidEmail, isFreeEmailProvider } from '@/lib/email-domain'

/**
 * POST /api/agent/verify-email/start
 * Body: { email }
 * Sends a 6-digit code to a company (non-free) email to prove inbox control.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const service = createServiceClient()
  const { data: profile } = await (service.from('agent_profiles') as any)
    .select('agency_name, verified_at').eq('user_id', user.id).maybeSingle()
  if (!profile?.agency_name) {
    return NextResponse.json({ error: 'Complete your profile (agency name) first.' }, { status: 400 })
  }
  if (profile.verified_at) {
    return NextResponse.json({ status: 'approved', alreadyVerified: true })
  }

  const body = await request.json().catch(() => ({}))
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (isFreeEmailProvider(email)) {
    return NextResponse.json({ error: 'free_email' }, { status: 400 })
  }

  // Rate limit: max 5 codes per hour per user
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await (service.from('agent_email_otps') as any)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since)
  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { error: insErr } = await (service.from('agent_email_otps') as any).insert({
    user_id: user.id, email, code, expires_at: expiresAt,
  })
  if (insErr) {
    console.error('verify-email start insert error:', insErr)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL ?? 'Yalla.House <noreply@yalla.house>'
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1F2933">
      <h2 style="color:#1F2933;margin:0 0 8px">Verify your agency</h2>
      <p style="color:#5B6672;margin:0 0 20px">Enter this code on Yalla.House to confirm this is your company email:</p>
      <div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#D4764E;background:#FFF5EE;border:1px solid #F3D9CC;border-radius:12px;padding:16px;text-align:center">${code}</div>
      <p style="color:#9AA3AF;font-size:13px;margin:20px 0 0">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from, to: email,
        subject: `Your Yalla.House verification code: ${code}`,
        html,
      }),
    })
    if (!res.ok) { const rt = (await res.text()).slice(0, 300); console.error('resend fail', res.status, rt); throw new Error(`Resend ${res.status}: ${rt}`) }
  } catch (e) {
    console.error('verify-email send error:', e)
    const debug = new URL(request.url).searchParams.get('debug') === '1'
    return NextResponse.json({ error: 'Could not send the code. Please try again shortly.', ...(debug ? { detail: String(e).slice(0, 300) } : {}) }, { status: 502 })
  }

  return NextResponse.json({ sent: true, email })
}
