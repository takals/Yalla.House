'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type AgreementType = 'agent_partner' | 'owner_tos' | 'hunter_tos' | 'provider_agreement'

const CURRENT_VERSIONS: Record<AgreementType, string> = {
  agent_partner: '1.0',
  owner_tos: '1.0',
  hunter_tos: '1.0',
  provider_agreement: '1.0',
}

/** Map agreement types to their dashboard redirect paths */
const REDIRECT_PATHS: Record<AgreementType, string> = {
  agent_partner: '/agent',
  owner_tos: '/owner',
  hunter_tos: '/hunter',
  provider_agreement: '/partner',
}

/** Map agreement types to their translation namespaces */
export const AGREEMENT_NAMESPACES: Record<AgreementType, string> = {
  agent_partner: 'agentAgreement',
  owner_tos: 'ownerAgreement',
  hunter_tos: 'hunterAgreement',
  provider_agreement: 'providerAgreement',
}

/** Section keys per agreement type — ordered list of { titleKey, contentKey } */
export const AGREEMENT_SECTIONS: Record<AgreementType, Array<{ titleKey: string; contentKey: string }>> = {
  agent_partner: [
    { titleKey: 'scopeTitle', contentKey: 'scopeContent' },
    { titleKey: 'commissionTitle', contentKey: 'commissionContent' },
    { titleKey: 'dataHandlingTitle', contentKey: 'dataHandlingContent' },
    { titleKey: 'portalTitle', contentKey: 'portalContent' },
    { titleKey: 'conductTitle', contentKey: 'conductContent' },
    { titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { titleKey: 'terminationTitle', contentKey: 'terminationContent' },
    { titleKey: 'governingLawTitle', contentKey: 'governingLawContent' },
  ],
  owner_tos: [
    { titleKey: 'scopeTitle', contentKey: 'scopeContent' },
    { titleKey: 'accuracyTitle', contentKey: 'accuracyContent' },
    { titleKey: 'agentMatchingTitle', contentKey: 'agentMatchingContent' },
    { titleKey: 'viewingsTitle', contentKey: 'viewingsContent' },
    { titleKey: 'dataPrivacyTitle', contentKey: 'dataPrivacyContent' },
    { titleKey: 'feesTitle', contentKey: 'feesContent' },
    { titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { titleKey: 'cancellationTitle', contentKey: 'cancellationContent' },
    { titleKey: 'governingLawTitle', contentKey: 'governingLawContent' },
  ],
  hunter_tos: [
    { titleKey: 'scopeTitle', contentKey: 'scopeContent' },
    { titleKey: 'dataSharingTitle', contentKey: 'dataSharingContent' },
    { titleKey: 'viewingObligationsTitle', contentKey: 'viewingObligationsContent' },
    { titleKey: 'conductTitle', contentKey: 'conductContent' },
    { titleKey: 'privacyTitle', contentKey: 'privacyContent' },
    { titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { titleKey: 'terminationTitle', contentKey: 'terminationContent' },
    { titleKey: 'governingLawTitle', contentKey: 'governingLawContent' },
  ],
  provider_agreement: [
    { titleKey: 'scopeTitle', contentKey: 'scopeContent' },
    { titleKey: 'standardsTitle', contentKey: 'standardsContent' },
    { titleKey: 'pricingTitle', contentKey: 'pricingContent' },
    { titleKey: 'commissionTitle', contentKey: 'commissionContent' },
    { titleKey: 'insuranceTitle', contentKey: 'insuranceContent' },
    { titleKey: 'reviewsTitle', contentKey: 'reviewsContent' },
    { titleKey: 'dataHandlingTitle', contentKey: 'dataHandlingContent' },
    { titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { titleKey: 'terminationTitle', contentKey: 'terminationContent' },
    { titleKey: 'governingLawTitle', contentKey: 'governingLawContent' },
  ],
}

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
 * Get the current version string for an agreement type.
 */
export function getAgreementVersion(type: AgreementType): string {
  return CURRENT_VERSIONS[type]
}

/** Map role path prefixes to their agreement types */
const ROLE_AGREEMENTS: Record<string, AgreementType> = {
  agent: 'agent_partner',
  owner: 'owner_tos',
  hunter: 'hunter_tos',
  partner: 'provider_agreement',
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
