import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'

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

export default async function AgentInboxPage() {
  const t = await getTranslations('agentInbox')
  const locale = await getLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  let threads: ThreadWithData[] = []
  try {
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
    console.error('Failed to fetch agent threads:', error)
  }

  const shortId = userId.slice(0, 8)
  const yallaEmail = `agent-${shortId}@mail.yalla.house`

  function formatDate(dateStr: string | null): string {
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

    return date.toLocaleDateString(dateLocale, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">{t('title')}</h1>
        <p className="text-sm text-text-muted mt-2">{t('subtitle')}</p>
      </div>

      {/* Yalla Email */}
      <div className="bg-white rounded-2xl border border-border-default p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">{t('yourEmail')}</h2>
            <p className="text-base font-mono text-brand">{yallaEmail}</p>
          </div>
          <div className="text-xs text-text-muted text-right max-w-xs">{t('emailExplainer')}</div>
        </div>
      </div>

      {threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map(thread => (
            <Link
              key={thread.id}
              href={`/agent/inbox/${thread.id}`}
              className="block bg-white rounded-2xl border border-border-default p-6 hover:border-brand hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-base mb-1 truncate">
                    {thread.subject ?? thread.listing?.title_de ?? 'Message'}
                  </h3>
                  {thread.listing && (
                    <p className="text-sm text-text-muted">{thread.listing.place_id}</p>
                  )}
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap ml-2 flex-shrink-0">
                  {formatDate(thread.last_message_at)}
                </span>
              </div>
              <div className="flex items-center text-text-muted text-sm">
                <MessageCircle size={14} className="mr-2 flex-shrink-0" />
                <span>{t('viewConversation')}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-default p-12 text-center">
          <MessageCircle size={48} className="mx-auto mb-4 text-[#D9DCE4]" />
          <h3 className="text-base font-semibold text-text-primary mb-1">{t('noMessages')}</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">{t('noMessagesDesc')}</p>
        </div>
      )}
    </div>
  )
}
