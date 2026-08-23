import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/agent/verify-email/confirm
 * Body: { email, code }
 * Confirms the OTP and, on success, verifies the agent via company email.
 *
 * Verification is done by verify_agent_otp(), which takes a row lock before
 * comparing. Reading the row here, comparing in JS, then writing attempts+1
 * would be racy — fire 500 parallel requests and every one reads attempts=0,
 * so the ceiling never bites. It also burns the code on lockout, so an
 * attacker cannot wait out a window and resume against a still-valid code.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const email = String(body?.email ?? '').trim().toLowerCase()
  const code = String(body?.code ?? '').trim()
  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 })
  }

  const service = createServiceClient()

  // Caps codes per period. verify_agent_otp caps attempts PER CODE; without
  // this an attacker requests a fresh code and gets five more tries forever.
  const { data: limit } = await (service.rpc as any)('check_rate_limit', {
    p_scope: 'otp:verify',
    p_key: `email:${email}`,
    p_limit: 5,
    p_window_seconds: 600,
  })
  if (limit && limit.allowed === false) {
    return NextResponse.json(
      { error: 'Too many attempts. Please request a new code.' },
      { status: 429, headers: { 'Retry-After': String(limit.retry_after ?? 600) } }
    )
  }

  const { data: result, error: verifyErr } = await (service.rpc as any)('verify_agent_otp', {
    p_user_id: user.id,
    p_code: code,
    p_max_attempts: 5,
  })

  if (verifyErr) {
    console.error('verify-email confirm rpc error:', verifyErr)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!result?.ok) {
    // 'invalid' and 'locked' get the SAME message on purpose — distinguishing
    // them turns this endpoint into an account-state oracle.
    return NextResponse.json(
      { error: 'That code is not valid. Please request a new one.' },
      { status: result?.reason === 'locked' ? 429 : 400 }
    )
  }

  // Record the address that was actually proven, not whatever the client sent.
  const { data: proven } = await (service.from('agent_email_otps') as any)
    .select('email')
    .eq('user_id', user.id)
    .not('consumed_at', 'is', null)
    .order('consumed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const verifiedEmail: string = proven?.email ?? email

  const now = new Date().toISOString()
  await (service.from('agent_profiles') as any)
    .update({ verified_at: now, verified_method: 'company_email', verified_email: verifiedEmail })
    .eq('user_id', user.id)

  await (service.from('agent_verifications') as any).insert({
    user_id: user.id, method: 'company_email', verified_email: verifiedEmail,
    status: 'approved', reason: `Verified via company email (${verifiedEmail})`, decided_at: now,
  })

  return NextResponse.json({ status: 'approved' })
}
