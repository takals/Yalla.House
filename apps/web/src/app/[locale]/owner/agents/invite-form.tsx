'use client'

import { useState, useTransition } from 'react'
import type { Database } from '@/types/database'

type Listing = Pick<Database['public']['Tables']['listings']['Row'], 'id' | 'address_line1' | 'city' | 'postcode'>

interface Props {
  listings: Listing[]
}

export function InviteAgentForm({ listings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ success?: boolean; error?: string }>({})

  const [listingId, setListingId] = useState<string>('')
  const [agentEmail, setAgentEmail] = useState<string>('')
  const [tier, setTier] = useState<'advisory' | 'assisted' | 'managed'>('assisted')
  const [notes, setNotes] = useState<string>('')

  const tierDescriptions = {
    advisory: 'Agent provides advice and recommendations only — you retain full control',
    assisted: 'Agent can manage viewings and handle buyer communications with your oversight',
    managed: 'Agent has full control over listing management, negotiations, and communication',
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!listingId || !agentEmail) {
      setState({ error: 'Please fill in all required fields' })
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
          setState({ error: error.message || 'Failed to invite agent' })
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
        setState({ error: err instanceof Error ? err.message : 'An error occurred' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium">
          ✓ Agent invitation sent successfully
        </div>
      )}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Listing Dropdown */}
      <div>
        <label htmlFor="listing_id" className="block text-sm font-semibold text-[#0F1117] mb-2">
          Select Listing *
        </label>
        <select
          id="listing_id"
          value={listingId}
          onChange={e => setListingId(e.target.value)}
          disabled={isPending}
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-[#0F1117] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50"
        >
          <option value="">Choose a listing...</option>
          {listings.map(listing => (
            <option key={listing.id} value={listing.id}>
              {listing.address_line1} · {listing.postcode} {listing.city}
            </option>
          ))}
        </select>
      </div>

      {/* Agent Email Input */}
      <div>
        <label htmlFor="agent_email" className="block text-sm font-semibold text-[#0F1117] mb-2">
          Agent Email Address *
        </label>
        <input
          id="agent_email"
          type="email"
          value={agentEmail}
          onChange={e => setAgentEmail(e.target.value)}
          disabled={isPending}
          placeholder="agent@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-[#0F1117] placeholder-[#999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50"
        />
      </div>

      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-semibold text-[#0F1117] mb-3">Collaboration Tier *</label>
        <div className="space-y-3">
          {(['advisory', 'assisted', 'managed'] as const).map(tierOption => (
            <div
              key={tierOption}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                tier === tierOption
                  ? 'border-brand bg-[rgba(255,212,0,.08)]'
                  : 'border-[#E2E4EB] bg-surface hover:border-[#D8DBE5]'
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
                <label className="font-semibold text-[#0F1117] capitalize cursor-pointer flex-1">
                  {tierOption === 'advisory' && 'Advisory'}
                  {tierOption === 'assisted' && 'Assisted'}
                  {tierOption === 'managed' && 'Managed'}
                </label>
              </div>
              <p className="text-sm text-[#5E6278] ml-7">
                {tierDescriptions[tierOption]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-[#0F1117] mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={isPending}
          placeholder="Any additional instructions or context for the agent..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-[#D8DBE5] bg-surface text-[#0F1117] placeholder-[#999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[rgba(212,118,78,.12)] disabled:opacity-50 resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !listingId || !agentEmail}
        className="w-full bg-brand hover:bg-brand-hover text-[#0F1117] font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed will-change-transform"
      >
        {isPending ? 'Sending invitation...' : 'Send Invitation'}
      </button>
    </form>
  )
}
