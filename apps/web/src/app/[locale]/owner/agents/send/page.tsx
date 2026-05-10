import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { fromMinorUnits } from '@yalla/integrations'
import { getCountryConfig } from '@/lib/country-config'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft, Mail, Eye, CheckCircle2, Clock, Shield } from 'lucide-react'
import { SendBriefClient } from './send-brief-client'

interface Props {
  searchParams: Promise<{ agents?: string; listing?: string }>
}

export default async function SendBriefPage({ searchParams }: Props) {
  const { agents: agentIds, listing: listingId } = await searchParams
  const t = await getTranslations('ownerAgentInvite')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID
  const isAuthenticated = !!user

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
  ] as const

  const translations: Record<string, string> = {}
  for (const key of tKeys) {
    translations[key] = t(key)
  }

  // Format listings for client
  const formattedListings = listings.map(l => ({
    id: l.id,
    label: [l.address_line1, l.city, l.postcode].filter(Boolean).join(', '),
    price: l.sale_price
      ? String(fromMinorUnits(l.sale_price, getCountryConfig(l.country_code ?? 'GB').currency))
      : null,
    bedrooms: l.bedrooms,
    propertyType: l.property_type,
  }))

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: What Happens Next */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-border-default p-6">
            <h2 className="font-bold text-text-primary mb-6">{translations.whatNextTitle}</h2>
            <div className="space-y-4">
              {[
                { icon: <Mail size={18} />, title: translations.step1Title, desc: translations.step1Desc },
                { icon: <Eye size={18} />, title: translations.step2Title, desc: translations.step2Desc },
                { icon: <CheckCircle2 size={18} />, title: translations.step3Title, desc: translations.step3Desc },
                { icon: <Clock size={18} />, title: translations.step4Title, desc: translations.step4Desc },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0 text-brand">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary mb-1">{step.title}</p>
                    <p className="text-sm text-text-secondary">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">{translations.infoLabel}</p>
            <p className="text-sm text-green-700">{translations.infoText}</p>
          </div>
        </div>

        {/* Right Column: Agent list + controls */}
        <div>
          <SendBriefClient
            agents={selectedAgents}
            listings={formattedListings}
            selectedListingId={selectedListing?.id ?? null}
            isAuthenticated={isAuthenticated}
            translations={translations}
          />
        </div>
      </div>
    </div>
  )
}
