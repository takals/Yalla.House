'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function CheckoutButton({
  planId,
  listingId,
  disabled,
}: {
  planId: string
  listingId?: string | undefined
  disabled?: boolean | undefined
}) {
  const t = useTranslations('ownerDashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, listingId }),
      })

      const data = await res.json() as { url?: string; error?: string }

      if (data.error || !data.url) {
        setError(data.error ?? t('checkout.unknownError'))
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError(t('checkout.connectionError'))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full py-3 rounded-xl font-bold text-sm bg-brand hover:bg-brand-hover text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('checkout.redirecting')}
          </span>
        ) : (
          t('checkout.book')
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
