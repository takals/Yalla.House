import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { ArrowLeft, Wifi, WifiOff, Star } from 'lucide-react'

export default async function OwnerProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>
}) {
  const t = await getTranslations('ownerProposals')
  const { listing: listingId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch proposals for this owner's listing
  let proposals: Array<{
    id: string
    tier: string
    status: string
    crm_connected: boolean
    notes: string | null
    invited_at: string
    agent: {
      id: string
      agency_name: string | null
      license_number: string | null
      verified_at: string | null
      coverage_areas: unknown
    } | null
  }> = []

  if (listingId) {
    const { data } = await (supabase as any)
      .from('listing_agent_assignments')
      .select(`
        id, tier, status, crm_connected, notes, invited_at,
        agent:agent_profiles!listing_agent_assignments_agent_id_fkey(
          user_id, agency_name, license_number, verified_at, coverage_areas
        )
      `)
      .eq('owner_id', userId)
      .eq('listing_id', listingId)
      .in('status', ['invited', 'accepted', 'active'])
      .order('invited_at', { ascending: false })

    proposals = data ?? []
  }

  // Parse commission and service overview from notes
  function parseProposal(notes: string | null): { commission: string; serviceOverview: string } {
    if (!notes) return { commission: '—', serviceOverview: '' }
    const commMatch = notes.match(/Commission:\s*(.+?)(?:\n|$)/)
    const serviceMatch = notes.match(/Service overview:\n([\s\S]*)/)
    return {
      commission: commMatch?.[1]?.trim() ?? '—',
      serviceOverview: serviceMatch?.[1]?.trim() ?? notes,
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/owner/agents/tracking" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('backToTracking')}
        </Link>
        <h1 className="text-2xl font-bold text-[#0F1117] mb-1">{t('title')}</h1>
        <p className="text-sm text-[#5E6278]">{t('subtitle')}</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-8 text-center">
          <p className="text-[#5E6278]">{t('noProposals')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => {
            const { commission, serviceOverview } = parseProposal(proposal.notes)
            const isVerified = !!proposal.agent?.verified_at

            return (
              <div key={proposal.id} className="bg-surface rounded-2xl border border-[#E2E4EB] overflow-hidden">
                {/* Header row */}
                <div className="p-5 border-b border-[#E2E4EB]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-[#0F1117]">
                          {proposal.agent?.agency_name ?? t('unknownAgent')}
                        </h2>
                        {isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                            {t('verified')}
                          </span>
                        )}
                      </div>
                      {proposal.agent?.license_number && (
                        <p className="text-xs text-[#5E6278]">
                          {t('licenseNo')} {proposal.agent.license_number}
                        </p>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {proposal.crm_connected ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                          <Wifi size={12} />
                          {t('liveUpdates')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EDEEF2] text-[#5E6278] uppercase tracking-wider">
                          <WifiOff size={12} />
                          {t('manualUpdates')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Commission + Service */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* Commission — big and bold */}
                    <div className="sm:col-span-1 bg-brand-solid-bg rounded-xl p-4 border border-brand/20">
                      <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-1">{t('commission')}</p>
                      <p className="text-lg font-extrabold text-[#0F1117]">{commission}</p>
                    </div>

                    {/* Update style indicator */}
                    <div className="sm:col-span-2 bg-[#F5F5FA] rounded-xl p-4">
                      <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-1">{t('updateStyle')}</p>
                      {proposal.crm_connected ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-sm font-semibold text-[#0F1117]">{t('liveUpdatesDesc')}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-[#5E6278]">{t('manualUpdatesDesc')}</p>
                      )}
                    </div>
                  </div>

                  {/* Service overview */}
                  {serviceOverview && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-2">{t('serviceOverview')}</p>
                      <p className="text-sm text-[#5E6278] leading-relaxed whitespace-pre-line">{serviceOverview}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {proposal.status === 'invited' && (
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-2.5 rounded-xl transition-colors text-sm">
                        {t('acceptProposal')}
                      </button>
                      <button className="px-6 bg-bg hover:bg-[#D9DCE4] text-[#0F1117] font-semibold py-2.5 rounded-xl transition-colors text-sm border border-[#E2E4EB]">
                        {t('decline')}
                      </button>
                    </div>
                  )}

                  {proposal.status === 'accepted' && (
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-sm font-semibold text-green-700">{t('accepted')}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
