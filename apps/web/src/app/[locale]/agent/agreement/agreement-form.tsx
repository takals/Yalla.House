'use client'

import { useState } from 'react'
import { useAuthAction } from '@/lib/use-auth-action'
import { signAgreementAction } from './actions'

export function AgreementForm({ agencyName }: { agencyName: string }) {
  const [agreed, setAgreed] = useState(false)
  const [signatoryName, setSignatoryName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleAuthRequired } = useAuthAction()

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) return
    setSubmitting(true)
    setError(null)

    const result = await signAgreementAction({ signatoryName })
    if (handleAuthRequired(result)) {
      setSubmitting(false)
      return
    }
    setSubmitting(false)

    if ('error' in result) {
      setError(result.error ?? null)
    }
    // On success, the server action redirects to /agent
  }

  return (
    <form onSubmit={handleSign} className="bg-surface rounded-2xl p-6 border border-[#E2E4EB] space-y-4">
      {/* Agency name (read-only) */}
      {agencyName && (
        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">Agency</label>
          <p className="text-sm font-medium">{agencyName}</p>
        </div>
      )}

      {/* Signatory name */}
      <div>
        <label className="block text-xs font-semibold text-[#5E6278] mb-1">
          Full name (signatory) *
        </label>
        <input
          type="text"
          required
          value={signatoryName}
          onChange={e => setSignatoryName(e.target.value)}
          placeholder="Your full legal name"
          className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 accent-brand w-4 h-4"
        />
        <span className="text-sm text-[#5E6278]">
          I confirm that I have read and accept the Yalla Partner Agreement (v1.0).
          I am authorised to sign on behalf of my agency.
        </span>
      </label>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !agreed || !signatoryName.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {submitting && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        Sign Partner Agreement
      </button>
    </form>
  )
}
