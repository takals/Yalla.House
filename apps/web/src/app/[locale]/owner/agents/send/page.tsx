import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { fromMinorUnits } from '@yalla/integrations'
import { getCountryConfig } from '@/lib/country-config'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft, Mail, Eye, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { SendBriefButton } from './send-brief-button'

interface Props {
  searchParams: Promise<{ agents?: string; listing?: string }>
}

export default async function SendBriefPage({ searchParams }: Props) {
  const { agents: agentIds, listing: listingId } = await searchParams
  const t = await getTranslations('ownerAgents')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch owner's listing (use provided listingId or most recent)
  let listingQuery = (supabase as any)
    .from('listings')
    .select('id, address_line1, city, postcode, bedrooms, property_type, description_de, sale_price, country_code')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (listingId) {
    listingQuery = listingQuery.eq('id', listingId)
  }

  const { data: listingData } = await listingQuery.limit(1).single()
  const listing = listingData as any

  // Fetch selected agents from Supabase
  const selectedAgentIds = agentIds?.split(',').filter(Boolean) || []
  let selectedAgents: Array<{ id: string; name: string; contact: string }> = []

  if (selectedAgentIds.length > 0) {
    const { data: agentsData } = await (supabase as any)
      .from('users')
      .select(`
        id, full_name, email,
        agent_profiles!inner(agency_name)
      `)
      .in('id', selectedAgentIds)

    selectedAgents = (agentsData ?? []).map((agent: any) => ({
      id: agent.id,
      name: agent.agent_profiles?.[0]?.agency_name || agent.full_name || t('agentFallback'),
      contact: agent.email || '',
    }))
  }

  const formattedPrice = listing?.sale_price
    ? fromMinorUnits(listing.sale_price, getCountryConfig(listing.country_code ?? 'GB').currency)
    : null

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents/search" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('sendBackButton')}
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('sendPageTitle')}</h1>
        <p className="text-text-secondary">{t('sendPageDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Property Brief */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Brief Card */}
          <div className="bg-white rounded-2xl border border-border-default p-6">
            <h2 className="font-bold text-text-primary mb-4">{t('briefPropertyTitle')}</h2>
            {listing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">{t('briefAddress')}</p>
                  <p className="font-semibold text-text-primary">{listing.address_line1}</p>
                  <p className="text-sm text-text-secondary">{listing.city}{listing.postcode ? `, ${listing.postcode}` : ''}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-default">
                  <div>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">{t('briefBedrooms')}</p>
                    <p className="font-semibold text-text-primary">{listing.bedrooms ? t('bedroomsCount', { count: listing.bedrooms }) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">{t('briefProperty')}</p>
                    <p className="font-semibold text-text-primary">{listing.property_type ?? '—'}</p>
                  </div>
                </div>
                {listing.description_de && (
                  <div>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">{t('briefDescription')}</p>
                    <p className="text-sm text-text-secondary">{listing.description_de}</p>
                  </div>
                )}
                {formattedPrice && (
                  <div>
                    <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">{t('priceLabel')}</p>
                    <p className="font-bold text-lg text-text-primary">{formattedPrice}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">{t('noListingFound')}</p>
            )}
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-2xl border border-border-default p-6">
            <h2 className="font-bold text-text-primary mb-6">{t('sendWhatNextTitle')}</h2>
            <div className="space-y-4">
              {[
                { icon: <Mail size={18} />, title: t('sendStep1Title'), desc: t('sendStep1Desc') },
                { icon: <Eye size={18} />, title: t('sendStep2Title'), desc: t('sendStep2Desc') },
                { icon: <CheckCircle2 size={18} />, title: t('sendStep3Title'), desc: t('sendStep3Desc') },
                { icon: <Clock size={18} />, title: t('sendStep4Title'), desc: t('sendStep4Desc') },
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
        </div>

        {/* Right Column: Selected Agents & Actions */}
        <div className="space-y-6">
          {/* Selected Agents Card */}
          <div className="bg-white rounded-2xl border border-border-default p-6 sticky top-8">
            <h2 className="font-bold text-text-primary mb-4">{t('sendSelectedAgentsTitle')}</h2>

            {selectedAgents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-text-secondary mb-4">{t('sendNoAgentsSelected')}</p>
                <Link href="/owner/agents/search">
                  <button className="text-sm font-semibold text-brand">
                    {t('sendSelectAgentsLink')}
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {selectedAgents.map((agent) => (
                    <div key={agent.id} className="bg-bg rounded-lg p-3">
                      <p className="font-semibold text-sm text-text-primary">{agent.name}</p>
                      <p className="text-xs text-text-secondary">{agent.contact}</p>
                    </div>
                  ))}
                </div>

                <Link href="/owner/agents/search">
                  <button className="w-full text-sm font-semibold text-text-secondary py-2 mb-4 hover:text-text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowRight size={14} />
                    {t('sendAddMoreAgents')}
                  </button>
                </Link>

                <div className="space-y-3">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-default text-text-primary font-semibold rounded-lg hover:bg-bg transition-colors">
                    <Eye size={16} />
                    {t('sendPreviewEmail')}
                  </button>
                  {listing && (
                    <SendBriefButton
                      listingId={listing.id}
                      agentIds={selectedAgents.map(a => a.id)}
                      label={t('sendBriefNow')}
                      translations={{
                        sending: t('sending'),
                        errorSendFailed: t('errorSendFailed'),
                        errorGeneric: t('errorGeneric'),
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">{t('sendInfoLabel')}</p>
            <p className="text-sm text-green-700">{t('sendInfoText')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
