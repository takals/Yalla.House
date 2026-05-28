import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import { DealsClient } from './deals-client'
import { OwnerDemoContent } from '@/components/owner-demo-content'
import { DashboardHintBanner } from '@/components/dashboard-hint-banner'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerDeals')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function OwnerDealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('ownerDeals')
  const tH = await getTranslations('actionHints')
  const td = await getTranslations('ownerDemo')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  /* ── Guest → demo ─────────────────────────── */
  if (!userId) {
    const demoKeys = [
      'demoBadge', 'offersHint',
      'demoTitle1', 'statusPending',
      'offerAmount1', 'offerAmount2',
      'offerCondition1', 'offerCondition2',
      'offerAccept', 'offerCounter', 'offerDecline',
    ] as const
    const demoT: Record<string, string> = {}
    for (const key of demoKeys) { try { demoT[key] = td(key) } catch { demoT[key] = '' } }

    return (
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-1">{t('pageTitle')}</h1>
          <p className="text-text-secondary text-sm">{t('subtitle')}</p>
        </div>
        <OwnerDemoContent section="offers" t={demoT} />
      </div>
    )
  }

  /* ── Fetch owner's listings ─────────────────── */
  const { data: listings } = await (supabase.from('listings') as any)
    .select('id, title, title_de, city, postcode, country_code, place_id, slug')
    .eq('owner_id', userId)

  const listingIds = ((listings as any[]) ?? []).map((l: any) => l.id)
  const listingsMap: Record<string, { title: string; title_de: string; city: string; postcode: string; placeId: string; slug: string | null }> = {}
  for (const l of (listings ?? []) as any[]) {
    listingsMap[l.id] = { title: l.title, title_de: l.title_de, city: l.city, postcode: l.postcode, placeId: l.place_id, slug: l.slug ?? null }
  }

  /* ── Parallel fetch: offers + viewings + threads ── */
  const [offersResult, viewingsResult, threadsResult] = await Promise.all([
    listingIds.length > 0
      ? (supabase.from('offers') as any)
          .select('*')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    listingIds.length > 0
      ? (supabase.from('viewings') as any)
          .select('id, listing_id, status, type, scheduled_at, hunter_notes, created_at, hunter_id, video_room_url, feedback_hunter, feedback_owner')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    (supabase as any)
      .from('message_threads')
      .select(`id, subject, last_message_at, listing_id, thread_participants!inner(user_id)`)
      .eq('thread_participants.user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(50),
  ])

  const offers = (offersResult.data ?? []) as any[]
  const viewings = (viewingsResult.data ?? []) as any[]
  const rawThreads = (threadsResult.data ?? []) as any[]

  /* ── Collect all contact user IDs ──────────── */
  const contactIds = new Set<string>()
  for (const o of offers) { if (o.hunter_id) contactIds.add(o.hunter_id) }
  for (const v of viewings) { if (v.hunter_id) contactIds.add(v.hunter_id) }

  // For threads, find non-owner participants
  const threadContactMap: Record<string, string> = {} // threadId → contactUserId
  for (const th of rawThreads) {
    const participants = (th.thread_participants ?? []) as any[]
    const contactId = participants.map((p: any) => p.user_id).find((uid: string) => uid !== userId)
    if (contactId) {
      threadContactMap[th.id] = contactId
      contactIds.add(contactId)
    }
  }

  /* ── Fetch all contact profiles + hunter profiles ── */
  const contactIdsArr = [...contactIds]
  const [usersResult, hunterProfilesResult] = await Promise.all([
    contactIdsArr.length > 0
      ? (supabase.from('users') as any).select('id, full_name, email, avatar_url, role').in('id', contactIdsArr)
      : Promise.resolve({ data: [] }),
    contactIdsArr.length > 0
      ? (supabase.from('hunter_profiles') as any)
          .select('user_id, budget_min, budget_max, intent, timeline, mortgage_verified, identity_verified, finance_status, buyer_status, verification_tier')
          .in('user_id', contactIdsArr)
      : Promise.resolve({ data: [] }),
  ])

  const usersMap: Record<string, any> = {}
  for (const u of ((usersResult.data ?? []) as any[])) { usersMap[u.id] = u }

  const hunterProfilesMap: Record<string, any> = {}
  for (const hp of ((hunterProfilesResult.data ?? []) as any[])) { hunterProfilesMap[hp.user_id] = hp }

  /* ── Fetch messages for each thread ───────── */
  const threadMessages: Record<string, any[]> = {}
  if (rawThreads.length > 0) {
    const threadIds = rawThreads.map((th: any) => th.id)
    const { data: allMessages } = await (supabase as any)
      .from('messages')
      .select('id, thread_id, body, channel, sent_at, sender_id')
      .in('thread_id', threadIds)
      .order('sent_at', { ascending: true })
      .limit(500)

    for (const msg of ((allMessages ?? []) as any[])) {
      if (!threadMessages[msg.thread_id]) threadMessages[msg.thread_id] = []
      threadMessages[msg.thread_id]!.push(msg)
    }
  }

  /* ── Build unified activity items per contact ── */
  interface ActivityItem {
    id: string
    type: 'offer' | 'viewing' | 'message'
    contactId: string
    listingId: string | null
    timestamp: string
    data: any
  }

  const activities: ActivityItem[] = []

  // Offers → activities
  for (const o of offers) {
    activities.push({
      id: `offer-${o.id}`,
      type: 'offer',
      contactId: o.hunter_id ?? '',
      listingId: o.listing_id,
      timestamp: o.created_at,
      data: {
        offerId: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        conditions: o.conditions,
        finance_status: o.finance_status,
        move_in_date: o.move_in_date,
        message: o.message,
        type: o.type,
      },
    })
  }

  // Viewings → activities
  for (const v of viewings) {
    activities.push({
      id: `viewing-${v.id}`,
      type: 'viewing',
      contactId: v.hunter_id ?? '',
      listingId: v.listing_id,
      timestamp: v.scheduled_at ?? v.created_at,
      data: {
        viewingId: v.id,
        status: v.status,
        viewingType: v.type,
        scheduled_at: v.scheduled_at,
        hunter_notes: v.hunter_notes,
        video_room_url: v.video_room_url,
        feedback: v.feedback_hunter,
      },
    })
  }

  // Threads → message activities (each message is an activity)
  for (const th of rawThreads) {
    const contactId = threadContactMap[th.id] ?? ''
    const msgs = threadMessages[th.id] ?? []

    for (const msg of msgs) {
      activities.push({
        id: `msg-${msg.id}`,
        type: 'message',
        contactId: contactId || msg.sender_id || '',
        listingId: th.listing_id,
        timestamp: msg.sent_at,
        data: {
          threadId: th.id,
          messageId: msg.id,
          body: msg.body,
          channel: msg.channel,
          senderId: msg.sender_id,
          isOwner: msg.sender_id === userId,
        },
      })
    }
  }

  // Sort all activities by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  /* ── Build contacts list ──────────────────── */
  interface DealContact {
    id: string
    name: string
    email: string | null
    role: 'hunter' | 'agent' | 'unknown'
    verificationTier: 'none' | 'self_declared' | 'basic' | 'full'
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

  const contacts: Record<string, DealContact> = {}
  for (const cid of contactIdsArr) {
    const u = usersMap[cid]
    const hp = hunterProfilesMap[cid]
    // Only include contacts with a real name or email — skip anonymous/unknown
    const displayName = u?.full_name || u?.email
    if (!displayName) continue
    contacts[cid] = {
      id: cid,
      name: displayName,
      email: u?.email ?? null,
      role: u?.role === 'agent' ? 'agent' : hp ? 'hunter' : 'unknown',
      verificationTier: (hp?.verification_tier as 'none' | 'self_declared' | 'basic' | 'full') ?? 'none',
      hunterProfile: hp ? {
        budgetMin: hp.budget_min,
        budgetMax: hp.budget_max,
        intent: hp.intent,
        timeline: hp.timeline,
        mortgageVerified: hp.mortgage_verified ?? false,
        identityVerified: hp.identity_verified ?? false,
        financeStatus: hp.finance_status,
        buyerStatus: hp.buyer_status,
      } : null,
    }
  }

  /* ── Build translations ────────────────────── */
  const tKeys = [
    'pageTitle', 'subtitle',
    'tabAll', 'tabOffers', 'tabViewings', 'tabMessages',
    'ownerEmailLabel', 'aliasLabel', 'aliasHint', 'viaWhatsApp', 'viaEmail', 'viaInApp', 'channelConnected', 'channelNotConnected',
    'noActivity', 'noActivityDesc',
    // Timeline labels
    'offerSubmitted', 'viewingScheduled', 'viewingCompleted', 'viewingConfirmed',
    'viewingCancelled', 'messageSent', 'messageReceived', 'youReplied',
    // Offer card
    'conditions', 'finance', 'moveIn', 'chain', 'noChain', 'noConditions',
    'financeCash', 'financeMortgageApproved', 'financeMortgagePending',
    // Buyer profile
    'buyerProfile', 'budget', 'timeline', 'buyerType', 'intent', 'chainStatus',
    'intentBuy', 'intentRent', 'intentBoth',
    'timelineAsap', 'timeline3m', 'timeline6m', 'timeline1y', 'timelineFlexible',
    'firstTimeBuyer', 'cashBuyer', 'mortgageApproved', 'chainFree',
    // Documents
    'documents', 'proofOfFunds', 'idVerified', 'mortgageAip', 'solicitorDetails',
    'uploaded', 'missing',
    // Sale checklist
    'saleChecklist', 'checkListingLive', 'checkViewings', 'checkOfferReceived',
    'checkInstructSolicitor', 'checkBuyerSolicitor', 'checkMemorandum',
    'checkSearchesSurveys', 'checkExchange', 'checkCompletion',
    // Passport score
    'passportScore', 'passportMissing',
    // Actions
    'instructSolicitor', 'involveAgent', 'requestDeposit', 'counterOffer',
    'reply', 'decline',
    // Time
    'justNow', 'minutesAgo', 'hoursAgo', 'daysAgo',
    // Viewing types
    'inPerson', 'online', 'openHouse',
    // Viewing status
    'statusPending', 'statusConfirmed', 'statusCancelled', 'statusCompleted',
    // Reply
    'typeReply', 'send', 'sendHint',
    // Demo + toast
    'demoToast', 'demoBanner', 'exampleLabel',
    'solicitorToast', 'depositToast', 'noThreadToast',
    'demoSolicitor', 'demoAgent', 'demoDeposit', 'demoCounterSent',
    'demoReplySent', 'demoReplyHint', 'demoOfferAccepted', 'demoOfferDeclined',
    'counterOfferLabel', 'counterPlaceholder', 'counterSent',
    'replySent', 'offerAccepted', 'offerDeclined',
    // Contact header
    'roleHomeHunter', 'roleAgent',
    'status_chain_free', 'status_first_time_buyer', 'status_cash_buyer',
    'status_mortgage_in_principle', 'status_in_chain', 'status_selling_to_buy',
    'status_exploring',
    // Tags
    'tagFilterAll', 'tagFilterLabel', 'addTag',
    'tagSerious', 'tagHotLead', 'tagNeedsMortgage',
    'tagTimeWaster', 'tagFollowUp', 'tagCashBuyer',
    'demoTagged',
    // Listing links
    'viewListingFaqs', 'viewListing',
    // Verification
    'verificationSelfDeclared', 'verificationBasic', 'verificationFull', 'verificationNone',
  ] as const

  const translations: Record<string, string> = {}
  for (const key of tKeys) {
    try { translations[key] = t(key) } catch { translations[key] = '' }
  }

  /* ── Hans Wurst demo data ────────────────────── */
  const DEMO_CONTACT_ID = '__demo_hans_wurst__'
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

  const demoContacts: Record<string, typeof contacts[string]> = {
    [DEMO_CONTACT_ID]: {
      id: DEMO_CONTACT_ID,
      name: 'Hans Wurst',
      email: 'hans.wurst@beispiel.de',
      role: 'hunter',
      verificationTier: 'self_declared',
      hunterProfile: {
        budgetMin: 350000,
        budgetMax: 450000,
        intent: 'buy',
        timeline: 'asap',
        mortgageVerified: false,
        identityVerified: true,
        financeStatus: 'cash',
        buyerStatus: 'chain_free',
      },
    },
  }

  const demoActivities: typeof activities = [
    {
      id: 'demo-offer-1',
      type: 'offer',
      contactId: DEMO_CONTACT_ID,
      listingId: listingIds[0] ?? null,
      timestamp: daysAgo(2),
      data: {
        offerId: 'demo-offer-id',
        amount: 395000,
        currency: 'EUR',
        status: 'submitted',
        conditions: null,
        finance_status: 'cash',
        move_in_date: daysAgo(-60),
        message: null,
        type: 'full_price',
      },
    },
    {
      id: 'demo-viewing-1',
      type: 'viewing',
      contactId: DEMO_CONTACT_ID,
      listingId: listingIds[0] ?? null,
      timestamp: daysAgo(5),
      data: {
        viewingId: 'demo-viewing-id',
        status: 'completed',
        viewingType: 'in_person',
        scheduled_at: daysAgo(5),
        hunter_notes: null,
        video_room_url: null,
        feedback: null,
      },
    },
    {
      id: 'demo-msg-1',
      type: 'message',
      contactId: DEMO_CONTACT_ID,
      listingId: listingIds[0] ?? null,
      timestamp: daysAgo(7),
      data: {
        threadId: 'demo-thread-id',
        messageId: 'demo-msg-id-1',
        body: locale === 'en'
          ? 'Hi, I saw your property on the portal. Is a viewing this weekend possible?'
          : 'Hallo, ich habe Ihre Immobilie im Portal gesehen. Ist eine Besichtigung am Wochenende möglich?',
        channel: 'in_app',
        senderId: DEMO_CONTACT_ID,
        isOwner: false,
      },
    },
  ]

  return (
    <div className="max-w-6xl">
      <DashboardHintBanner
        pageKey="owner-deals"
        title={tH('dealsTitle')}
        hints={[tH('dealsHint1'), tH('dealsHint2'), tH('dealsHint3')]}
        dismissLabel={tH('dismiss')}
      />
      <DealsClient
        activities={activities}
        contacts={contacts}
        listings={listingsMap}
        userId={userId}
        locale={locale}
        t={translations}
        demoActivities={demoActivities}
        demoContacts={demoContacts}
      />
    </div>
  )
}
