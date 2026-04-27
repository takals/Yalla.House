'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import type { Database } from '@/types/database'

type Listing = Pick<Database['public']['Tables']['listings']['Row'], 'id' | 'address_line1' | 'city' | 'postcode'>

interface Translations {
  selectListing: string
  selectListingPlaceholder: string
  agentEmail: string
  agentEmailPlaceholder: string
  collaborationTier: string
  advisory: string
  assisted: string
  managed: string
  advisoryDesc: string
  assistedDesc: string
  managedDesc: string
  notes: string
  notesPlaceholder: string
  sendInvitation: string
  sending: string
  successMessage: string
  errorTitle: string
  errorInviteFailed: string
  errorGeneric: string
}

interface Props {
  listings: Listing[]
  translations: Translations
}

export function InviteAgentForm({ listings, translations }: Props) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ success?: boolean; error?: string }>({})

  const [listingId, setListingId] = useState<string>('')
  const [agentEmail, setAgentEmail] = useState<string>('')
  const [tier, setTier] = useState<'advisory' | 'assisted' | 'managed'>('assisted')
  const [notes, setNotes] = useState<string>('')

  const tierDescriptions = {
    advisory: translations.advisoryDesc,
    assisted: translations.assistedDesc,
    managed: translations.managedDesc,
  }

  const tierLabels = {
    advisory: translations.advisory,
    assisted: translations.assisted,
    managed: translations.managed,
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!listingId || !agentEmail) {
      setState({ error: translations.errorTitle })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: listingId,
            agent_email: agentEmail,
            tier,
            notes: notes || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          setState({ error: error.message || translations.errorInviteFailed })
          return
        }

        setState({ success: true })
        setListingId('')
        setAgentEmail('')
        setTier('assisted')
        setNotes('')

        // Reset success message after 3 seconds
        setTimeout(() => setState({}), 3000)
      } catch (err) {
        setState({ error: err instanceof Error ? err.message : translations.errorGeneric })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium flex items-center gap-2">
          <Check size={16} />
          {translations.successMessage}
        </div>
      )}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Listing Dropdown */}
      <div>
        <label htmlFor="listing_id" className="block text-sm font-semibold text-text-primary mb-2">
          {translations.selectListing} *
        </label>
        <select
          id="listing_id"
          value={listingId}
          onChange={e => setListingId(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-text-primary focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50"
        >
          <option value="">{translations.selectListingPlaceholder}</option>
          {listings.map(listing => (
            <option key={listing.id} value={listing.id}>
              {listing.address_line1} · {listing.postcode} {listing.city}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Email Input */}
      <div>
        <label htmlFor="agent_email" className="block text-sm font-semibold text-text-primary mb-2">
          {translations.agentEmail} *
        </label>
        <input
          id="agent_email"
          type="email"
          value={agentEmail}
          onChange={e => setAgentEmail(e.target.value)}
          disabled={isPending}
          placeholder={translations.agentEmailPlaceholder}
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-text-primary placeholder-[#999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50"
        />
      </div>

      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">{translations.collaborationTier} *</label>
        <div className="space-y-3">
          {(['advisory', 'assisted', 'managed'] as const).map(tierOption => (
            <div
              key={tierOption}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                tier === tierOption
                  ? 'border-brand bg-[rgba(255,212,0,.08)]'
                  : 'border-border-default bg-surface hover:border-[#D8DBE5]'
              }`}
              onClick={() => setTier(tierOption)}
            >
              <div className="flex items-center mb-1">
                <input
                  type="radio"
                  name="tier"
                  value={tierOption}
                  checked={tier === tierOption}
                  onChange={e => setTier(e.target.value as typeof tier)}
                  disabled={isPending}
                  className="mr-3 w-4 h-4 accent-brand"
                />
                <label className="font-semibold text-text-primary capitalize cursor-pointer flex-1">
                  {tierLabels[tierOption]}
                </label>
              </div>
              <p className="text-sm text-text-secondary ml-7">
                {tierDescriptions[tierOption]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-text-primary mb-2">
          {translations.notes}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={isPending}
          placeholder={translations.notesPlaceholder}
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-text-primary placeholder-[#999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !listingId || !agentEmail}
        className="w-full bg-brand hover:bg-brand-hover text-text-primary font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed will-change-transform"
      >
        {isPending ? translations.sending : translations.sendInvitation}
      </button>
    </form>
  )
}
