'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { submitProposalAction } from './actions'

interface AssignmentInfo {
  id: string
  status: string
  tier: string
}

export function AgentListingCta({
  listingId,
  existingAssignment,
}: {
  listingId: string
  existingAssignment: AssignmentInfo | null
}) {
  const t = useTranslations('agentDashboard')
  const [feeType, setFeeType] = useState<'flat' | 'percentage' | 'none'>('percentage')
  const [feeAmount, setFeeAmount] = useState('')
  const [feeCurrency, setFeeCurrency] = useState('GBP')
  const [serviceOverview, setServiceOverview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already has an active/accepted assignment
  if (existingAssignment && ['accepted', 'active'].includes(existingAssignment.status)) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border-default">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-text-primary">
              {t('workingOnProperty')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('statusLabel')}: {t(`status${existingAssignment.status.charAt(0).toUpperCase()}${existingAssignment.status.slice(1)}`)}
            </p>
          </div>
        </div>
        <a
          href={`/agent/assignments/${existingAssignment.id}`}
          className="block text-center bg-brand hover:bg-brand-hover text-text-primary font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          {t('viewAssignment')}
        </a>
      </div>
    )
  }

  // Already submitted a proposal (invited status)
  if (existingAssignment && existingAssignment.status === 'invited') {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border-default">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1E40AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-text-primary">
              {t('proposalSubmitted')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('awaitingOwnerResponse')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-border-default">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-text-primary">
              {t('proposalSent')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('ownerReviewingProposal')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const parsedAmount = feeType === 'none' ? null
      : feeType === 'percentage' ? Math.round(parseFloat(feeAmount) * 100) // store as basis points
      : Math.round(parseFloat(feeAmount) * 100) // store as minor units (pence/cents)

    const result = await submitProposalAction(listingId, {
      feeType,
      feeAmount: parsedAmount,
      feeCurrency,
      serviceOverview,
    })

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error ?? 'An error occurred')
    } else {
      setDone(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Respond via Yalla card */}
      <div className="bg-surface rounded-2xl p-6 border border-border-default">
        <h2 className="text-lg font-bold text-text-primary mb-1">
          {t('respondViaYalla')}
        </h2>
        <p className="text-xs text-text-secondary mb-4">
          {t('respondViaYallaDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Fee type */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {t('feeTypeLabel')} *
            </label>
            <div className="flex gap-2">
              {(['percentage', 'flat', 'none'] as const).map(ft => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFeeType(ft)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors ${
                    feeType === ft
                      ? 'bg-[#0F1117] text-white border-[#0F1117]'
                      : 'bg-bg text-text-secondary border-border-default hover:border-[#D9DCE4]'
                  }`}
                >
                  {ft === 'percentage' ? t('feeTypePercentage')
                    : ft === 'flat' ? t('feeTypeFlat')
                    : t('feeTypeNoFee')}
                </button>
              ))}
            </div>
          </div>

          {/* Fee amount (hidden for 'none') */}
          {feeType !== 'none' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  {feeType === 'percentage'
                    ? t('rateLabel')
                    : t('amountLabel')} *
                </label>
                <input
                  type="number"
                  required
                  step={feeType === 'percentage' ? '0.1' : '1'}
                  min="0"
                  value={feeAmount}
                  onChange={e => setFeeAmount(e.target.value)}
                  placeholder={feeType === 'percentage' ? '1.5' : '2500'}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
              {feeType === 'flat' && (
                <div className="w-24">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    {t('currencyLabel')}
                  </label>
                  <select
                    value={feeCurrency}
                    onChange={e => setFeeCurrency(e.target.value)}
                    className="w-full px-2 py-2 text-sm border border-border-default rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  >
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Service overview */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              {t('yourServiceOverview')} *
            </label>
            <textarea
              rows={5}
              value={serviceOverview}
              onChange={e => setServiceOverview(e.target.value)}
              required
              placeholder={t('serviceOverviewPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || (feeType !== 'none' && !feeAmount) || !serviceOverview.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {t('sendProposal')}
          </button>
        </form>
      </div>

      {/* Listing data download */}
      <div className="bg-surface rounded-2xl p-5 border border-border-default">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-bold text-text-primary">
            {t('downloadListingData')}
          </h3>
        </div>
        <p className="text-xs text-text-secondary mb-3">
          {t('downloadListingDataDesc')}
        </p>
        <a
          href={`/api/agent/listings/${listingId}?format=csv`}
          className="block text-center bg-bg hover:bg-hover-muted text-text-primary font-bold py-2 rounded-xl transition-colors text-sm border border-border-default"
        >
          {t('downloadCSV')}
        </a>
      </div>

      {/* CRM connection — trust-first framing */}
      <div className="bg-surface rounded-2xl p-5 border border-border-default">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h3 className="text-sm font-bold text-text-primary">
            {t('connectCRM')}
          </h3>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
            {t('recommended')}
          </span>
        </div>

        {/* Benefit for the agent */}
        <div className="bg-hover-bg rounded-xl p-3 mb-3">
          <p className="text-xs font-semibold text-text-primary mb-1">
            {t('noExtraWork')}
          </p>
          <p className="text-xs text-text-secondary">
            {t('autoSync')}
          </p>
        </div>

        {/* Benefit for getting chosen */}
        <div className="bg-brand-solid-bg rounded-xl p-3 mb-3 border border-brand/20">
          <p className="text-xs font-semibold text-text-primary mb-1">
            {t('standOut')}
          </p>
          <p className="text-xs text-text-secondary">
            {t('liveUpdatesBadge')}
          </p>
        </div>

        {/* Privacy assurance */}
        <div className="flex items-start gap-2 mb-3">
          <svg className="w-3.5 h-3.5 text-text-secondary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-text-secondary">
            {t('privacyAssurance')}
          </p>
        </div>

        <a
          href="/agent/agreement"
          className="block text-center bg-brand hover:bg-brand-hover text-text-primary font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          {t('connectCRMButton')}
        </a>
      </div>
    </div>
  )
}
