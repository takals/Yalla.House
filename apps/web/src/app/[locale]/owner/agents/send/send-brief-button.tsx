'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2 } from 'lucide-react'

interface SendBriefButtonProps {
  listingId: string
  agentIds: string[]
  label: string
}

export function SendBriefButton({ listingId, agentIds, label }: SendBriefButtonProps) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/owner-briefs/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          agent_ids: agentIds,
          tier: 'advisory',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send brief')
      }

      // Redirect to tracking page on success
      router.push('/owner/agents/tracking')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-[#C26039] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
        {sending ? 'Sending...' : label}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
