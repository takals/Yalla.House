'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  type AgreementType,
  type AgreementRequired,
  CURRENT_VERSIONS,
  REDIRECT_PATHS,
  ROLE_AGREEMENTS,
} from './agreement-config'

// Re-export types for convenience (type-only exports are fine in 'use server' files)
export type { AgreementType, AgreementRequired } from './agreement-config'

/**
 * Check whether a user has signed a specific agreement (current version).
 * Returns the agreement record if signed, null otherwise.
 */
export async function checkAgreementStatus(userId: string, agreementType: AgreementType) {
  const supabase = await createClient()
  const version = CURRENT_VERSIONS[agreementType]

  const { data } = await (supabase as any)
    .from('user_agreements')
    .select('id, signed_at, signatory_name, version')
    .eq('user_id', userId)
    .eq('agreement_type', agreementType)
    .eq('version', version)
    .is('revoked_at', null)
    .maybeSingle() as { data: {
      id: string
      signed_at: string
      signatory_name: string | null
      version: string
    } | null }

  return data
}

/**
 * Server action: sign an agreement.
 * Records timestamp, IP, user_agent, version, locale, and country_code.
 */
export async function signAgreement(data: {
  agreementType: AgreementType
  signatoryName: string
  locale: string
  countryCode: string
  /** Where to send them after signing — e.g. back to the brief they were on. */
  nextPath?: string
}) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (!data.signatoryName.trim()) {
    return { error: 'Please enter your full name.' }
  }

  // Only ever redirect to a path on our own site.
  const destination =
    data.nextPath && /^\/(?!\/)/.test(data.nextPath)
      ? data.nextPath
      : REDIRECT_PATHS[data.agreementType]

  const version = CURRENT_VERSIONS[data.agreementType]
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headersList.get('x-real-ip') ?? null
  const userAgent = headersList.get('user-agent') ?? null

  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('user_agreements')
    .insert({
      user_id: auth.userId,
      agreement_type: data.agreementType,
      version,
      signatory_name: data.signatoryName,
      ip_address: ip,
      user_agent: userAgent,
      country_code: data.countryCode,
      locale: data.locale,
    }) as { error: { message: string } | null }

  if (error) {
    // Unique constraint violation = already signed
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      redirect(destination)
    }
    console.error('Failed to sign agreement:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  // Also update agent_profiles for backward compatibility if agent
  if (data.agreementType === 'agent_partner') {
    await (supabase as any)
      .from('agent_profiles')
      .upsert(
        {
          user_id: auth.userId,
          partner_agreement_signed_at: new Date().toISOString(),
          partner_agreement_version: version,
        },
        { onConflict: 'user_id' }
      )
  }

  redirect(destination)
}

/**
 * Gate a *commitment* behind its agreement — sending a proposal, publishing a
 * listing, booking a viewing, quoting for a job.
 *
 * Returns null when the user has already signed (carry on), or an
 * { agreementRequired, agreementPath } object the caller returns straight back
 * to the client. `useAuthAction().handleAuthRequired` picks it up and routes
 * the user to the signing page, then back to where they were.
 *
 * Prefer this over `requireAgreement` below: browsing a dashboard is not a
 * commitment, and asking someone to sign a contract before they have seen
 * anything costs us every visitor who wanted to look first.
 */
export async function requireSignedAgreement(
  userId: string,
  role: string
): Promise<AgreementRequired | null> {
  const agreementType = ROLE_AGREEMENTS[role]
  if (!agreementType) return null // Unknown role — no agreement required

  const existing = await checkAgreementStatus(userId, agreementType)
  if (existing) return null

  return { agreementRequired: true, agreementPath: `/${role}/agreement` }
}

/**
 * Gate a whole dashboard page behind its agreement.
 *
 * No longer called on dashboard entry — see `requireSignedAgreement`. Kept for
 * any flow that genuinely must gate an entire page.
 */
export async function requireAgreement(userId: string, role: string): Promise<void> {
  const agreementType = ROLE_AGREEMENTS[role]
  if (!agreementType) return // Unknown role — no agreement required

  const existing = await checkAgreementStatus(userId, agreementType)
  if (!existing) {
    redirect(`/${role}/agreement`)
  }
}
