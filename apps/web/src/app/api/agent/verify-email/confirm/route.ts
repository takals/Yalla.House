import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const MAX_ATTEMPTS = 5

/**
 * POST /api/agent/verify-email/confirm
 * Body: { email, code }
 * Confirms the OTP and, on success, verifies the agent via company email.
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

  const { data: otp } = await (service.from('agent_email_otps') as any)
    .select('id, code, expires_at, attempts, consumed_at')
    .eq('user_id', user.id)
    .eq('email', email)
    .is('consumed_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!otp) {
    return NextResponse.json({ error: 'No active code. Request a new one.' }, { status: 400 })
  }
  if (new Date(otp.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'That code expired. Request a new one.' }, { status: 400 })
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many incorrect attempts. Request a new code.' }, { status: 429 })
  }
  if (otp.code !== code) {
    await (service.from('agent_email_otps') as any)
      .update({ attempts: otp.attempts + 1 }).eq('id', otp.id)
    return NextResponse.json({ error: 'Incorrect code. Please check and try again.' }, { status: 400 })
  }

  // Success — consume the code and verify the agent
  await (service.from('agent_email_otps') as any)
    .update({ consumed_at: new Date().toISOString() }).eq('id', otp.id)

  const now = new Date().toISOString()
  await (service.from('agent_profiles') as any)
    .update({ verified_at: now, verified_method: 'company_email', verified_email: email })
    .eq('user_id', user.id)

  await (service.from('agent_verifications') as any).insert({
    user_id: user.id, method: 'company_email', verified_email: email,
    status: 'approved', reason: `Verified via company email (${email})`, decided_at: now,
  })

  return NextResponse.json({ status: 'approved' })
}
