import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Database } from '@/types/database'
import { OwnerBriefPageClient } from './brief-page-client'
import { dateLocaleFromLocale } from '@/lib/country-config'

type ListingRow = Database['public']['Tables']['listings']['Row']
type AssignmentRow = Database['public']['Tables']['listing_agent_assignments']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type AgentProfileRow = Database['public']['Tables']['agent_profiles']['Row']

interface CoverageArea {
  country_code: string
  region?: string
  postcode_prefixes?: string[]
}

interface AgentWithProfile extends UserRow {
  profile?: AgentProfileRow | null
}

interface AssignmentWithAgent extends AssignmentRow {
  agent?: AgentWithProfile | null
}

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function OwnerBriefPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('brief')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch listing
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      id, owner_id, address_line1, address_line2, city, region, postcode, country_code,
      property_type, bedrooms, bathrooms, size_sqm, sale_price, description_de,
      seller_situation, preferred_completion, brief_sent_at, brief_agent_count
    `)
    .eq('id', id)
    .single()

  if (!listing || listing.owner_id !== userId) {
    redirect(`/${locale}/owner`)
  }

  // Fetch existing assignments for this listing
  const { data: assignments } = await (supabase as any)
    .from('listing_agent_assignments')
    .select(`
      id, agent_id, tier, status, created_at,
      agent:users!agent_id(id, full_name, email)
    `)
    .eq('listing_id', id)
    .order('created_at', { ascending: false })

  const existingAssignments: AssignmentWithAgent[] = assignments ?? []
  const existingAgentIds = new Set(existingAssignments.map(a => a.agent_id))

  // Extract postcode prefix (first 2-4 chars) for agent matching
  const postcodePrefix = listing.postcode?.slice(0, 4) ?? ''

  // Query agent_profiles filtered by coverage_areas
  const { data: allAgents } = await (supabase as any)
    .from('users')
    .select(`
      id, full_name, email,
      agent_profiles!inner(
        agency_name, verified_at, subscription_tier, coverage_areas, license_number
      )
    `)
    .limit(500)

  // Filter agents by postcode coverage
  const matchedAgents: AgentWithProfile[] = (allAgents ?? [])
    .filter((agent: any) => {
      if (!agent.agent_profiles || !Array.isArray(agent.agent_profiles)) return false
      const profile = agent.agent_profiles[0]
      if (!profile?.coverage_areas) return false

      try {
        const areas = Array.isArray(profile.coverage_areas)
          ? profile.coverage_areas
          : JSON.parse(profile.coverage_areas as any)

        return Array.isArray(areas) && areas.some((area: any) => {
          if (typeof area !== 'object') return false
          const prefixes = area.postcode_prefixes || []
          return prefixes.some((prefix: string) => postcodePrefix.startsWith(prefix))
        })
      } catch {
        return false
      }
    })
    .map((agent: any) => ({
      ...agent,
      profile: agent.agent_profiles?.[0] ?? null,
    }))
    .sort((aAgent: AgentWithProfile, bAgent: AgentWithProfile) => {
      // Sort verified agents first
      const aVerified = aAgent.profile?.verified_at ? 1 : 0
      const bVerified = bAgent.profile?.verified_at ? 1 : 0
      return bVerified - aVerified
    })

  const briefSentDate = listing.brief_sent_at
    ? new Date(listing.brief_sent_at).toLocaleDateString(dateLocaleFromLocale(locale))
    : null

  // Prepare translations for form component
  const formTranslations = {
    sendBrief: t('formSendBrief'),
    selectAgents: t('formSelectAgents'),
    selectAll: t('formSelectAll'),
    clearAll: t('formClearAll'),
    allAssigned: t('formAllAssigned'),
    serviceTier: t('formServiceTier'),
    additionalNotes: t('formAdditionalNotes'),
    notesPlaceholder: t('formNotesPlaceholder'),
    briefSentSuccess: t('formBriefSentSuccess'),
    selectAtLeastOne: t('formSelectAtLeastOne'),
    advisory: t('tierAdvisory'),
    assisted: t('tierAssisted'),
    managed: t('tierManaged'),
    advisoryDesc: t('tierAdvisoryDesc'),
    assistedDesc: t('tierAssistedDesc'),
    managedDesc: t('tierManagedDesc'),
  }

  // Intake translations
  const intakeTranslations = {
    greeting: t('intakeGreeting'),
    placeholder: t('intakePlaceholder'),
    send: t('intakeSend'),
    reviewTitle: t('intakeReviewTitle'),
    reviewEditBtn: t('intakeReviewEditBtn'),
    submitBtn: t('intakeSubmitBtn'),
    errorMsg: t('intakeErrorMsg'),
    q_property_address: t('q_property_address'),
    err_property_address: t('err_property_address'),
    hint_property_address: t('hint_property_address'),
    q_property_type: t('q_property_type'),
    opt_flat: t('opt_flat'),
    opt_terraced: t('opt_terraced'),
    opt_semi_detached: t('opt_semi_detached'),
    opt_detached: t('opt_detached'),
    opt_bungalow: t('opt_bungalow'),
    q_bedrooms: t('q_bedrooms'),
    err_bedrooms: t('err_bedrooms'),
    hint_bedrooms: t('hint_bedrooms'),
    q_bathrooms: t('q_bathrooms'),
    err_bathrooms: t('err_bathrooms'),
    hint_bathrooms: t('hint_bathrooms'),
    q_asking_price: t('q_asking_price'),
    err_asking_price: t('err_asking_price'),
    hint_asking_price: t('hint_asking_price'),
    q_seller_situation: t('q_seller_situation'),
    opt_no_chain: t('opt_no_chain'),
    opt_chain: t('opt_chain'),
    opt_investment: t('opt_investment'),
    opt_probate: t('opt_probate'),
    opt_divorce: t('opt_divorce'),
    opt_relocation: t('opt_relocation'),
    q_timeline: t('q_timeline'),
    opt_asap: t('opt_asap'),
    opt_1_month: t('opt_1_month'),
    opt_3_months: t('opt_3_months'),
    opt_6_months: t('opt_6_months'),
    opt_flexible: t('opt_flexible'),
    q_property_condition: t('q_property_condition'),
    opt_excellent: t('opt_excellent'),
    opt_good: t('opt_good'),
    opt_needs_updating: t('opt_needs_updating'),
    opt_needs_renovation: t('opt_needs_renovation'),
    q_preferred_agent_tier: t('q_preferred_agent_tier'),
    opt_advisory: t('opt_advisory'),
    opt_assisted: t('opt_assisted'),
    opt_managed: t('opt_managed'),
    q_notes: t('q_notes'),
    hint_notes: t('hint_notes'),
  }

  return (
    <OwnerBriefPageClient
      userId={userId}
      listingId={id}
      locale={locale}
      listing={listing}
      existingAssignments={existingAssignments}
      matchedAgents={matchedAgents}
      existingAgentIds={existingAgentIds}
      briefSentDate={briefSentDate}
      formTranslations={formTranslations}
      intakeTranslations={intakeTranslations}
      translations={{
        backToListing: t('backToListing'),
        pageTitle: t('pageTitle'),
        pageDescription: t('pageDescription'),
        sectionPropertySummary: t('sectionPropertySummary'),
        labelAddress: t('labelAddress'),
        labelType: t('labelType'),
        labelBedrooms: t('labelBedrooms'),
        labelBathrooms: t('labelBathrooms'),
        labelSize: t('labelSize'),
        labelPrice: t('labelPrice'),
        labelDescription: t('labelDescription'),
        labelSellerSituation: t('labelSellerSituation'),
        labelPreferredCompletion: t('labelPreferredCompletion'),
        sectionCurrentAssignments: t('sectionCurrentAssignments'),
        unknownAgent: t('unknownAgent'),
        assignmentStatusInvited: t('assignmentStatus.invited'),
        assignmentStatusAccepted: t('assignmentStatus.accepted'),
        assignmentStatusActive: t('assignmentStatus.active'),
        assignmentStatusPaused: t('assignmentStatus.paused'),
        assignmentStatusRevoked: t('assignmentStatus.revoked'),
        tierAdvisory: t('tier.advisory'),
        tierAssisted: t('tier.assisted'),
        tierManaged: t('tier.managed'),
        sectionAvailableAgents: t('sectionAvailableAgents'),
        noAgentsFound: t('noAgentsFound'),
        badgeVerified: t('badgeVerified'),
        badgeBriefSent: t('badgeBriefSent'),
        briefSentTo: t('briefSentTo'),
      }}
    />
  )
}
