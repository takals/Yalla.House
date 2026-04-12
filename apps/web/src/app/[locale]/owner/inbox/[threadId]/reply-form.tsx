'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { sendReplyAction } from './actions'

interface ReplyFormProps {
  threadId: string
}

export function ReplyForm({ threadId }: ReplyFormProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    setError(null)

    const result = await sendReplyAction(threadId, message)
    setSending(false)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your reply..."
          rows={2}
          className="flex-1 px-4 py-3 bg-white rounded-xl border border-[#E2E4EB] text-sm text-[#0F1117] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E] resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e)
            }
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="self-end px-4 py-3 bg-[#D4764E] text-white rounded-xl hover:bg-[#BF6840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-[#999] mt-2">Press Cmd+Enter to send</p>
    </form>
  )
}
