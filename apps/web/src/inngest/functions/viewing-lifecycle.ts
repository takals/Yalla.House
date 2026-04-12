import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendViewingConfirmedEmail,
  sendViewingReminderEmail,
  sendViewingCheckInEmail,
} from '@/lib/resend'
import {
  sendViewingConfirmedWhatsApp,
  sendViewingReminderWhatsApp,
} from '@/lib/whatsapp'

// ─── Helper: look up user contact info ───────────────────────
async function getUserContact(userId: string) {
  const db = createServiceClient()
  const { data } = await (db.from('users') as any)
    .select('email, full_name, phone, language')
    .eq('id', userId)
    .single()
  return data as { email: string; full_name: string | null; phone: string | null; language: string | null } | null
}

// ─── Helper: create in-app notification ──────────────────────
async function notify(userId: string, title: string, body: string, actionUrl: string, sourceType: string, sourceId: string) {
  const db = createServiceClient()
  await (db as any).rpc('create_notification', {
    p_user_id: userId,
    p_title: title,
    p_body: body,
    p_action_url: actionUrl,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_actor_id: null,
  }).catch((e: any) => console.error('notification rpc error:', e))
}

// ═══════════════════════════════════════════════════════════════
// 1. VIEWING CONFIRMED → send confirmation + schedule reminders
// ═══════════════════════════════════════════════════════════════
export const viewingConfirmed = inngest.createFunction(
  { id: 'viewing-confirmed', name: 'Viewing Confirmed — Notify & Schedule Reminders' },
  { event: 'viewing/confirmed' },
  async ({ event, step }) => {
    const { viewingId, listingId, hunterId, ownerId, agentId, scheduledAt, listingTitle, listingCity } = event.data

    // Step 1: Send confirmation to hunter (email + WhatsApp)
    await step.run('confirm-hunter', async () => {
      const hunter = await getUserContact(hunterId)
      if (!hunter) return

      const locale = hunter.language === 'de-DE' ? 'de-DE' : 'en-GB'
      const countryCode = locale === 'de-DE' ? 'DE' : 'GB'

      await sendViewingConfirmedEmail({
        buyerEmail: hunter.email,
        buyerName: hunter.full_name,
        listingTitle,
        listingCity,
        countryCode,
        locale,
      }).catch(e => console.error('confirmed email to hunter:', e))

      if (hunter.phone) {
        await sendViewingConfirmedWhatsApp({
          buyerPhone: hunter.phone,
          buyerName: hunter.full_name,
          listingTitle,
        }).catch(e => console.error('confirmed whatsapp to hunter:', e))
      }

      // In-app notification
      await notify(
        hunterId,
        'Viewing Confirmed',
        `Your viewing at ${listingTitle} has been confirmed for ${new Date(scheduledAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`,
        `/hunter`,
        'viewing',
        viewingId,
      )
    })

    // Step 2: Notify owner that viewing was confirmed
    await step.run('notify-owner', async () => {
      await notify(
        ownerId,
        'Viewing Confirmed',
        `A viewing for ${listingTitle} has been confirmed`,
        '/owner/viewings',
        'viewing',
        viewingId,
      )
    })

    // Step 3: Notify agent if assigned
    if (agentId) {
      await step.run('notify-agent', async () => {
        await notify(
          agentId!,
          'Viewing Confirmed',
          `Viewing for ${listingTitle} confirmed — check your calendar`,
          '/agent/calendar',
          'viewing',
          viewingId,
        )
      })
    }

    // Step 4: Schedule 24h reminder
    const viewingTime = new Date(scheduledAt)
    const reminder24h = new Date(viewingTime.getTime() - 24 * 60 * 60 * 1000)
    const now = new Date()

    if (reminder24h > now) {
      await step.sleepUntil('wait-24h-reminder', reminder24h)
      await step.sendEvent('send-24h-reminder', {
        name: 'viewing/reminder.24h',
        data: { viewingId, hunterId, ownerId, agentId, scheduledAt, listingTitle, listingCity },
      })
    }

    // Step 5: Schedule 1h reminder
    const reminder1h = new Date(viewingTime.getTime() - 60 * 60 * 1000)
    if (reminder1h > now) {
      await step.sleepUntil('wait-1h-reminder', reminder1h)
      await step.sendEvent('send-1h-reminder', {
        name: 'viewing/reminder.1h',
        data: { viewingId, hunterId, ownerId, agentId, scheduledAt, listingTitle, listingCity },
      })
    }

    // Step 6: Schedule check-in request (15 min after viewing)
    const checkInTime = new Date(viewingTime.getTime() + 15 * 60 * 1000)
    if (checkInTime > now) {
      await step.sleepUntil('wait-checkin', checkInTime)
      await step.sendEvent('send-checkin', {
        name: 'viewing/checkin.requested',
        data: { viewingId, hunterId, listingTitle },
      })
    }
  }
)

// ═══════════════════════════════════════════════════════════════
// 2. 24H REMINDER
// ═══════════════════════════════════════════════════════════════
export const viewing24hReminder = inngest.createFunction(
  { id: 'viewing-reminder-24h', name: 'Viewing Reminder — 24 Hours Before' },
  { event: 'viewing/reminder.24h' },
  async ({ event, step }) => {
    const { viewingId, hunterId, ownerId, agentId, scheduledAt, listingTitle, listingCity } = event.data

    // Check viewing is still confirmed (not cancelled)
    const stillValid = await step.run('check-status', async () => {
      const db = createServiceClient()
      const { data } = await (db.from('viewings') as any)
        .select('status')
        .eq('id', viewingId)
        .single()
      return data?.status === 'confirmed'
    })

    if (!stillValid) return

    // Send reminder to hunter
    await step.run('remind-hunter', async () => {
      const hunter = await getUserContact(hunterId)
      if (!hunter) return

      const locale = hunter.language === 'de-DE' ? 'de-DE' : 'en-GB'
      const countryCode = locale === 'de-DE' ? 'DE' : 'GB'

      await sendViewingReminderEmail({
        recipientEmail: hunter.email,
        recipientName: hunter.full_name,
        listingTitle,
        listingCity,
        scheduledAt,
        role: 'hunter',
        countryCode,
        locale,
      }).catch(e => console.error('24h reminder email to hunter:', e))

      if (hunter.phone) {
        await sendViewingReminderWhatsApp({
          recipientPhone: hunter.phone,
          recipientName: hunter.full_name,
          listingTitle,
          scheduledAt,
        }).catch(e => console.error('24h reminder whatsapp to hunter:', e))
      }

      await notify(
        hunterId,
        'Viewing Tomorrow',
        `Reminder: your viewing at ${listingTitle} is tomorrow`,
        '/hunter',
        'viewing',
        viewingId,
      )
    })

    // Remind owner
    await step.run('remind-owner', async () => {
      const owner = await getUserContact(ownerId)
      if (!owner) return

      await sendViewingReminderEmail({
        recipientEmail: owner.email,
        recipientName: owner.full_name,
        listingTitle,
        listingCity,
        scheduledAt,
        role: 'owner',
        countryCode: owner.language === 'de-DE' ? 'DE' : 'GB',
        locale: owner.language === 'de-DE' ? 'de-DE' : 'en-GB',
      }).catch(e => console.error('24h reminder email to owner:', e))

      await notify(
        ownerId,
        'Viewing Tomorrow',
        `Reminder: a viewing for ${listingTitle} is scheduled for tomorrow`,
        '/owner/viewings',
        'viewing',
        viewingId,
      )
    })

    // Remind agent if assigned
    if (agentId) {
      await step.run('remind-agent', async () => {
        await notify(
          agentId!,
          'Viewing Tomorrow',
          `Reminder: viewing for ${listingTitle} is tomorrow — prepare your notes`,
          '/agent/calendar',
          'viewing',
          viewingId,
        )
      })
    }
  }
)

// ═══════════════════════════════════════════════════════════════
// 3. 1H REMINDER
// ═══════════════════════════════════════════════════════════════
export const viewing1hReminder = inngest.createFunction(
  { id: 'viewing-reminder-1h', name: 'Viewing Reminder — 1 Hour Before' },
  { event: 'viewing/reminder.1h' },
  async ({ event, step }) => {
    const { viewingId, hunterId, agentId, listingTitle } = event.data

    // Check still valid
    const stillValid = await step.run('check-status', async () => {
      const db = createServiceClient()
      const { data } = await (db.from('viewings') as any)
        .select('status')
        .eq('id', viewingId)
        .single()
      return data?.status === 'confirmed'
    })

    if (!stillValid) return

    // Short reminder to hunter — just in-app + WhatsApp
    await step.run('remind-hunter-1h', async () => {
      const hunter = await getUserContact(hunterId)
      if (!hunter) return

      await notify(
        hunterId,
        'Viewing in 1 Hour',
        `Your viewing at ${listingTitle} starts in 1 hour`,
        '/hunter',
        'viewing',
        viewingId,
      )

      if (hunter.phone) {
        await sendViewingReminderWhatsApp({
          recipientPhone: hunter.phone,
          recipientName: hunter.full_name,
          listingTitle,
          scheduledAt: event.data.scheduledAt,
        }).catch(e => console.error('1h reminder whatsapp:', e))
      }
    })

    // Agent 1h reminder
    if (agentId) {
      await step.run('remind-agent-1h', async () => {
        await notify(
          agentId!,
          'Viewing in 1 Hour',
          `Viewing for ${listingTitle} starts in 1 hour`,
          '/agent/calendar',
          'viewing',
          viewingId,
        )
      })
    }
  }
)

// ═══════════════════════════════════════════════════════════════
// 4. CHECK-IN REQUEST — after viewing, ask hunter to confirm attendance
// ═══════════════════════════════════════════════════════════════
export const viewingCheckIn = inngest.createFunction(
  { id: 'viewing-checkin', name: 'Viewing Check-In — Post-Viewing Follow-Up' },
  { event: 'viewing/checkin.requested' },
  async ({ event, step }) => {
    const { viewingId, hunterId, listingTitle } = event.data

    await step.run('send-checkin', async () => {
      const hunter = await getUserContact(hunterId)
      if (!hunter) return

      const locale = hunter.language === 'de-DE' ? 'de-DE' : 'en-GB'

      await sendViewingCheckInEmail({
        hunterEmail: hunter.email,
        hunterName: hunter.full_name,
        listingTitle,
        viewingId,
        locale,
      }).catch(e => console.error('check-in email error:', e))

      await notify(
        hunterId,
        'How was the viewing?',
        `Let us know how your viewing at ${listingTitle} went`,
        `/hunter/viewings/${viewingId}/feedback`,
        'viewing',
        viewingId,
      )
    })
  }
)

// ═══════════════════════════════════════════════════════════════
// 5. VIEWING COMPLETED — update status, notify all parties
// ═══════════════════════════════════════════════════════════════
export const viewingCompleted = inngest.createFunction(
  { id: 'viewing-completed', name: 'Viewing Completed — Update & Notify' },
  { event: 'viewing/completed' },
  async ({ event, step }) => {
    const { viewingId, hunterId, ownerId, agentId, listingTitle } = event.data

    // Mark as completed
    await step.run('mark-completed', async () => {
      const db = createServiceClient()
      await (db.from('viewings') as any)
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', viewingId)
    })

    // Notify owner
    await step.run('notify-owner-completed', async () => {
      await notify(
        ownerId,
        'Viewing Completed',
        `The viewing for ${listingTitle} has been completed`,
        '/owner/viewings',
        'viewing',
        viewingId,
      )
    })

    // Notify agent
    if (agentId) {
      await step.run('notify-agent-completed', async () => {
        await notify(
          agentId!,
          'Viewing Completed',
          `Viewing for ${listingTitle} marked as completed`,
          '/agent/calendar',
          'viewing',
          viewingId,
        )
      })
    }
  }
)
