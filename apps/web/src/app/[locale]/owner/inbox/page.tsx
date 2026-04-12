import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface ThreadWithData {
  id: string
  subject: string | null
  last_message_at: string | null
  listing_id: string | null
  listing?: {
    title_de: string | null
    place_id: string
  } | null
}

export default async function OwnerInboxPage() {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all message threads where this owner is a participant
  let threads: ThreadWithData[] = []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('message_threads')
      .select(`
        id, subject, last_message_at, listing_id,
        thread_participants!inner(user_id),
        listing:listings(title_de, place_id)
      `)
      .eq('thread_participants.user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(50)

    threads = (data ?? []).map((thread: any) => ({
      id: thread.id,
      subject: thread.subject,
      last_message_at: thread.last_message_at,
      listing_id: thread.listing_id,
      listing: thread.listing ? {
        title_de: thread.listing.title_de,
        place_id: thread.listing.place_id,
      } : null,
    }))
  } catch (error) {
    console.error('Failed to fetch message threads:', error)
  }

  // Generate Yalla email address
  // For MVP, use listing place_id if available, otherwise use user ID
  const yallaEmail = `owner-${userId.slice(0, 8)}@mail.yalla.house`

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] tracking-tight">
          {t('comms.inbox')}
        </h1>
        <p className="text-sm text-[#656565] mt-2">
          {t('comms.emailExplainer')}
        </p>
      </div>

      {/* Yalla Email Address Card */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F1117] mb-1">
              {t('comms.yourYallaEmail')}
            </h2>
            <p className="text-base font-mono text-[#D4764E]">{yallaEmail}</p>
          </div>
          <div className="text-xs text-[#999] text-right max-w-xs">
            {t('comms.emailExplainer')}
          </div>
        </div>
      </div>

      {/* Message Threads List */}
      {threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/owner/inbox/${thread.id}`}
              className="block bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:border-[#D4764E] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0F1117] text-base mb-1 truncate">
                    {thread.subject || (thread.listing?.title_de || 'Message Thread')}
                  </h3>
                  {thread.listing && (
                    <p className="text-sm text-[#656565] mb-3">
                      {thread.listing.title_de} · {thread.listing.place_id}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[#999] whitespace-nowrap ml-2 flex-shrink-0">
                  {formatDate(thread.last_message_at)}
                </span>
              </div>
              <div className="flex items-center text-[#999] text-sm">
                <MessageCircle size={14} className="mr-2 flex-shrink-0" />
                <span>View conversation</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-12 text-center">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-[#D9DCE4]"
          />
          <h3 className="text-base font-semibold text-[#0F1117] mb-1">
            {t('comms.noMessages')}
          </h3>
          <p className="text-sm text-[#656565] max-w-sm mx-auto">
            {t('comms.noMessagesDesc')}
          </p>
        </div>
      )}
    </div>
  )
}
