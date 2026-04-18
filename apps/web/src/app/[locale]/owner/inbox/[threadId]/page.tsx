import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { ReplyForm } from './reply-form'
import { dateLocaleFromLocale } from '@/lib/country-config'

interface Message {
  id: string
  body: string
  channel: string
  sent_at: string
  sender: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

interface Props {
  params: Promise<{ threadId: string; locale: string }>
}

export default async function ThreadDetailPage({ params }: Props) {
  const { threadId, locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Verify user is a participant in this thread
  const { data: participant } = await (supabase as any)
    .from('thread_participants')
    .select('thread_id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!participant) {
    redirect(`/${locale}/owner/inbox`)
  }

  // Fetch thread metadata
  const { data: thread } = await (supabase as any)
    .from('message_threads')
    .select(`
      id, subject, listing_id, created_at,
      listing:listings(title_de, place_id, address_line1, city)
    `)
    .eq('id', threadId)
    .single()

  // Fetch messages with sender info
  const { data: messagesData } = await (supabase as any)
    .from('messages')
    .select(`
      id, body, channel, sent_at,
      sender:users!messages_sender_id_fkey(id, full_name, email)
    `)
    .eq('thread_id', threadId)
    .order('sent_at', { ascending: true })
    .limit(200)

  const messages: Message[] = (messagesData ?? []).map((msg: any) => ({
    id: msg.id,
    body: msg.body,
    channel: msg.channel,
    sent_at: msg.sent_at,
    sender: msg.sender ?? null,
  }))

  // Update last_read_at for this participant
  await (supabase as any)
    .from('thread_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('user_id', userId)

  function formatMessageDate(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()

    const time = date.toLocaleTimeString(dateLocaleFromLocale(locale), {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (isToday) return `Today ${time}`
    if (isYesterday) return `Yesterday ${time}`
    return `${date.toLocaleDateString(dateLocaleFromLocale(locale), {
      month: 'short',
      day: 'numeric',
    })} ${time}`
  }

  const defaultBadge = { label: 'Yalla', color: 'bg-brand/10 text-brand' }
  const channelBadge: Record<string, { label: string; color: string }> = {
    in_app: defaultBadge,
    email: { label: 'Email', color: 'bg-blue-50 text-blue-600' },
    whatsapp: { label: 'WhatsApp', color: 'bg-green-50 text-green-600' },
    sms: { label: 'SMS', color: 'bg-purple-50 text-purple-600' },
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/owner/inbox"
          className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Inbox
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {thread?.subject || thread?.listing?.title_de || 'Conversation'}
        </h1>
        {thread?.listing && (
          <p className="text-sm text-text-muted mt-1">
            {thread.listing.address_line1}{thread.listing.city ? `, ${thread.listing.city}` : ''}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-border-default overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle size={40} className="mx-auto mb-3 text-[#D9DCE4]" />
            <p className="text-sm text-text-muted">No messages yet. Start the conversation below.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {messages.map((msg) => {
              const isOwner = msg.sender?.id === userId
              const badge = channelBadge[msg.channel] ?? defaultBadge

              return (
                <div
                  key={msg.id}
                  className={`p-5 ${isOwner ? 'bg-[#FAFAFA]' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isOwner ? 'bg-brand text-white' : 'bg-bg text-text-primary'
                      }`}>
                        {(msg.sender?.full_name || msg.sender?.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-text-primary">
                          {isOwner ? 'You' : (msg.sender?.full_name || msg.sender?.email || 'Unknown')}
                        </span>
                        <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">{formatMessageDate(msg.sent_at)}</span>
                  </div>
                  <div className="ml-10">
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{msg.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reply Form */}
        <div className="border-t border-border-default p-5 bg-[#FAFAFA]">
          <ReplyForm threadId={threadId} />
        </div>
      </div>
    </div>
  )
}
