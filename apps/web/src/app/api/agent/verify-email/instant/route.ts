import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isCompanyEmail, emailMatchesWebsite, registrableDomain } from '@/lib/email-domain'

/**
 * POST /api/agent/verify-email/instant
 * No body. Verifies instantly when the agent's *account* email is already a
 * company (non-free) domain — magic-link signup already proved they control
 * that inbox, so no fresh OTP is needed. If the profile has a website, the
 * account email must be on the same registrable domain.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const accountEmail = (user.email ?? '').trim().toLowerCase()
  if (!isCompanyEmail(accountEmail)) {
    return NextResponse.json({ error: 'Your account email is not a company email.' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: profile } = await (service.from('agent_profiles') as any)
    .select('agency_name, verified_at, website').eq('user_id', user.id).maybeSingle()
  if (!profile?.agency_name) {
    return NextResponse.json({ error: 'Complete your profile (agency name) first.' }, { status: 400 })
  }
  if (profile.verified_at) {
    return NextResponse.json({ status: 'approved', alreadyVerified: true })
  }
  // If a website is on file, the account email must match its domain.
  if (profile.website && registrableDomain(profile.website) && !emailMatchesWebsite(accountEmail, profile.website)) {
    return NextResponse.json({ error: 'domain_mismatch' }, { status: 400 })
  }

  const now = new Date().toISOString()
  await (service.from('agent_profiles') as any)
    .update({ verified_at: now, verified_method: 'company_email', verified_email: accountEmail })
    .eq('user_id', user.id)

  await (service.from('agent_verifications') as any).insert({
    user_id: user.id, method: 'company_email', verified_email: accountEmail,
    status: 'approved', reason: `Verified via company account email (${accountEmail})`, decided_at: now,
  })

  return NextResponse.json({ status: 'approved' })
}
