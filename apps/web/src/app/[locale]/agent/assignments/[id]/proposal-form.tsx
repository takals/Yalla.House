'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

interface ProposalFormProps {
  assignmentId: string
  listingIntent: string
}

export function ProposalForm({
  assignmentId,
  listingIntent,
}: ProposalFormProps) {
  const router = useRouter()
  const t = useTranslations('agentProposal')
  const [feeType, setFeeType] = useState<'flat' | 'percentage' | 'none'>('none')
  const [feeAmount, setFeeAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const messageLength = message.trim().length
  const isValid = messageLength >= 50 && (feeType === 'none' || feeAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        `/api/assignments/${assignmentId}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'accepted',
            fee_type: feeType,
            fee_amount:
              feeType === 'none' ? null : parseInt(feeAmount, 10),
            notes: message,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit proposal')
      }

      setSubmitted(true)

      // Redirect after success
      setTimeout(() => {
        router.push('/agent/assignments')
        router.refresh()
      }, 2000)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-6 border"
        style={{
          backgroundColor: '#DCFCE7',
          borderColor: '#BBF7D0',
        }}
      >
        <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
          <Check size={18} />
          {t('proposalSentSuccess')}
        </p>
        <p className="text-xs text-[#059669] mt-1">
          {t('redirectingToBriefs')}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-2xl border border-border-default p-6"
    >
      <h3 className="font-semibold text-text-primary mb-4">
        {t('submitProposal')}
      </h3>

      {/* Error state */}
      {error && (
        <div
          className="mb-4 rounded-lg p-3 border text-sm"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: '#FECACA',
            color: '#991B1B',
          }}
        >
          {error}
        </div>
      )}

      {/* Fee structure */}
      <div className="mb-6">
        <p className="text-sm font-medium text-text-primary mb-3">{t('feeStructure')}</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="none"
              checked={feeType === 'none'}
              onChange={(e) => {
                setFeeType(e.target.value as 'none')
                setFeeAmount('')
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-text-primary">{t('feeTBD')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="flat"
              checked={feeType === 'flat'}
              onChange={(e) => setFeeType(e.target.value as 'flat')}
              className="w-4 h-4"
            />
            <span className="text-sm text-text-primary">{t('feeFlat')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="percentage"
              checked={feeType === 'percentage'}
              onChange={(e) => setFeeType(e.target.value as 'percentage')}
              className="w-4 h-4"
            />
            <span className="text-sm text-text-primary">{t('feePercentage')}</span>
          </label>
        </div>
      </div>

      {/* Fee amount (conditional) */}
      {feeType !== 'none' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {feeType === 'flat' ? t('feeAmountFlat') : t('feeAmountPct')}
          </label>
          <input
            type="number"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            placeholder={
              feeType === 'flat' ? t('placeholderFlat') : t('placeholderPct')
            }
            className="w-full px-4 py-2.5 rounded-lg border border-border-default text-sm focus:outline-none focus:border-brand"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F1117',
            }}
          />
        </div>
      )}

      {/* Message to owner */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('messageToOwner')}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('messagePlaceholder')}
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-border-default text-sm focus:outline-none focus:border-brand font-sans"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#0F1117',
            resize: 'vertical',
          }}
        />
        <p
          className="text-xs mt-2"
          style={{
            color:
              messageLength < 50 && message.length > 0
                ? '#991B1B'
                : '#5E6278',
          }}
        >
          {t('charCount', { count: messageLength })}{' '}
          {messageLength < 50 && message.length > 0 && t('charMinimum')}
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full px-5 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
        style={{
          backgroundColor: isValid && !submitting ? '#D4764E' : '#E5E7EB',
          color: isValid && !submitting ? '#FFFFFF' : '#999999',
          cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? t('sendingProposal') : t('sendProposal')}
      </button>
    </form>
  )
}
