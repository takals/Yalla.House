'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface AssignmentActionsProps {
  assignmentId: string
  status: string
}

export default function AssignmentActions({
  assignmentId,
  status,
}: AssignmentActionsProps) {
  const router = useRouter()
  const t = useTranslations('agentAssignments')
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null)

  const handleAction = async (action: 'accept' | 'decline') => {
    setLoading(true)
    setActionType(action)

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'accept' ? 'accepted' : 'revoked',
          revoked_reason: action === 'decline' ? 'Agent declined' : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to process assignment'}`)
        setLoading(false)
        setActionType(null)
        return
      }

      // Redirect to refresh page on success
      router.push('/agent/assignments')
      router.refresh()
    } catch (error) {
      console.error('Assignment action error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
      setActionType(null)
    }
  }

  // Only show actions if status is 'invited'
  if (status !== 'invited') {
    return null
  }

  return (
    <>
      <button
        onClick={() => handleAction('accept')}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover disabled:opacity-50 transition"
      >
        {loading && actionType === 'accept' ? t('accepting') : t('accept')}
      </button>
      <button
        onClick={() => handleAction('decline')}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-[#F3F4F6] text-[#374151] text-sm font-bold rounded-lg border border-[#E5E7EB] hover:bg-[#E5E7EB] disabled:opacity-50 transition"
      >
        {loading && actionType === 'decline' ? t('declining') : t('decline')}
      </button>
    </>
  )
}
