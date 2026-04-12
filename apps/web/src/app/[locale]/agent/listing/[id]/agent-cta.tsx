'use client'

import { useState } from 'react'
import { submitProposalAction } from './actions'

interface AssignmentInfo {
  id: string
  status: string
  tier: string
}

export function AgentListingCta({
  listingId,
  locale,
  existingAssignment,
}: {
  listingId: string
  locale: string
  existingAssignment: AssignmentInfo | null
}) {
  const [message, setMessage] = useState('')
  const [proposedTier, setProposedTier] = useState<string>('advisory')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDE = locale === 'de'

  // Already has an active/accepted assignment
  if (existingAssignment && ['accepted', 'active'].includes(existingAssignment.status)) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-[#0F1117]">
              {isDE ? 'Sie arbeiten an dieser Immobilie' : "You're working on this property"}
            </p>
            <p className="text-xs text-[#5E6278] mt-0.5 capitalize">
              {isDE ? 'Stufe' : 'Tier'}: {existingAssignment.tier} · {isDE ? 'Status' : 'Status'}: {existingAssignment.status}
            </p>
          </div>
        </div>
        <a
          href={`/agent/assignments/${existingAssignment.id}`}
          className="block text-center bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          {isDE ? 'Auftrag anzeigen' : 'View Assignment'}
        </a>
      </div>
    )
  }

  // Already submitted a proposal (invited status)
  if (existingAssignment && existingAssignment.status === 'invited') {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1E40AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-[#0F1117]">
              {isDE ? 'Vorschlag eingereicht' : 'Proposal submitted'}
            </p>
            <p className="text-xs text-[#5E6278] mt-0.5">
              {isDE ? 'Warten auf Antwort des Eigentümers' : 'Awaiting owner response'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-[#0F1117]">
              {isDE ? 'Vorschlag gesendet!' : 'Proposal sent!'}
            </p>
            <p className="text-xs text-[#5E6278] mt-0.5">
              {isDE
                ? 'Der Eigentümer prüft Ihren Vorschlag im Dashboard.'
                : 'The owner will review your proposal in their dashboard.'}
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

    const result = await submitProposalAction(listingId, {
      tier: proposedTier,
      message,
    })

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Respond via Yalla card */}
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <h2 className="text-lg font-bold text-[#0F1117] mb-1">
          {isDE ? 'Über Yalla antworten' : 'Respond via Yalla'}
        </h2>
        <p className="text-xs text-[#5E6278] mb-4">
          {isDE
            ? 'Senden Sie dem Eigentümer einen Vorschlag. Ihre Kontaktdaten bleiben privat.'
            : 'Send the owner a proposal. Your contact details stay private until accepted.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Proposed tier */}
          <div>
            <label className="block text-xs font-semibold text-[#5E6278] mb-1.5">
              {isDE ? 'Vorgeschlagene Zusammenarbeit' : 'Proposed collaboration'}
            </label>
            <div className="space-y-1.5">
              {[
                { value: 'advisory', labelEN: 'Advisory — market guidance only', labelDE: 'Beratung — nur Marktberatung' },
                { value: 'assisted', labelEN: 'Assisted — viewings + messaging', labelDE: 'Unterstützt — Besichtigungen + Nachrichten' },
                { value: 'managed', labelEN: 'Managed — full service', labelDE: 'Vollservice — Rundum-Betreuung' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-sm ${
                    proposedTier === opt.value
                      ? 'border-brand bg-brand-solid-bg'
                      : 'border-[#E2E4EB] hover:border-[#C8CCD6]'
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={opt.value}
                    checked={proposedTier === opt.value}
                    onChange={() => setProposedTier(opt.value)}
                    className="accent-brand"
                  />
                  <span>{isDE ? opt.labelDE : opt.labelEN}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-[#5E6278] mb-1">
              {isDE ? 'Nachricht an Eigentümer' : 'Message to owner'}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              placeholder={isDE
                ? 'Stellen Sie sich vor und erläutern Sie Ihren Ansatz für diese Immobilie…'
                : 'Introduce yourself and explain your approach for this property…'}
              className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isDE ? 'Vorschlag senden' : 'Send Proposal'}
          </button>
        </form>
      </div>

      {/* CRM integration card */}
      <div className="bg-surface rounded-2xl p-5 border border-[#E2E4EB]">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-[#5E6278]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <h3 className="text-sm font-bold text-[#0F1117]">
            {isDE ? 'In Ihr CRM importieren' : 'Import to your CRM'}
          </h3>
        </div>
        <p className="text-xs text-[#5E6278] mb-3">
          {isDE
            ? 'Verbinden Sie Ihr CRM-System, um Immobiliendaten automatisch zu importieren.'
            : 'Connect your CRM system to automatically import property data.'}
        </p>
        <a
          href="/agent/settings/integrations"
          className="block text-center bg-bg hover:bg-[#D9DCE4] text-[#0F1117] font-bold py-2 rounded-xl transition-colors text-sm border border-[#E2E4EB]"
        >
          {isDE ? 'CRM verbinden' : 'Connect CRM'}
        </a>
      </div>
    </div>
  )
}
