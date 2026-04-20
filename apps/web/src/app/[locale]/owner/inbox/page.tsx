import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations, getLocale } from 'next-intl/server'
import { InboxWorkspace } from './inbox-workspace'

export default async function OwnerInboxPage() {
  const t = await getTranslations('comms')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all threads where this owner is a participant, with related data
  let rawThreads: Array<Record<string, unknown>> = []
  try {
    const { data } = await (supabase as any)
      .from('message_threads')
      .select(`
        id, subject, last_message_at, listing_id,
        thread_participants!inner(user_id),
        listing:listings(title_de, title_en, place_id)
      `)
      .eq('thread_participants.user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(50)

    rawThreads = data ?? []
  } catch (error) {
    console.error('Failed to fetch threads:', error)
  }

  // For each thread, fetch messages and identify the contact (non-owner participant)
  const threads = await Promise.all(
    rawThreads.map(async (thread: Record<string, unknown>) => {
      const threadId = thread.id as string
      const listing = thread.listing as Record<string, unknown> | null

      // Fetch all messages for this thread
      const { data: messagesData } = await (supabase as any)
        .from('messages')
        .select('id, body, channel, sent_at, sender_id')
        .eq('thread_id', threadId)
        .order('sent_at', { ascending: true })
        .limit(200)

      const messages = (messagesData ?? []) as Array<{
        id: string; body: string; channel: string; sent_at: string; sender_id: string | null
      }>

      // Find the other participant(s) — the contact
      const { data: participants } = await (supabase as any)
        .from('thread_participants')
        .select('user_id')
        .eq('thread_id', threadId)

      const contactUserId = (participants ?? [])
        .map((p: Record<string, unknown>) => p.user_id as string)
        .find((uid: string) => uid !== userId)

      // Fetch contact profile + hunter profile if available
      let contact = null
      if (contactUserId) {
        const { data: contactUser } = await (supabase as any)
          .from('users')
          .select('id, full_name, email, avatar_url, role')
          .eq('id', contactUserId)
          .maybeSingle()

        if (contactUser) {
          let hunterProfile = null
          // Try to fetch hunter profile for buyer intelligence
          const { data: hp } = await (supabase as any)
            .from('hunter_profiles')
            .select('budget_min, budget_max, intent, timeline, mortgage_verified, identity_verified, finance_status')
            .eq('user_id', contactUserId)
            .maybeSingle()

          if (hp) hunterProfile = hp

          contact = {
            id: contactUser.id,
            full_name: contactUser.full_name,
            email: contactUser.email,
            avatar_url: contactUser.avatar_url,
            role: contactUser.role === 'agent' ? 'agent' as const
              : hunterProfile ? 'hunter' as const
              : 'unknown' as const,
            hunter_profile: hunterProfile,
          }
        }
      }

      // Determine last message details
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null
      const hasOwnerReply = messages.some(m => m.sender_id === userId)

      const listingTitle = listing
        ? (locale === 'en'
          ? ((listing.title_en as string | null) ?? (listing.title_de as string | null))
          : (listing.title_de as string | null))
        : null

      return {
        id: threadId,
        subject: thread.subject as string | null,
        last_message_at: thread.last_message_at as string | null,
        listing_id: thread.listing_id as string | null,
        listing_title: listingTitle,
        listing_place_id: listing?.place_id as string | null ?? null,
        is_starred: false,
        is_archived: false,
        is_blocked: false,
        last_message_body: lastMsg?.body ?? null,
        last_message_channel: lastMsg?.channel ?? null,
        last_message_sender_id: lastMsg?.sender_id ?? null,
        contact,
        messages,
        has_owner_reply: hasOwnerReply,
      }
    })
  )

  // Build translations record for client component
  const keys = [
    'inbox', 'subtitle', 'noMessages', 'noMessagesDesc',
    'all', 'unread', 'starred', 'archived',
    'searchPlaceholder', 'you', 'justNow', 'minutesAgo', 'hoursAgo', 'daysAgo',
    'contactInfo', 'buyerProfile', 'noContactSelected', 'noContactSelectedDesc',
    'sourceWhatsApp', 'sourceEmail', 'sourceInApp', 'sourceSms',
    'mortgageApproved', 'cashBuyer', 'firstTimeBuyer', 'chainFree',
    'readyToMove', 'preApproved', 'budget', 'timeline', 'intent',
    'intentBuy', 'intentRent', 'intentBoth',
    'timelineAsap', 'timeline3m', 'timeline6m', 'timeline1y', 'timelineFlexible',
    'star', 'unstar', 'archive', 'unarchive', 'block', 'unblock',
    'reply', 'typeReply', 'send', 'sendHint', 'viewListing',
    'contactSince', 'lastActive', 'awaiting', 'replied',
    'agent', 'hunter', 'unknown', 'blockedLabel', 'archivedLabel', 'starredLabel',
  ] as const

  const translations: Record<string, string> = {}
  for (const key of keys) {
    translations[key] = t(key)
  }

  return (
    <InboxWorkspace
      threads={threads}
      userId={userId}
      locale={locale}
      translations={translations}
    />
  )
}
