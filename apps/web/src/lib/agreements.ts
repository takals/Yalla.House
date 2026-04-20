'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  type AgreementType,
  CURRENT_VERSIONS,
  REDIRECT_PATHS,
  ROLE_AGREEMENTS,
} from './agreement-config'

// Re-export type for convenience (type-only exports are fine in 'use server' files)
export type { AgreementType } from './agreement-config'

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
}) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (!data.signatoryName.trim()) {
    return { error: 'Please enter your full name.' }
  }

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
      redirect(REDIRECT_PATHS[data.agreementType])
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

  redirect(REDIRECT_PATHS[data.agreementType])
}

/**
 * Gate a dashboard page behind its agreement.
 * Call this at the top of each dashboard page.tsx (not layout — layout also renders /agreement child).
 * Redirects to /[role]/agreement if not signed. Returns void if signed.
 */
export async function requireAgreement(userId: string, role: string): Promise<void> {
  const agreementType = ROLE_AGREEMENTS[role]
  if (!agreementType) return // Unknown role — no agreement required

  const existing = await checkAgreementStatus(userId, agreementType)
  if (!existing) {
    redirect(`/${role}/agreement`)
  }
}
