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

  // Cap codes per period. Without this an attacker cycles fresh codes to reset
  // the per-code attempt ceiling that verify_agent_otp() enforces.
  const { data: limit } = await (service.rpc as any)('check_rate_limit', {
    p_scope: 'otp:issue',
    p_key: `user:${user.id}`,
    p_limit: 5,
    p_window_seconds: 3600,
  })
  if (limit && limit.allowed === false) {
    return NextResponse.json(
      { error: 'Too many codes requested. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retry_after ?? 3600) } }
    )
  }

  // issue_agent_otp derives the code from gen_random_uuid() and stores only a
  // SHA-256 hash — Math.random() is seeded and predictable, which is fatal for
  // an OTP. It also invalidates any code still outstanding for this user.
  // The code comes back once and is not recoverable, so email it immediately.
  const { data: issued, error: issueErr } = await (service.rpc as any)('issue_agent_otp', {
    p_user_id: user.id,
    p_email: email,
    p_ttl_minutes: 10,
  })
  if (issueErr || !issued?.code) {
    console.error('verify-email start issue error:', issueErr)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
  const code: string = issued.code

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
        // Deliberately NOT in the subject — subject lines appear in lock-screen
        // notification previews and are retained in the clear by mail gateways.
        subject: 'Your Yalla.House verification code',
        html,
      }),
    })
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)
  } catch (e) {
    console.error('verify-email send error:', e)
    return NextResponse.json({ error: 'Could not send the code. Please try again shortly.' }, { status: 502 })
  }

  return NextResponse.json({ sent: true, email })
}
