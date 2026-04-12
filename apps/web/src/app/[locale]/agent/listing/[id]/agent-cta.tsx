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
  const [commission, setCommission] = useState('')
  const [serviceOverview, setServiceOverview] = useState('')
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
            <p className="text-xs text-[#5E6278] mt-0.5">
              {isDE ? 'Status' : 'Status'}: {existingAssignment.status}
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
      commission,
      serviceOverview,
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
            ? 'Der Eigentümer vergleicht Angebote nebeneinander. Geben Sie Ihre Provision an und stellen Sie Ihren Service vor.'
            : 'The owner compares proposals side by side. Quote your commission and pitch your service.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Commission quote */}
          <div>
            <label className="block text-xs font-semibold text-[#5E6278] mb-1">
              {isDE ? 'Ihre Provision' : 'Your commission'} *
            </label>
            <input
              type="text"
              required
              value={commission}
              onChange={e => setCommission(e.target.value)}
              placeholder={isDE ? 'z.B. 1,2 % + MwSt. oder Pauschal £2.500' : 'e.g. 1.2% + VAT or fixed fee £2,500'}
              className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          {/* Service overview */}
          <div>
            <label className="block text-xs font-semibold text-[#5E6278] mb-1">
              {isDE ? 'Ihr Serviceangebot' : 'Your service overview'} *
            </label>
            <textarea
              rows={5}
              value={serviceOverview}
              onChange={e => setServiceOverview(e.target.value)}
              required
              placeholder={isDE
                ? 'Stellen Sie sich vor — Erfahrung vor Ort, Portal-Abdeckung, Marketingplan, Zeitrahmen…'
                : 'Introduce yourself — local experience, portal coverage, marketing plan, timeline…'}
              className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !commission.trim() || !serviceOverview.trim()}
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

      {/* Listing data download + optional CRM */}
      <div className="bg-surface rounded-2xl p-5 border border-[#E2E4EB]">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-[#5E6278]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-bold text-[#0F1117]">
            {isDE ? 'Inserat-Daten herunterladen' : 'Download listing data'}
          </h3>
        </div>
        <p className="text-xs text-[#5E6278] mb-3">
          {isDE
            ? 'CSV-Datei zum Import in Ihr CRM-System (Reapit, Alto, Jupix usw.)'
            : 'CSV file ready to import into your CRM (Reapit, Alto, Jupix, etc.)'}
        </p>
        <a
          href={`/api/agent/listings/${listingId}?format=csv`}
          className="block text-center bg-bg hover:bg-[#D9DCE4] text-[#0F1117] font-bold py-2 rounded-xl transition-colors text-sm border border-[#E2E4EB] mb-2"
        >
          {isDE ? 'CSV herunterladen' : 'Download CSV'}
        </a>

        {/* Optional CRM connection — softer framing */}
        <div className="mt-3 pt-3 border-t border-[#E2E4EB]">
          <p className="text-xs text-[#5E6278] mb-2">
            {isDE
              ? 'Möchten Sie, dass Eigentümer Live-Updates in ihrem Dashboard sehen? Verbinden Sie Ihr CRM und halten Sie sie automatisch auf dem Laufenden.'
              : 'Want the owner to see live updates in their dashboard? Connect your CRM and keep them informed automatically.'}
          </p>
          <a
            href="/agent/agreement"
            className="text-xs font-semibold text-brand hover:underline"
          >
            {isDE ? 'CRM verbinden (Partnervereinbarung erforderlich) →' : 'Connect CRM (Partner Agreement required) →'}
          </a>
        </div>
      </div>
    </div>
  )
}
