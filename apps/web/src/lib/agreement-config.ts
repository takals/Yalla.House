/**
 * Agreement configuration — pure data, no server dependencies.
 * Imported by both client components and server actions.
 */

export type AgreementType = 'agent_partner' | 'owner_tos' | 'hunter_tos' | 'provider_agreement'

export const CURRENT_VERSIONS: Record<AgreementType, string> = {
  agent_partner: '1.0',
  owner_tos: '1.0',
  hunter_tos: '1.0',
  provider_agreement: '1.0',
}

/** Map agreement types to their dashboard redirect paths */
export const REDIRECT_PATHS: Record<AgreementType, string> = {
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

/** Map role path prefixes to their agreement types */
export const ROLE_AGREEMENTS: Record<string, AgreementType> = {
  agent: 'agent_partner',
  owner: 'owner_tos',
  hunter: 'hunter_tos',
  partner: 'provider_agreement',
}

/**
 * Get the current version string for an agreement type.
 */
export function getAgreementVersion(type: AgreementType): string {
  return CURRENT_VERSIONS[type]
}
