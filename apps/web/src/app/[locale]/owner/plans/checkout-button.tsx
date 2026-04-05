'use client'

import { useState } from 'react'

export function CheckoutButton({
  planId,
  listingId,
  disabled,
}: {
  planId: string
  listingId?: string | undefined
  disabled?: boolean | undefined
}) {
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
        setError(data.error ?? 'Unbekannter Fehler')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Verbindungsfehler. Bitte erneut versuchen.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full py-3 rounded-xl font-bold text-sm bg-brand hover:bg-brand-hover text-[#0F1117] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Weiterleitung …
          </span>
        ) : (
          'Jetzt buchen'
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
