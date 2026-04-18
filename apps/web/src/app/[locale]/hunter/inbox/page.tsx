import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { dateLocaleFromLocale } from '@/lib/country-config'

interface ThreadWithData {
  id: string
  subject: string | null
  last_message_at: string | null
  listing_id: string | null
  viewing_id: string | null
  listing?: {
    title_de: string | null
    place_id: string
  } | null
}

export default async function HunterInboxPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all message threads where this hunter is a participant
  let threads: ThreadWithData[] = []
  try {
    const { data } = await (supabase as any)
      .from('message_threads')
      .select(`
        id, subject, last_message_at, listing_id, viewing_id,
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
      viewing_id: thread.viewing_id,
      listing: thread.listing ? {
        title_de: thread.listing.title_de,
        place_id: thread.listing.place_id,
      } : null,
    }))
  } catch (error) {
    console.error('Failed to fetch message threads:', error)
  }

  // Generate Yalla email address for hunter
  // Format: h-{shortId}@mail.yalla.house
  const shortId = userId.slice(0, 8)
  const yallaEmail = `h-${shortId}@mail.yalla.house`

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

    return date.toLocaleDateString(dateLocale, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  // Separate threads into agent conversations and property matches
  const agentThreads = threads.filter(t => t.subject && t.subject.includes('agent'))
  const propertyThreads = threads.filter(t => t.listing_id && !t.subject?.includes('agent'))

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {t('comms.inbox')}
        </h1>
        <p className="text-sm text-text-muted mt-2">
          {t('comms.emailExplainer')}
        </p>
      </div>

      {/* Yalla Email Address Card */}
      <div className="bg-white rounded-2xl border border-border-default p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              {t('comms.yourYallaEmail')}
            </h2>
            <p className="text-base font-mono text-brand">{yallaEmail}</p>
          </div>
          <div className="text-xs text-text-muted text-right max-w-xs">
            {t('comms.emailExplainer')}
          </div>
        </div>
      </div>

      {/* Message Threads */}
      {threads.length > 0 ? (
        <div className="space-y-8">
          {/* Agent Conversations */}
          {agentThreads.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Agent Conversations
              </h2>
              <div className="space-y-4">
                {agentThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/hunter/inbox/${thread.id}`}
                    className="block bg-white rounded-2xl border border-border-default p-6 hover:border-brand hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary text-base mb-1 truncate">
                          {thread.subject || 'Agent Message'}
                        </h3>
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap ml-2 flex-shrink-0">
                        {formatDate(thread.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center text-text-muted text-sm">
                      <MessageCircle size={14} className="mr-2 flex-shrink-0" />
                      <span>View conversation</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Property Matches */}
          {propertyThreads.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Property Matches
              </h2>
              <div className="space-y-4">
                {propertyThreads.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/hunter/inbox/${thread.id}`}
                    className="block bg-white rounded-2xl border border-border-default p-6 hover:border-brand hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary text-base mb-1 truncate">
                          {thread.listing?.title_de || 'Property Update'}
                        </h3>
                        {thread.listing && (
                          <p className="text-sm text-text-muted mb-3">
                            {thread.listing.place_id}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap ml-2 flex-shrink-0">
                        {formatDate(thread.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center text-text-muted text-sm">
                      <MessageCircle size={14} className="mr-2 flex-shrink-0" />
                      <span>View conversation</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-default p-12 text-center">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-[#D9DCE4]"
          />
          <h3 className="text-base font-semibold text-text-primary mb-1">
            {t('comms.noMessages')}
          </h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">
            When agents send you property matches or respond to your search, conversations will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
