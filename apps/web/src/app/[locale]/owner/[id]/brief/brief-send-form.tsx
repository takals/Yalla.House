'use client'

import { useState, useTransition } from 'react'
import { Check, CheckCircle } from 'lucide-react'

interface Agent {
  id: string
  full_name: string
  email: string
  agency_name: string
  verified: boolean
  tier: string
}

interface Translations {
  sendBrief: string
  selectAgents: string
  selectAll: string
  clearAll: string
  allAssigned: string
  serviceTier: string
  additionalNotes: string
  notesPlaceholder: string
  briefSentSuccess: string
  selectAtLeastOne: string
  advisory: string
  assisted: string
  managed: string
  advisoryDesc: string
  assistedDesc: string
  managedDesc: string
}

interface Props {
  listingId: string
  agents: Agent[]
  existingAssignmentAgentIds: string[]
  translations: Translations
}

const TIER_ORDER = ['advisory', 'assisted', 'managed'] as const

export function BriefSendForm({ listingId, agents, existingAssignmentAgentIds, translations }: Props) {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [selectedTier, setSelectedTier] = useState<'advisory' | 'assisted' | 'managed'>('assisted')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success?: boolean; error?: string }>({})

  const availableAgents = agents.filter(a => !existingAssignmentAgentIds.includes(a.id))
  const selectAll = selectedAgents.size === availableAgents.length && availableAgents.length > 0

  function toggleAgent(agentId: string) {
    const next = new Set(selectedAgents)
    if (next.has(agentId)) {
      next.delete(agentId)
    } else {
      next.add(agentId)
    }
    setSelectedAgents(next)
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedAgents(new Set())
    } else {
      setSelectedAgents(new Set(availableAgents.map(a => a.id)))
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (selectedAgents.size === 0) {
      setResult({ error: translations.selectAtLeastOne })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/owner-briefs/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId,
            agentIds: Array.from(selectedAgents),
            tier: selectedTier,
            notes: notes.trim() || null,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          setResult({ error: error.error || 'Failed to send brief' })
          return
        }

        setResult({ success: true })
        setTimeout(() => {
          setSelectedAgents(new Set())
          setNotes('')
          setResult({})
          // Reload page after 2 seconds to show updated state
          window.location.reload()
        }, 1500)
      } catch (err) {
        setResult({ error: err instanceof Error ? err.message : 'An error occurred' })
      }
    })
  }

  const tierLabels = {
    advisory: translations.advisory,
    assisted: translations.assisted,
    managed: translations.managed,
  }

  const tierDescs = {
    advisory: translations.advisoryDesc,
    assisted: translations.assistedDesc,
    managed: translations.managedDesc,
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border-default p-6">
      <h2 className="text-lg font-bold text-text-primary mb-6">{translations.sendBrief}</h2>

      {/* Success banner */}
      {result.success && (
        <div className="mb-6 p-4 bg-[#DCFCE7] border border-[#86EFAC] rounded-lg flex items-center gap-2">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-[#166534]">
            {translations.briefSentSuccess}
          </p>
        </div>
      )}

      {/* Error banner */}
      {result.error && (
        <div className="mb-6 p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-lg">
          <p className="text-sm font-semibold text-[#991B1B]">{result.error}</p>
        </div>
      )}

      {/* Agent selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-primary">{translations.selectAgents}</h3>
          {availableAgents.length > 1 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-medium text-brand hover:text-brand-hover"
            >
              {selectAll ? translations.clearAll : translations.selectAll}
            </button>
          )}
        </div>

        {availableAgents.length === 0 ? (
          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-border-default text-center">
            <p className="text-sm text-text-secondary">{translations.allAssigned}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableAgents.map(agent => (
              <label
                key={agent.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border-default hover:bg-[#F8F9FA] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedAgents.has(agent.id)}
                  onChange={() => toggleAgent(agent.id)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{agent.full_name}</p>
                  <p className="text-xs text-text-secondary">{agent.agency_name}</p>
                  {agent.verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <Check size={12} className="text-green-600" />
                      <span className="text-xs font-medium text-[#059669]">Verified</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Tier selection */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-text-primary mb-4">{translations.serviceTier}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIER_ORDER.map(tier => {
            return (
              <label
                key={tier}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTier === tier
                    ? 'border-brand bg-brand-solid-bg'
                    : 'border-border-default hover:border-[#C8CCD6]'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={selectedTier === tier}
                  onChange={e => setSelectedTier(e.target.value as 'advisory' | 'assisted' | 'managed')}
                  className="sr-only"
                />
                <p className="text-sm font-bold text-text-primary mb-1">{tierLabels[tier]}</p>
                <p className="text-xs text-text-secondary">{tierDescs[tier]}</p>
              </label>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-text-primary mb-2">{translations.additionalNotes}</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={translations.notesPlaceholder}
          className="w-full p-3 rounded-lg border border-border-default focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm"
          rows={4}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending || selectedAgents.size === 0}
        className={`w-full py-3 rounded-lg font-semibold text-text-primary transition-all ${
          isPending || selectedAgents.size === 0
            ? 'bg-[#D9DCE4] text-[#999999] cursor-not-allowed'
            : 'bg-brand hover:bg-brand-hover cursor-pointer'
        }`}
      >
        {isPending
          ? translations.sendBrief
          : `${translations.sendBrief} (${selectedAgents.size})`}
      </button>
    </form>
  )
}
