'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface QuoteFormProps {
  requestId: string
  category: string
}

export function QuoteForm({ requestId, category }: QuoteFormProps) {
  const t = useTranslations('partner')
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!amount || parseFloat(amount) <= 0) {
      setError(t('quoteInvalidAmount'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/service-requests/${requestId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(parseFloat(amount) * 100),
          currency: 'EUR',
          message: message || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit quote')
      }

      setSuccess(true)
      setAmount('')
      setMessage('')
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
      >
        {t('quoteBtn')} →
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-brand-solid-bg rounded-lg border border-brand/30">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('quoteAmountLabel')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('quoteAmountPlaceholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-sm border border-[#D8DBE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white text-black"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('quoteMessageLabel')}
              </label>
              <textarea
                placeholder={t('quoteMessagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#D8DBE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand bg-white text-black resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-[#991B1B] bg-[#FEE2E2] px-3 py-2 rounded-lg border border-[#FCA5A5]">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="text-xs text-[#166534] bg-[#DCFCE7] px-3 py-2 rounded-lg border border-[#86EFAC]">
                {t('quoteSuccess')}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !amount}
                className="flex-1 px-3 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('quoteSubmitting') : t('quoteSubmit')}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-[#D8DBE5] text-text-secondary text-sm font-bold rounded-lg hover:bg-hover-bg transition disabled:opacity-50"
              >
                {t('quoteCancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
