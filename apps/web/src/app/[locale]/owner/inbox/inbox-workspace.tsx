'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Search, Star, Archive, Ban, MessageCircle, Send, Loader2,
  Phone, Mail, ChevronRight, Filter, Clock, CheckCheck,
  Banknote, ShieldCheck, Home, Link2, User, Users,
  X, ArrowLeft,
} from 'lucide-react'
import { sendReplyAction } from './[threadId]/actions'

/* ── Types ──────────────────────────────────────────── */

interface Contact {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  role: 'hunter' | 'agent' | 'unknown'
  hunter_profile?: {
    budget_min: number | null
    budget_max: number | null
    intent: string | null
    timeline: string | null
    mortgage_verified: boolean
    identity_verified: boolean
    finance_status: string | null
  } | null
}

interface Message {
  id: string
  body: string
  channel: string
  sent_at: string
  sender_id: string | null
}

interface Thread {
  id: string
  subject: string | null
  last_message_at: string | null
  listing_id: string | null
  listing_title: string | null
  listing_place_id: string | null
  is_starred: boolean
  is_archived: boolean
  is_blocked: boolean
  last_message_body: string | null
  last_message_channel: string | null
  last_message_sender_id: string | null
  contact: Contact | null
  messages: Message[]
  has_owner_reply: boolean
}

interface Props {
  threads: Thread[]
  userId: string
  locale: string
  translations: Record<string, string>
}

/* ── Helpers ────────────────────────────────────────── */

/** Safe translation accessor — returns key as fallback */
function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

function relativeTime(dateStr: string | null, t: Record<string, string>): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return tr(t, 'justNow')
  if (diffMins < 60) return tr(t, 'minutesAgo').replace('{count}', String(diffMins))
  if (diffHours < 24) return tr(t, 'hoursAgo').replace('{count}', String(diffHours))
  if (diffDays < 7) return tr(t, 'daysAgo').replace('{count}', String(diffDays))
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function contactInitials(contact: Contact | null): string {
  if (!contact) return '?'
  const name = contact.full_name || contact.email || '?'
  const parts = name.split(/[\s@]/)
  const a = parts[0]
  const b = parts[1]
  if (parts.length > 1 && a && b) {
    return (a.charAt(0) + b.charAt(0)).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function contactName(contact: Contact | null): string {
  if (!contact) return 'Unknown'
  return contact.full_name || contact.email || 'Unknown'
}

const CHANNEL_CONFIG: Record<string, { key: string; color: string; icon: typeof Mail }> = {
  whatsapp: { key: 'sourceWhatsApp', color: 'bg-green-50 text-green-600', icon: Phone },
  email: { key: 'sourceEmail', color: 'bg-blue-50 text-blue-600', icon: Mail },
  in_app: { key: 'sourceInApp', color: 'bg-brand/10 text-brand', icon: MessageCircle },
  sms: { key: 'sourceSms', color: 'bg-purple-50 text-purple-600', icon: MessageCircle },
}

type TabFilter = 'all' | 'unread' | 'starred' | 'archived'

/* ── Component ──────────────────────────────────────── */

export function InboxWorkspace({ threads: initialThreads, userId, locale, translations: t }: Props) {
  const [threads, setThreads] = useState(initialThreads)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedThread = useMemo(
    () => threads.find(th => th.id === selectedId) ?? null,
    [threads, selectedId]
  )

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedThread?.messages.length])

  // Focus textarea on thread selection
  useEffect(() => {
    if (selectedId) textareaRef.current?.focus()
  }, [selectedId])

  /* ── Filtering ────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = threads
    if (tab === 'unread') list = list.filter(th => !th.has_owner_reply)
    else if (tab === 'starred') list = list.filter(th => th.is_starred)
    else if (tab === 'archived') list = list.filter(th => th.is_archived)
    else list = list.filter(th => !th.is_archived)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(th =>
        contactName(th.contact).toLowerCase().includes(q) ||
        (th.subject ?? '').toLowerCase().includes(q) ||
        (th.last_message_body ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [threads, tab, search])

  /* ── Actions ──────────────────────────────────── */
  function toggleStar(threadId: string) {
    setThreads(prev => prev.map(th =>
      th.id === threadId ? { ...th, is_starred: !th.is_starred } : th
    ))
  }
  function toggleArchive(threadId: string) {
    setThreads(prev => prev.map(th =>
      th.id === threadId ? { ...th, is_archived: !th.is_archived } : th
    ))
  }
  function toggleBlock(threadId: string) {
    setThreads(prev => prev.map(th =>
      th.id === threadId ? { ...th, is_blocked: !th.is_blocked } : th
    ))
  }

  async function handleSendReply() {
    if (!selectedId || !replyText.trim() || sending) return
    setSending(true)
    setReplyError(null)
    const result = await sendReplyAction(selectedId, replyText)
    setSending(false)
    if (result.error) { setReplyError(result.error); return }
    // Optimistic update
    const now = new Date().toISOString()
    const newMsg: Message = {
      id: `temp-${Date.now()}`,
      body: replyText.trim(),
      channel: 'in_app',
      sent_at: now,
      sender_id: userId,
    }
    setThreads(prev => prev.map(th =>
      th.id === selectedId
        ? { ...th, messages: [...th.messages, newMsg], last_message_at: now, last_message_body: replyText.trim(), last_message_sender_id: userId, has_owner_reply: true }
        : th
    ))
    setReplyText('')
  }

  /* ── Tab pills ────────────────────────────────── */
  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: tr(t, 'all') },
    { key: 'unread', label: tr(t, 'unread') },
    { key: 'starred', label: tr(t, 'starred') },
    { key: 'archived', label: tr(t, 'archived') },
  ]

  const unreadCount = threads.filter(th => !th.has_owner_reply && !th.is_archived).length

  /* ── Timeline helpers ─────────────────────────── */
  const timelineLabel = (tl: string | null) => {
    if (!tl) return null
    const map: Record<string, string> = {
      asap: tr(t, 'timelineAsap'), '3m': tr(t, 'timeline3m'), '6m': tr(t, 'timeline6m'),
      '1y': tr(t, 'timeline1y'), flexible: tr(t, 'timelineFlexible'),
    }
    return map[tl] ?? tl
  }
  const intentLabel = (intent: string | null) => {
    if (!intent) return null
    const map: Record<string, string> = { buy: tr(t, 'intentBuy'), rent: tr(t, 'intentRent'), both: tr(t, 'intentBoth') }
    return map[intent] ?? intent
  }

  /* ── Render ───────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-60px)] -m-4 lg:-m-8 bg-bg">

      {/* ═══ LEFT: Thread list + conversation ═══ */}
      <div className={`flex flex-col ${selectedId ? 'hidden lg:flex' : 'flex'} w-full lg:w-2/3 border-r border-border-default`}>

        {/* Header with tabs + search */}
        <div className="flex-shrink-0 bg-surface border-b border-border-default">
          <div className="px-5 pt-5 pb-3">
            <h1 className="text-xl font-bold text-text-primary">{tr(t, 'inbox')}</h1>
            <p className="text-xs text-text-secondary mt-0.5">{tr(t, 'subtitle')}</p>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pb-2">
            {tabs.map(tb => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  tab === tb.key
                    ? 'bg-brand/10 text-brand'
                    : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
                }`}
              >
                {tb.label}
                {tb.key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={tr(t, 'searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-bg rounded-lg text-xs text-text-primary placeholder-text-muted border border-border-default focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>
        </div>

        {/* Thread list or conversation */}
        {!selectedId ? (
          /* Thread list */
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <MessageCircle size={40} className="text-border-default mb-3" />
                <p className="text-sm font-semibold text-text-primary">{tr(t, 'noMessages')}</p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">{tr(t, 'noMessagesDesc')}</p>
              </div>
            ) : (
              filtered.map(thread => {
                const contact = thread.contact
                const ch = thread.last_message_channel ? CHANNEL_CONFIG[thread.last_message_channel] : null
                const isFromOwner = thread.last_message_sender_id === userId

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedId(thread.id)}
                    className={`w-full text-left px-5 py-4 border-b border-border-default/50 hover:bg-surface transition-colors ${
                      !thread.has_owner_reply ? 'bg-brand/[0.03]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        contact?.role === 'agent' ? 'bg-blue-50 text-blue-600' : 'bg-brand/10 text-brand'
                      }`}>
                        {contact?.avatar_url ? (
                          <img src={contact.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : contactInitials(contact)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + time row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-sm truncate ${!thread.has_owner_reply ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'}`}>
                              {contactName(contact)}
                            </span>
                            {contact?.role === 'agent' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">{tr(t, 'agent')}</span>
                            )}
                            {thread.is_starred && <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                          </div>
                          <span className="text-[11px] text-text-muted flex-shrink-0">
                            {relativeTime(thread.last_message_at, t)}
                          </span>
                        </div>

                        {/* Subject / listing */}
                        {thread.listing_title && (
                          <p className="text-[11px] text-text-secondary truncate mt-0.5">
                            {thread.listing_title}
                          </p>
                        )}

                        {/* Last message preview + channel badge */}
                        <div className="flex items-center gap-2 mt-1">
                          {ch && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${ch.color}`}>
                              {tr(t, ch.key ?? '')}
                            </span>
                          )}
                          <p className="text-xs text-text-muted truncate">
                            {isFromOwner && <span className="text-text-secondary">{tr(t, 'you')}: </span>}
                            {thread.last_message_body || '...'}
                          </p>
                          {!thread.has_owner_reply && (
                            <span className="ml-auto flex-shrink-0 w-2 h-2 rounded-full bg-brand" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        ) : (
          /* Conversation view */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-5 py-3 bg-surface border-b border-border-default flex-shrink-0">
              <button onClick={() => setSelectedId(null)} className="lg:hidden text-text-secondary hover:text-text-primary">
                <ArrowLeft size={18} />
              </button>
              <button onClick={() => setSelectedId(null)} className="hidden lg:block text-text-secondary hover:text-text-primary">
                <ArrowLeft size={16} />
              </button>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedThread?.contact?.role === 'agent' ? 'bg-blue-50 text-blue-600' : 'bg-brand/10 text-brand'
              }`}>
                {contactInitials(selectedThread?.contact ?? null)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">
                  {contactName(selectedThread?.contact ?? null)}
                </p>
                {selectedThread?.listing_title && (
                  <p className="text-[11px] text-text-secondary truncate">{selectedThread.listing_title}</p>
                )}
              </div>
              {/* Quick actions */}
              <div className="flex items-center gap-1">
                <button onClick={() => selectedId && toggleStar(selectedId)} className="p-1.5 rounded-md hover:bg-bg transition-colors" title={selectedThread?.is_starred ? tr(t, 'unstar') : tr(t, 'star')}>
                  <Star size={15} className={selectedThread?.is_starred ? 'text-amber-400 fill-amber-400' : 'text-text-muted'} />
                </button>
                <button onClick={() => selectedId && toggleArchive(selectedId)} className="p-1.5 rounded-md hover:bg-bg transition-colors" title={selectedThread?.is_archived ? tr(t, 'unarchive') : tr(t, 'archive')}>
                  <Archive size={15} className={selectedThread?.is_archived ? 'text-brand' : 'text-text-muted'} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {selectedThread?.messages.map(msg => {
                const isOwner = msg.sender_id === userId
                const ch = CHANNEL_CONFIG[msg.channel]
                return (
                  <div key={msg.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwner
                        ? 'bg-brand text-white rounded-br-md'
                        : 'bg-surface border border-border-default rounded-bl-md'
                    }`}>
                      <p className={`text-sm leading-relaxed whitespace-pre-line ${isOwner ? '' : 'text-text-primary'}`}>
                        {msg.body}
                      </p>
                      <div className={`flex items-center gap-2 mt-1 ${isOwner ? 'justify-end' : ''}`}>
                        {ch && !isOwner && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${ch.color}`}>{tr(t, ch.key ?? '')}</span>
                        )}
                        <span className={`text-[10px] ${isOwner ? 'text-white/60' : 'text-text-muted'}`}>
                          {new Date(msg.sent_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwner && <CheckCheck size={12} className="text-white/60" />}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply box */}
            <div className="flex-shrink-0 px-5 py-3 bg-surface border-t border-border-default">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={tr(t, 'typeReply')}
                  rows={2}
                  className="flex-1 px-4 py-2.5 bg-bg rounded-xl text-sm text-text-primary placeholder-text-muted border border-border-default focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="px-3.5 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-40"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              {replyError && <p className="text-xs text-red-600 mt-1">{replyError}</p>}
              <p className="text-[10px] text-text-muted mt-1">{tr(t, 'sendHint')}</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ RIGHT: Contact intelligence panel ═══ */}
      <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-col w-full lg:w-1/3 bg-surface overflow-y-auto`}>
        {selectedThread ? (
          <ContactPanel
            thread={selectedThread}
            userId={userId}
            t={t}
            onStar={() => toggleStar(selectedThread.id)}
            onArchive={() => toggleArchive(selectedThread.id)}
            onBlock={() => toggleBlock(selectedThread.id)}
            timelineLabel={timelineLabel}
            intentLabel={intentLabel}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center mb-4">
              <User size={28} className="text-border-default" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{tr(t, 'noContactSelected')}</p>
            <p className="text-xs text-text-secondary mt-1 max-w-xs">{tr(t, 'noContactSelectedDesc')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Contact Panel ──────────────────────────────────── */

function ContactPanel({
  thread, userId, t, onStar, onArchive, onBlock, timelineLabel, intentLabel,
}: {
  thread: Thread
  userId: string
  t: Record<string, string>
  onStar: () => void
  onArchive: () => void
  onBlock: () => void
  timelineLabel: (tl: string | null) => string | null
  intentLabel: (intent: string | null) => string | null
}) {
  const contact = thread.contact
  const hp = contact?.hunter_profile

  const channelConfig = thread.last_message_channel ? CHANNEL_CONFIG[thread.last_message_channel] : null

  return (
    <div className="flex flex-col h-full">
      {/* Profile card */}
      <div className="px-6 pt-6 pb-5 border-b border-border-default text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 ${
          contact?.role === 'agent' ? 'bg-blue-50 text-blue-600' : 'bg-brand/10 text-brand'
        }`}>
          {contact?.avatar_url ? (
            <img src={contact.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : contactInitials(contact)}
        </div>
        <h2 className="text-base font-bold text-text-primary">{contactName(contact)}</h2>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            contact?.role === 'agent' ? 'bg-blue-50 text-blue-600' : 'bg-brand/10 text-brand'
          }`}>
            {contact?.role === 'agent' ? tr(t, 'agent') : contact?.role === 'hunter' ? tr(t, 'hunter') : tr(t, 'unknown')}
          </span>
          {channelConfig && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${channelConfig.color}`}>
              {tr(t, channelConfig.key ?? '')}
            </span>
          )}
        </div>
        {contact?.email && (
          <p className="text-xs text-text-secondary mt-2 truncate">{contact.email}</p>
        )}

        {/* Status badges */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {!thread.has_owner_reply && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
              {tr(t, 'awaiting')}
            </span>
          )}
          {thread.has_owner_reply && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
              {tr(t, 'replied')}
            </span>
          )}
          {thread.is_blocked && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              {tr(t, 'blockedLabel')}
            </span>
          )}
        </div>
      </div>

      {/* Buyer intelligence */}
      {hp && (
        <div className="px-6 py-4 border-b border-border-default">
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">{tr(t, 'buyerProfile')}</h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hp.mortgage_verified && (
              <Badge icon={<ShieldCheck size={11} />} label={tr(t, 'mortgageApproved')} color="bg-green-50 text-green-700" />
            )}
            {hp.finance_status === 'cash' && (
              <Badge icon={<Banknote size={11} />} label={tr(t, 'cashBuyer')} color="bg-emerald-50 text-emerald-700" />
            )}
            {hp.finance_status === 'pre_approved' && (
              <Badge icon={<ShieldCheck size={11} />} label={tr(t, 'preApproved')} color="bg-blue-50 text-blue-700" />
            )}
            {hp.identity_verified && (
              <Badge icon={<CheckCheck size={11} />} label={tr(t, 'chainFree')} color="bg-purple-50 text-purple-700" />
            )}
          </div>

          {/* Stats grid */}
          <div className="space-y-2.5">
            {(hp.budget_min || hp.budget_max) && (
              <StatRow icon={<Banknote size={13} />} label={tr(t, 'budget')}>
                {hp.budget_min && hp.budget_max
                  ? `${(hp.budget_min / 100).toLocaleString()} – ${(hp.budget_max / 100).toLocaleString()}`
                  : hp.budget_max ? `${tr(t, 'budget')}: ${(hp.budget_max / 100).toLocaleString()}` : ''
                }
              </StatRow>
            )}
            {hp.intent && (
              <StatRow icon={<Home size={13} />} label={tr(t, 'intent')}>
                {intentLabel(hp.intent)}
              </StatRow>
            )}
            {hp.timeline && (
              <StatRow icon={<Clock size={13} />} label={tr(t, 'timeline')}>
                {timelineLabel(hp.timeline)}
              </StatRow>
            )}
          </div>
        </div>
      )}

      {/* Listing reference */}
      {thread.listing_place_id && (
        <div className="px-6 py-4 border-b border-border-default">
          <a
            href={`/p/${thread.listing_place_id}`}
            className="flex items-center gap-2 text-xs font-semibold text-brand hover:underline"
          >
            <Link2 size={13} />
            {tr(t, 'viewListing')}: {thread.listing_title || thread.listing_place_id}
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 mt-auto">
        <div className="flex flex-col gap-2">
          <button
            onClick={onStar}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-bg transition-colors w-full"
          >
            <Star size={15} className={thread.is_starred ? 'text-amber-400 fill-amber-400' : 'text-text-muted'} />
            {thread.is_starred ? tr(t, 'unstar') : tr(t, 'star')}
          </button>
          <button
            onClick={onArchive}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-bg transition-colors w-full"
          >
            <Archive size={15} className={thread.is_archived ? 'text-brand' : 'text-text-muted'} />
            {thread.is_archived ? tr(t, 'unarchive') : tr(t, 'archive')}
          </button>
          <button
            onClick={onBlock}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <Ban size={15} />
            {thread.is_blocked ? tr(t, 'unblock') : tr(t, 'block')}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Small UI pieces ───────────────────────────────── */

function Badge({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${color}`}>
      {icon} {label}
    </span>
  )
}

function StatRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-text-muted">{icon}</span>
      <span className="text-[11px] text-text-secondary font-medium w-16 flex-shrink-0">{label}</span>
      <span className="text-[12px] text-text-primary font-semibold">{children}</span>
    </div>
  )
}
