import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { fromMinorUnits } from '@yalla/integrations'
import { getCountryConfig, getCurrencySymbol } from '@/lib/country-config'
import { countryFromLocale } from '@/lib/detect-country'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SendBriefClient } from './send-brief-client'

interface Props {
  searchParams: Promise<{ agents?: string; listing?: string }>
}

export default async function SendBriefPage({ searchParams }: Props) {
  const { agents: agentIds, listing: listingId } = await searchParams
  const t = await getTranslations('ownerAgentInvite')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID
  const isAuthenticated = !!user

  // Resolve country for commission info
  const countryCode = countryFromLocale(locale)
  const countryConfig = getCountryConfig(countryCode)

  // Fetch owner's listings for the listing picker
  const { data: listingsData } = await (supabase as any)
    .from('listings')
    .select('id, address_line1, city, postcode, bedrooms, property_type, sale_price, country_code')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  const listings = (listingsData ?? []) as Array<{
    id: string
    address_line1: string | null
    city: string | null
    postcode: string | null
    bedrooms: number | null
    property_type: string | null
    sale_price: number | null
    country_code: string | null
  }>

  // Pre-select listing if provided
  const selectedListing = listingId
    ? listings.find(l => l.id === listingId) ?? listings[0]
    : listings[0]

  // Fetch selected agents from agent_profiles
  const selectedAgentIds = agentIds?.split(',').filter(Boolean) ?? []
  let selectedAgents: Array<{
    id: string
    agencyName: string
    email: string | null
    phone: string | null
    postcode: string | null
    verifiedAt: string | null
  }> = []

  if (selectedAgentIds.length > 0) {
    const { data: agentsData } = await (supabase as any)
      .from('agent_profiles')
      .select('user_id, agency_name, email, phone, postcode, verified_at')
      .in('user_id', selectedAgentIds)

    selectedAgents = (agentsData ?? []).map((a: any) => ({
      id: a.user_id,
      agencyName: a.agency_name ?? 'Unknown Agency',
      email: a.email,
      phone: a.phone,
      postcode: a.postcode,
      verifiedAt: a.verified_at,
    }))
  }

  // Get owner name for the email preview
  let ownerName = 'Property Owner'
  if (user) {
    const { data: ownerProfile } = await (supabase as any)
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (ownerProfile?.full_name) ownerName = ownerProfile.full_name
  }

  // Build translations record for client component
  const tKeys = [
    'pageTitle', 'pageDescription', 'backButton',
    'propertyBriefTitle', 'address', 'bedrooms', 'bedroomsCount',
    'propertyType', 'description', 'price', 'noListingFound',
    'selectListing', 'selectListingHint',
    'tierTitle', 'tierAdvisory', 'tierAdvisoryDesc',
    'tierAssisted', 'tierAssistedDesc', 'tierManaged', 'tierManagedDesc',
    'notesTitle', 'notesPlaceholder',
    'whatNextTitle', 'step1Title', 'step1Desc',
    'step2Title', 'step2Desc', 'step3Title', 'step3Desc',
    'step4Title', 'step4Desc',
    'selectedAgentsTitle', 'noAgentsSelected', 'selectAgentsLink',
    'addMoreAgents', 'sendBriefNow', 'sending', 'sent',
    'errorSendFailed', 'errorGeneric', 'errorAuthRequired',
    'infoLabel', 'infoText', 'verified',
    'successTitle', 'successDesc', 'viewTracking',
    'signInRequired', 'signInDesc',
    // Branded preview keys
    'draftBriefTitle',
    'messageCenterNote', 'messageCenterDesc',
    'commissionTitle', 'commissionNote',
    'negotiateTitle', 'negotiateDesc',
    'reviewBriefButton',
    // Email preview keys
    'previewGreeting', 'previewPropertyCollaboration',
    'previewAdvisoryIntro', 'previewAdvisoryScope',
    'previewAdvisoryItem1', 'previewAdvisoryItem2', 'previewAdvisoryItem3',
    'previewAdvisoryOwnerNote',
    'previewAssistedIntro', 'previewAssistedScope',
    'previewAssistedItem1', 'previewAssistedItem2', 'previewAssistedItem3',
    'previewAssistedOwnerNote',
    'previewManagedIntro', 'previewManagedScope',
    'previewManagedItem1', 'previewManagedItem2', 'previewManagedItem3', 'previewManagedItem4',
    'previewManagedMultiAgent',
    'previewPropertyOverview', 'previewAddress', 'previewEstimatedValue',
    'previewPropertyType', 'previewSellerTimeline', 'previewViewingReadiness',
    'previewWorkspaceIntro',
    'previewWorkspaceItem1', 'previewWorkspaceItem2', 'previewWorkspaceItem3',
    'previewWorkspaceItem4', 'previewWorkspaceItem5',
    'previewTransparency', 'previewCta',
    'previewSelectGroup', 'previewUrgency',
    'previewViewListing', 'previewNoReply', 'previewInboxNotice',
    'previewSignoff', 'previewTeam',
    'previewBenefitHeading',
    'previewBenefit1Title', 'previewBenefit1Desc',
    'previewBenefit2Title', 'previewBenefit2Desc',
    'previewBenefit3Title', 'previewBenefit3Desc',
    'previewBenefit4Title', 'previewBenefit4Desc',
    'tierChangeHint',
  ] as const

  const translations: Record<string, string> = {}
  for (const key of tKeys) {
    try { translations[key] = t(key) } catch { translations[key] = '' }
  }

  // Format listings for client — include detail fields for email preview
  const formattedListings = listings.map(l => {
    const lConfig = getCountryConfig(l.country_code ?? countryCode)
    return {
      id: l.id,
      label: [l.address_line1, l.city, l.postcode].filter(Boolean).join(', '),
      address: [l.address_line1, l.city, l.postcode].filter(Boolean).join(', '),
      price: l.sale_price
        ? new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', { style: 'currency', currency: lConfig.currency, maximumFractionDigits: 0 }).format(fromMinorUnits(l.sale_price, lConfig.currency))
        : null,
      bedrooms: l.bedrooms,
      propertyType: l.property_type,
      city: l.city,
      postcode: l.postcode,
    }
  })

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents/search" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {translations.backButton}
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{translations.pageTitle}</h1>
        <p className="text-text-secondary">{translations.pageDescription}</p>
      </div>

      <SendBriefClient
        agents={selectedAgents}
        listings={formattedListings}
        selectedListingId={selectedListing?.id ?? null}
        isAuthenticated={isAuthenticated}
        translations={translations}
        currencySymbol={getCurrencySymbol(countryConfig.currency)}
        ownerName={ownerName}
      />
    </div>
  )
}
