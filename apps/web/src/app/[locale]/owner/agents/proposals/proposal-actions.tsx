'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { acceptProposalAction, declineProposalAction } from './actions'

interface ProposalActionsProps {
  assignmentId: string
  acceptLabel: string
  declineLabel: string
  acceptedLabel: string
}

export function ProposalActions({ assignmentId, acceptLabel, declineLabel, acceptedLabel }: ProposalActionsProps) {
  const [status, setStatus] = useState<'idle' | 'accepting' | 'declining' | 'accepted' | 'declined'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setStatus('accepting')
    setError(null)
    const result = await acceptProposalAction(assignmentId)
    if (result.error) {
      setError(result.error)
      setStatus('idle')
    } else {
      setStatus('accepted')
    }
  }

  async function handleDecline() {
    setStatus('declining')
    setError(null)
    const result = await declineProposalAction(assignmentId)
    if (result.error) {
      setError(result.error)
      setStatus('idle')
    } else {
      setStatus('declined')
    }
  }

  if (status === 'accepted') {
    return (
      <div className="flex items-center gap-2 pt-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm font-semibold text-green-700">{acceptedLabel}</p>
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div className="flex items-center gap-2 pt-2">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <p className="text-sm font-semibold text-text-secondary">Declined</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAccept}
          disabled={status !== 'idle'}
          className="flex-1 bg-brand hover:bg-brand-hover text-text-primary font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
        >
          {status === 'accepting' ? <Loader2 size={16} className="animate-spin mx-auto" /> : acceptLabel}
        </button>
        <button
          onClick={handleDecline}
          disabled={status !== 'idle'}
          className="px-6 bg-bg hover:bg-hover-muted text-text-primary font-semibold py-2.5 rounded-xl transition-colors text-sm border border-border-default disabled:opacity-50"
        >
          {status === 'declining' ? <Loader2 size={16} className="animate-spin mx-auto" /> : declineLabel}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
