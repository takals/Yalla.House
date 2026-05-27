'use client'

import { useState, useMemo, useRef, useEffect, useTransition } from 'react'
import {
  Banknote, Calendar, MessageCircle, Send, Loader2,
  Phone, Mail, ChevronRight, Clock, CheckCheck,
  ShieldCheck, Home, User, Gavel, Users, HandCoins,
  ArrowLeftRight, X, ArrowLeft, Eye, Inbox,
  CircleCheck, CircleDashed, CheckCircle2, Info,
} from 'lucide-react'
import { sendReplyAction } from '../inbox/[threadId]/actions'
import { updateOfferStatusAction } from '../offers/actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

/* ── Types ─────────────────────────────────────── */

interface ActivityItem {
  id: string
  type: 'offer' | 'viewing' | 'message'
  contactId: string
  listingId: string | null
  timestamp: string
  data: any
}

interface DealContact {
  id: string
  name: string
  email: string | null
  role: 'hunter' | 'agent' | 'unknown'
  hunterProfile: {
    budgetMin: number | null
    budgetMax: number | null
    intent: string | null
    timeline: string | null
    mortgageVerified: boolean
    identityVerified: boolean
    financeStatus: string | null
    buyerStatus: string | null
  } | null
}

interface Props {
  activities: ActivityItem[]
  contacts: Record<string, DealContact>
  listings: Record<string, { title: string; title_de: string; city: string; postcode: string }>
  userId: string
  locale: string
  t: Record<string, string>
  demoActivities?: ActivityItem[]
  demoContacts?: Record<string, DealContact>
}

/* ── Helpers ───────────────────────────────────── */

function tx(t: Record<string, string>, key: string): string {
  return t[key] || key
}

function initials(name: string): string {
  const parts = name.split(/[\s@]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function relativeTime(dateStr: string, t: Record<string, string>): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return tx(t, 'justNow')
  if (diffMins < 60) return tx(t, 'minutesAgo').replace('__count__', String(diffMins))
  if (diffHours < 24) return tx(t, 'hoursAgo').replace('__count__', String(diffHours))
  if (diffDays < 7) return tx(t, 'daysAgo').replace('__count__', String(diffDays))
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDate(dateStr: string, locale: string): string {
  const dl = dateLocaleFromLocale(locale)
  return new Date(dateStr).toLocaleDateString(dl, {
    day: 'numeric', month: 'short', year: undefined, hour: '2-digit', minute: '2-digit',
  })
}

function channelIcon(channel: string) {
  if (channel === 'whatsapp') return <Phone className="w-3 h-3 text-green-500" />
  if (channel === 'email') return <Mail className="w-3 h-3 text-blue-500" />
  return <MessageCircle className="w-3 h-3 text-brand" />
}

function channelLabel(channel: string, t: Record<string, string>): string {
  if (channel === 'whatsapp') return tx(t, 'viaWhatsApp')
  if (channel === 'email') return tx(t, 'viaEmail')
  return tx(t, 'viaInApp')
}

type TabFilter = 'all' | 'offer' | 'viewing' | 'message'

const DEMO_CONTACT_ID = '__demo_hans_wurst__'

/* ── Component ─────────────────────────────────── */

export function DealsClient({ activities, contacts, listings, userId, locale, t, demoActivities, demoContacts }: Props) {
  const [tab, setTab] = useState<TabFilter>('all')
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)
  const [counterMode, setCounterMode] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDemo = selectedContactId === DEMO_CONTACT_ID

  /* ── Merge real + demo data ──────────────────── */
  const allActivities = useMemo(() => {
    const real = activities || []
    const demo = demoActivities || []
    return [...real, ...demo]
  }, [activities, demoActivities])

  const allContacts = useMemo(() => {
    return { ...contacts, ...(demoContacts || {}) }
  }, [contacts, demoContacts])

  /* ── Toast auto-dismiss ──────────────────────── */
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  /* ── Derive contact list with latest activity ── */
  const contactList = useMemo(() => {
    const map = new Map<string, { contact: DealContact; latestTime: string; latestType: string; preview: string; channel: string; isDemo: boolean }>()

    for (const act of allActivities) {
      if (!act.contactId || !allContacts[act.contactId]) continue
      if (tab !== 'all' && act.type !== tab) continue

      if (!map.has(act.contactId)) {
        let preview = ''
        let channel = 'in_app'

        if (act.type === 'offer') {
          const amt = act.data.amount
          const cur = act.data.currency || 'EUR'
          preview = amt ? new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amt) : ''
          preview += act.data.finance_status === 'cash' ? ' — ' + tx(t, 'financeCash').toLowerCase() : ''
        } else if (act.type === 'viewing') {
          preview = act.data.scheduled_at
            ? formatDate(act.data.scheduled_at, locale)
            : tx(t, 'viewingScheduled')
        } else if (act.type === 'message') {
          preview = act.data.body?.slice(0, 80) ?? ''
          channel = act.data.channel ?? 'in_app'
        }

        map.set(act.contactId, {
          contact: allContacts[act.contactId]!,
          latestTime: act.timestamp,
          latestType: act.type,
          preview,
          channel,
          isDemo: act.contactId === DEMO_CONTACT_ID,
        })
      }
    }

    // Sort: real contacts first (by time), demo always last
    return [...map.values()].sort((a, b) => {
      if (a.isDemo && !b.isDemo) return 1
      if (!a.isDemo && b.isDemo) return -1
      return new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime()
    })
  }, [allActivities, allContacts, tab, t, locale])

  /* ── Contact's timeline ────────────────────── */
  const contactTimeline = useMemo(() => {
    if (!selectedContactId) return []
    return allActivities
      .filter(a => a.contactId === selectedContactId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [allActivities, selectedContactId])

  const selectedContact = selectedContactId ? allContacts[selectedContactId] ?? null : null

  /* ── Find thread ID for reply ──────────────── */
  const threadId = useMemo(() => {
    if (!selectedContactId || isDemo) return null
    const msgAct = allActivities.find(a => a.contactId === selectedContactId && a.type === 'message')
    return msgAct?.data?.threadId ?? null
  }, [allActivities, selectedContactId, isDemo])

  /* ── Counts ────────────────────────────────── */
  const offerCount = useMemo(() =>
    allActivities.filter(a => a.type === 'offer').length,
  [allActivities])
  const viewingCount = useMemo(() =>
    allActivities.filter(a => a.type === 'viewing').length,
  [allActivities])
  const messageCount = useMemo(() => {
    const contactsWithMsgs = new Set<string>()
    for (const a of allActivities) {
      if (a.type === 'message') contactsWithMsgs.add(a.contactId)
    }
    return contactsWithMsgs.size
  }, [allActivities])

  /* ── Has active offer for selected contact ── */
  const activeOffer = useMemo(() => {
    if (!selectedContactId) return null
    return allActivities.find(a =>
      a.contactId === selectedContactId &&
      a.type === 'offer' &&
      ['submitted', 'under_review'].includes(a.data.status)
    ) ?? null
  }, [allActivities, selectedContactId])

  /* ── Sale checklist progress ───────────────── */
  const checklistItems = useMemo(() => {
    if (!selectedContactId) return []
    const hasViewing = contactTimeline.some(a => a.type === 'viewing' && a.data.status === 'completed')
    const hasOffer = contactTimeline.some(a => a.type === 'offer')

    return [
      { key: 'checkListingLive', done: true },
      { key: 'checkViewings', done: hasViewing },
      { key: 'checkOfferReceived', done: hasOffer },
      { key: 'checkInstructSolicitor', done: false },
      { key: 'checkBuyerSolicitor', done: false },
      { key: 'checkMemorandum', done: false },
      { key: 'checkSearchesSurveys', done: false },
      { key: 'checkExchange', done: false },
      { key: 'checkCompletion', done: false },
    ]
  }, [contactTimeline, selectedContactId])

  /* ── Passport score ────────────────────────── */
  const passportScore = useMemo(() => {
    if (!selectedContact?.hunterProfile) return 0
    const hp = selectedContact.hunterProfile
    let score = 0
    if (hp.identityVerified) score += 25
    if (hp.financeStatus === 'cash' || hp.mortgageVerified) score += 25
    if (hp.budgetMin || hp.budgetMax) score += 25
    if (hp.intent) score += 25
    return score
  }, [selectedContact])

  /* ── Auto-scroll messages ──────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [contactTimeline.length])

  /* ── Handle reply ──────────────────────────── */
  async function handleSendReply() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    if (!threadId || !replyText.trim() || sending) return
    setSending(true)
    const result = await sendReplyAction(threadId, replyText.trim())
    setSending(false)
    if (result?.success) {
      setReplyText('')
      setToast(tx(t, 'replySent'))
    }
  }

  /* ── Handle offer status ───────────────────── */
  function handleOfferAction(offerId: string, status: 'accepted' | 'declined') {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    startTransition(async () => {
      const result = await updateOfferStatusAction(offerId, status)
      if (result?.success) {
        setToast(status === 'accepted' ? tx(t, 'offerAccepted') : tx(t, 'offerDeclined'))
      }
    })
  }

  /* ── Action handlers ───────────────────────── */
  function handleInstructSolicitor() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    setToast(tx(t, 'solicitorToast'))
  }

  function handleInvolveAgent() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    window.location.href = `/${locale === 'de' ? '' : locale + '/'}owner/agents`
  }

  function handleRequestDeposit() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    setToast(tx(t, 'depositToast'))
  }

  function handleCounterOffer() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    setCounterMode(true)
    setCounterAmount('')
  }

  function handleSubmitCounter() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    if (!counterAmount.trim()) return
    setCounterMode(false)
    setCounterAmount('')
    setToast(tx(t, 'counterSent'))
  }

  function handleStartReply() {
    if (isDemo) { setToast(tx(t, 'demoToast')); return }
    setToast(tx(t, 'noThreadToast'))
  }

  /* ── Tab badges ────────────────────────────── */
  const tabConfig: { key: TabFilter; label: string; icon: typeof Inbox; count: number }[] = [
    { key: 'all', label: tx(t, 'tabAll'), icon: Inbox, count: contactList.length },
    { key: 'offer', label: tx(t, 'tabOffers'), icon: Banknote, count: offerCount },
    { key: 'viewing', label: tx(t, 'tabViewings'), icon: Calendar, count: viewingCount },
    { key: 'message', label: tx(t, 'tabMessages'), icon: MessageCircle, count: messageCount },
  ]

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-surface border border-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-text-primary animate-in slide-in-from-top-2">
          <Info className="w-4 h-4 text-brand flex-shrink-0" />
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-text-muted hover:text-text-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-1">{tx(t, 'pageTitle')}</h1>
        <p className="text-text-secondary text-sm">{tx(t, 'subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-5">
        {tabConfig.map(tc => (
          <button
            key={tc.key}
            onClick={() => { setTab(tc.key); setSelectedContactId(null); setCounterMode(false) }}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors border-b-2 ${
              tab === tc.key
                ? 'text-brand border-brand font-medium'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            <tc.icon className="w-4 h-4" />
            {tc.label}
            {tc.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === tc.key ? 'bg-brand text-white' : 'bg-bg-muted text-text-secondary'
              }`}>
                {tc.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Owner email bar */}
      <div className="flex items-center gap-3 bg-surface border border-border-light rounded-lg px-4 py-2.5 mb-5 text-sm">
        <Mail className="w-4 h-4 text-brand" />
        <span className="text-text-secondary">{tx(t, 'ownerEmailLabel')}:</span>
        <span className="font-medium text-text-primary">owner-{userId.slice(0, 4)}@yalla.house</span>
        <div className="ml-auto flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-500" />{tx(t, 'viaWhatsApp')}</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-500" />{tx(t, 'viaEmail')}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-brand" />{tx(t, 'viaInApp')}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] border border-border rounded-xl overflow-hidden bg-surface min-h-[560px]">

        {/* ── Left: Contact list ─────────────── */}
        <div className={`border-r border-border overflow-y-auto ${selectedContactId ? 'hidden lg:block' : ''}`}>
          {contactList.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-text-muted" />
              <p>{tx(t, 'noActivity')}</p>
              <p className="text-xs mt-1">{tx(t, 'noActivityDesc')}</p>
            </div>
          ) : (
            contactList.map(item => (
              <button
                key={item.contact.id}
                onClick={() => { setSelectedContactId(item.contact.id); setCounterMode(false) }}
                className={`w-full text-left px-3 py-3 border-b border-border-light transition-colors hover:bg-bg-soft ${
                  selectedContactId === item.contact.id ? 'bg-brand/5 border-l-[3px] border-l-brand' : ''
                } ${item.isDemo ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {item.contact.name}
                    {item.isDemo && (
                      <span className="ml-1.5 text-[10px] font-normal text-text-muted italic">{tx(t, 'exampleLabel')}</span>
                    )}
                  </span>
                  <span className="text-[11px] text-text-muted flex-shrink-0 ml-2">{relativeTime(item.latestTime, t)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    item.latestType === 'offer' ? 'bg-amber-50 text-amber-700' :
                    item.latestType === 'viewing' ? 'bg-blue-50 text-blue-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {item.latestType === 'offer' && <Banknote className="w-3 h-3" />}
                    {item.latestType === 'viewing' && <Calendar className="w-3 h-3" />}
                    {item.latestType === 'message' && <MessageCircle className="w-3 h-3" />}
                    {item.latestType === 'offer' ? tx(t, 'tabOffers') :
                     item.latestType === 'viewing' ? tx(t, 'tabViewings') :
                     tx(t, 'tabMessages')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate">{item.preview}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-text-muted">
                  {channelIcon(item.channel)}
                  <span>{channelLabel(item.channel, t)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* ── Right: Detail area ─────────────── */}
        {!selectedContactId ? (
          <div className="flex items-center justify-center text-text-secondary text-sm p-8">
            <div className="text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-text-muted" />
              <p className="font-medium">{tx(t, 'noActivity')}</p>
              <p className="text-xs mt-1">{tx(t, 'noActivityDesc')}</p>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col min-h-0 ${isDemo ? 'opacity-60' : ''}`}>

            {/* Demo banner */}
            {isDemo && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                {tx(t, 'demoBanner')}
              </div>
            )}

            {/* Detail header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <button
                  onClick={() => { setSelectedContactId(null); setCounterMode(false) }}
                  className="lg:hidden p-1 text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700">
                  {initials(selectedContact?.name ?? '?')}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{selectedContact?.name}</div>
                  <div className="text-[11px] text-text-secondary">
                    {selectedContact?.role === 'hunter' ? 'Home hunter' :
                     selectedContact?.role === 'agent' ? 'Agent' : ''}
                    {selectedContact?.hunterProfile?.buyerStatus ? ` — ${selectedContact.hunterProfile.buyerStatus}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                {selectedContact?.hunterProfile?.identityVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="w-3 h-3" />{tx(t, 'idVerified')}
                  </span>
                )}
                {selectedContact?.hunterProfile?.financeStatus === 'cash' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    <Banknote className="w-3 h-3" />{tx(t, 'cashBuyer')}
                  </span>
                )}
                {selectedContact?.hunterProfile?.mortgageVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <Home className="w-3 h-3" />{tx(t, 'mortgageApproved')}
                  </span>
                )}
              </div>
            </div>

            {/* Content: timeline + sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_200px] flex-1 min-h-0 overflow-hidden">

              {/* Timeline */}
              <div className="flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {contactTimeline.map((act, i) => (
                    <div key={act.id} className="flex gap-3 mb-4 relative">
                      {/* Connector line */}
                      {i < contactTimeline.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-[-8px] w-px bg-border-light" />
                      )}

                      {/* Dot */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        act.type === 'offer' ? 'bg-amber-50 text-amber-600' :
                        act.type === 'viewing' ? 'bg-blue-50 text-blue-600' :
                        act.data.isOwner ? 'bg-green-50 text-green-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {act.type === 'offer' && <Banknote className="w-3 h-3" />}
                        {act.type === 'viewing' && <Calendar className="w-3 h-3" />}
                        {act.type === 'message' && (act.data.isOwner
                          ? <Send className="w-3 h-3" />
                          : <MessageCircle className="w-3 h-3" />
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-text-primary mb-0.5">
                          {act.type === 'offer' && tx(t, 'offerSubmitted')}
                          {act.type === 'viewing' && (
                            act.data.status === 'completed' ? tx(t, 'viewingCompleted') :
                            act.data.status === 'confirmed' ? tx(t, 'viewingConfirmed') :
                            act.data.status === 'cancelled' ? tx(t, 'viewingCancelled') :
                            tx(t, 'viewingScheduled')
                          )}
                          {act.type === 'message' && (act.data.isOwner ? tx(t, 'youReplied') : tx(t, 'messageReceived'))}
                        </div>

                        {/* Offer card */}
                        {act.type === 'offer' && (
                          <div className="bg-bg-soft rounded-lg p-3 mt-1 text-xs">
                            <div className="text-lg font-medium text-brand">
                              {act.data.amount
                                ? new Intl.NumberFormat(locale, { style: 'currency', currency: act.data.currency || 'EUR', maximumFractionDigits: 0 }).format(act.data.amount)
                                : '—'}
                            </div>
                            <div className="grid grid-cols-2 gap-y-1 mt-2 text-text-secondary">
                              <span>{tx(t, 'conditions')}</span>
                              <span className="text-text-primary font-medium text-right">{act.data.conditions || tx(t, 'noConditions')}</span>
                              <span>{tx(t, 'finance')}</span>
                              <span className="text-text-primary font-medium text-right">
                                {act.data.finance_status === 'cash' ? tx(t, 'financeCash') :
                                 act.data.finance_status === 'mortgage_approved' ? tx(t, 'financeMortgageApproved') :
                                 tx(t, 'financeMortgagePending')}
                              </span>
                              {act.data.move_in_date && (
                                <>
                                  <span>{tx(t, 'moveIn')}</span>
                                  <span className="text-text-primary font-medium text-right">{act.data.move_in_date}</span>
                                </>
                              )}
                              <span>{tx(t, 'chain')}</span>
                              <span className="text-text-primary font-medium text-right">{tx(t, 'noChain')}</span>
                            </div>
                          </div>
                        )}

                        {/* Viewing details */}
                        {act.type === 'viewing' && (
                          <div className="text-[11px] text-text-secondary mt-0.5">
                            {act.data.viewingType === 'in_person' ? tx(t, 'inPerson') :
                             act.data.viewingType === 'online' ? tx(t, 'online') :
                             tx(t, 'openHouse')}
                            {act.data.scheduled_at && ` · ${formatDate(act.data.scheduled_at, locale)}`}
                            {act.data.feedback && (
                              <div className="mt-1 italic">{act.data.feedback}</div>
                            )}
                          </div>
                        )}

                        {/* Message body */}
                        {act.type === 'message' && (
                          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                            {act.data.body}
                          </p>
                        )}

                        {/* Meta line */}
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-muted">
                          {act.type === 'message' && act.data.channel && (
                            <>
                              {channelIcon(act.data.channel)}
                              <span>{channelLabel(act.data.channel, t)}</span>
                              <span>·</span>
                            </>
                          )}
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(act.timestamp, locale)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Counter-offer inline */}
                {counterMode && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="text-xs font-medium text-text-primary mb-2">{tx(t, 'counterOfferLabel')}</div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={e => setCounterAmount(e.target.value)}
                        placeholder={tx(t, 'counterPlaceholder')}
                        className="flex-1 bg-bg-soft border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                        autoFocus
                      />
                      <button
                        onClick={handleSubmitCounter}
                        disabled={!counterAmount.trim()}
                        className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {tx(t, 'send')}
                      </button>
                      <button
                        onClick={() => setCounterMode(false)}
                        className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-soft transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply composer */}
                {threadId && !counterMode && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="flex gap-2">
                      <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            handleSendReply()
                          }
                        }}
                        placeholder={tx(t, 'typeReply')}
                        rows={2}
                        className="flex-1 bg-bg-soft border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={sending || !replyText.trim()}
                        className="self-end px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{tx(t, 'sendHint')}</p>
                  </div>
                )}

                {/* Action bar */}
                {!counterMode && (
                  <div className="border-t border-border px-4 py-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleInstructSolicitor}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
                    >
                      <Gavel className="w-3.5 h-3.5" />{tx(t, 'instructSolicitor')}
                    </button>
                    <button
                      onClick={handleInvolveAgent}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-bg-soft transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />{tx(t, 'involveAgent')}
                    </button>
                    <button
                      onClick={handleRequestDeposit}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-bg-soft transition-colors"
                    >
                      <HandCoins className="w-3.5 h-3.5" />{tx(t, 'requestDeposit')}
                    </button>
                    {activeOffer && (
                      <button
                        onClick={handleCounterOffer}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-bg-soft transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />{tx(t, 'counterOffer')}
                      </button>
                    )}
                    {!threadId && (
                      <button
                        onClick={handleStartReply}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border text-text-primary hover:bg-bg-soft transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />{tx(t, 'reply')}
                      </button>
                    )}
                    {activeOffer && (
                      <button
                        onClick={() => handleOfferAction(activeOffer.data.offerId, 'declined')}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                        {tx(t, 'decline')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right sidebar: Buyer profile ── */}
              <div className="hidden xl:block border-l border-border overflow-y-auto p-3 text-xs">

                {/* Buyer profile */}
                {selectedContact?.hunterProfile && (
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">{tx(t, 'buyerProfile')}</div>
                    <div className="space-y-1">
                      {(selectedContact.hunterProfile.budgetMin || selectedContact.hunterProfile.budgetMax) && (
                        <div className="flex justify-between text-text-secondary">
                          <span>{tx(t, 'budget')}</span>
                          <span className="font-medium text-text-primary">
                            {selectedContact.hunterProfile.budgetMax
                              ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' }).format(selectedContact.hunterProfile.budgetMax)
                              : '—'}
                          </span>
                        </div>
                      )}
                      {selectedContact.hunterProfile.timeline && (
                        <div className="flex justify-between text-text-secondary">
                          <span>{tx(t, 'timeline')}</span>
                          <span className="font-medium text-text-primary">{selectedContact.hunterProfile.timeline}</span>
                        </div>
                      )}
                      {selectedContact.hunterProfile.intent && (
                        <div className="flex justify-between text-text-secondary">
                          <span>{tx(t, 'intent')}</span>
                          <span className="font-medium text-text-primary">
                            {selectedContact.hunterProfile.intent === 'buy' ? tx(t, 'intentBuy') :
                             selectedContact.hunterProfile.intent === 'rent' ? tx(t, 'intentRent') :
                             tx(t, 'intentBoth')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">{tx(t, 'documents')}</div>
                  <div className="space-y-1">
                    <DocItem
                      ok={selectedContact?.hunterProfile?.financeStatus === 'cash' || selectedContact?.hunterProfile?.mortgageVerified || false}
                      label={tx(t, 'proofOfFunds')}
                    />
                    <DocItem
                      ok={selectedContact?.hunterProfile?.identityVerified || false}
                      label={tx(t, 'idVerified')}
                    />
                    <DocItem
                      ok={selectedContact?.hunterProfile?.mortgageVerified || false}
                      label={tx(t, 'mortgageAip')}
                    />
                    <DocItem ok={false} label={tx(t, 'solicitorDetails')} />
                  </div>
                </div>

                {/* Sale checklist */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">{tx(t, 'saleChecklist')}</div>
                  <div className="space-y-1">
                    {checklistItems.map(item => (
                      <div key={item.key} className={`flex items-center gap-1.5 text-[11px] ${item.done ? 'text-emerald-600' : 'text-text-secondary'}`}>
                        {item.done
                          ? <CircleCheck className="w-3.5 h-3.5" />
                          : <CircleDashed className="w-3.5 h-3.5 text-text-muted" />
                        }
                        {tx(t, item.key)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Passport score */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">{tx(t, 'passportScore')}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${passportScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-emerald-600">{passportScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ────────────────────────────── */

function DocItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-emerald-600' : 'text-text-muted'}`}>
      {ok ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
      {label}
    </div>
  )
}
