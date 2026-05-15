import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
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

  // Fetch proposals for this owner's listing from agent_invites
  let proposals: Array<{
    id: string
    tier: string
    status: string
    notes: string | null
    created_at: string
    sent_at: string | null
    agent_profiles: {
      user_id: string
      agency_name: string | null
      license_number: string | null
      verified_at: string | null
    } | null
  }> = []

  if (listingId) {
    const { data } = await (supabase as any)
      .from('agent_invites')
      .select(`
        id, tier, status, notes, created_at, sent_at,
        agent_profiles(user_id, agency_name, license_number, verified_at)
      `)
      .eq('owner_id', userId)
      .eq('listing_id', listingId)
      .in('status', ['sent', 'opened', 'responded', 'accepted'])
      .order('created_at', { ascending: false })

    proposals = data ?? []
  }

  const tierLabels: Record<string, string> = {
    advisory: t('tierAdvisory'),
    assisted: t('tierAssisted'),
    managed: t('tierManaged'),
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
            const isVerified = !!proposal.agent_profiles?.verified_at

            return (
              <div key={proposal.id} className="bg-surface rounded-2xl border border-border-default overflow-hidden">
                {/* Header row */}
                <div className="p-5 border-b border-border-default">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-text-primary">
                          {proposal.agent_profiles?.agency_name ?? t('unknownAgent')}
                        </h2>
                        {isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                            {t('verified')}
                          </span>
                        )}
                      </div>
                      {proposal.agent_profiles?.license_number && (
                        <p className="text-xs text-text-secondary">
                          {t('licenseNo')} {proposal.agent_profiles.license_number}
                        </p>
                      )}
                    </div>

                    {/* Tier badge */}
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand uppercase tracking-wider">
                      {tierLabels[proposal.tier] ?? proposal.tier}
                    </span>
                  </div>
                </div>

                {/* Tier + Notes */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* Tier — big and bold */}
                    <div className="sm:col-span-1 bg-brand-solid-bg rounded-xl p-4 border border-brand/20">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{t('commission')}</p>
                      <p className="text-lg font-extrabold text-text-primary">{tierLabels[proposal.tier] ?? proposal.tier}</p>
                    </div>

                    {/* Status */}
                    <div className="sm:col-span-2 bg-hover-bg rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{t('updateStyle')}</p>
                      <p className="text-sm text-text-secondary">{proposal.status}</p>
                    </div>
                  </div>

                  {/* Notes / service overview */}
                  {proposal.notes && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{t('serviceOverview')}</p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{proposal.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {proposal.status === 'sent' && (
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
