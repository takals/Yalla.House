import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { ArrowLeft, Wifi, WifiOff, Star } from 'lucide-react'
import { ProposalActions } from './proposal-actions'

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
    fee_type: string | null
    fee_amount: number | null
    fee_currency: string | null
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
        id, tier, status, crm_connected, notes, fee_type, fee_amount, fee_currency, invited_at,
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

  /** Format structured fee data into a display string */
  function formatFee(feeType: string | null, feeAmount: number | null, feeCurrency: string | null): string {
    if (!feeType || feeType === 'none') return t('noFee')
    if (!feeAmount) return '\u2014'
    if (feeType === 'percentage') {
      return `${(feeAmount / 100).toFixed(1)}%`
    }
    // flat fee — format as currency
    const currency = feeCurrency ?? 'GBP'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency, maximumFractionDigits: 0,
    }).format(feeAmount / 100)
  }

  /** Parse legacy text-based proposals (fallback for pre-structured data) */
  function parseProposal(proposal: typeof proposals[0]): { commission: string; serviceOverview: string } {
    // Use structured fee data if available
    if (proposal.fee_type && proposal.fee_type !== 'quoted') {
      return {
        commission: formatFee(proposal.fee_type, proposal.fee_amount, proposal.fee_currency),
        serviceOverview: proposal.notes ?? '',
      }
    }
    // Legacy fallback: parse from notes text
    if (!proposal.notes) return { commission: '\u2014', serviceOverview: '' }
    const commMatch = proposal.notes.match(/Commission:\s*(.+?)(?:\n|$)/)
    const serviceMatch = proposal.notes.match(/Service overview:\n([\s\S]*)/)
    return {
      commission: commMatch?.[1]?.trim() ?? '\u2014',
      serviceOverview: serviceMatch?.[1]?.trim() ?? proposal.notes,
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/owner/agents/tracking" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('backToTracking')}
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-1">{t('title')}</h1>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-default p-8 text-center">
          <p className="text-text-secondary">{t('noProposals')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => {
            const { commission, serviceOverview } = parseProposal(proposal)
            const isVerified = !!proposal.agent?.verified_at

            return (
              <div key={proposal.id} className="bg-surface rounded-2xl border border-border-default overflow-hidden">
                {/* Header row */}
                <div className="p-5 border-b border-border-default">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-text-primary">
                          {proposal.agent?.agency_name ?? t('unknownAgent')}
                        </h2>
                        {isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                            {t('verified')}
                          </span>
                        )}
                      </div>
                      {proposal.agent?.license_number && (
                        <p className="text-xs text-text-secondary">
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
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-bg text-text-secondary uppercase tracking-wider">
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
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{t('commission')}</p>
                      <p className="text-lg font-extrabold text-text-primary">{commission}</p>
                    </div>

                    {/* Update style indicator */}
                    <div className="sm:col-span-2 bg-hover-bg rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{t('updateStyle')}</p>
                      {proposal.crm_connected ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-sm font-semibold text-text-primary">{t('liveUpdatesDesc')}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary">{t('manualUpdatesDesc')}</p>
                      )}
                    </div>
                  </div>

                  {/* Service overview */}
                  {serviceOverview && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{t('serviceOverview')}</p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{serviceOverview}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {proposal.status === 'invited' && (
                    <ProposalActions
                      assignmentId={proposal.id}
                      acceptLabel={t('acceptProposal')}
                      declineLabel={t('decline')}
                      acceptedLabel={t('accepted')}
                    />
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
