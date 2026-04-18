/**
 * Shared notification dispatch logic
 *
 * Called by Inngest functions to fan out notifications across
 * email, SMS, and WhatsApp based on user preferences.
 */

import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio'

// ── Lazy Resend init (same pattern as resend.ts) ────────────────────────────

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env['RESEND_API_KEY'] ?? 'placeholder')
  }
  return _resend
}

const EMAIL_FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Yalla.House <noreply@yalla.house>'

// ── WhatsApp via 360dialog (inline to avoid importing unexported fn) ────────

const WA_API_KEY = process.env['WHATSAPP_API_KEY']
const WA_BASE_URL = 'https://waba.360dialog.io/v1/messages'

async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<{ messageId: string } | null> {
  if (!WA_API_KEY || WA_API_KEY === 'your-360dialog-api-key') {
    console.warn('WhatsApp: WHATSAPP_API_KEY not configured — skipping')
    return null
  }

  const phone = to.replace(/\D/g, '')
  if (phone.length < 7) {
    console.warn('WhatsApp: invalid phone number — skipping')
    return null
  }

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'de' },
      components: [
        {
          type: 'body',
          parameters: params.map((text) => ({ type: 'text', text })),
        },
      ],
    },
  }

  const res = await fetch(WA_BASE_URL, {
    method: 'POST',
    headers: {
      'D360-API-KEY': WA_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`360dialog ${res.status}: ${text}`)
  }

  const json = (await res.json()) as { messages?: Array<{ id: string }> }
  const messageId = json.messages?.[0]?.id ?? 'unknown'
  return { messageId }
}

// ── Preferences ─────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}

export async function checkPreferences(userId: string): Promise<NotificationPreferences> {
  const db = createServiceClient()

  const { data, error } = await (db.from('notification_preferences') as unknown as {
    select: (columns: string) => {
      eq: (col: string, val: string) => {
        single: () => Promise<{
          data: {
            email_enabled: boolean
            sms_enabled: boolean
            whatsapp_enabled: boolean
            quiet_hours_start: string | null
            quiet_hours_end: string | null
          } | null
          error: unknown
        }>
      }
    }
  })
    .select('email_enabled, sms_enabled, whatsapp_enabled, quiet_hours_start, quiet_hours_end')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Default: all channels enabled, no quiet hours
    return {
      emailEnabled: true,
      smsEnabled: true,
      whatsappEnabled: true,
      quietHoursStart: null,
      quietHoursEnd: null,
    }
  }

  return {
    emailEnabled: data.email_enabled ?? true,
    smsEnabled: data.sms_enabled ?? true,
    whatsappEnabled: data.whatsapp_enabled ?? true,
    quietHoursStart: data.quiet_hours_start ?? null,
    quietHoursEnd: data.quiet_hours_end ?? null,
  }
}

// ── Notification log ────────────────────────────────────────────────────────

async function logNotification(opts: {
  userId: string
  viewingId?: string
  listingId?: string
  channel: 'email' | 'sms' | 'whatsapp'
  eventType: string
  status: 'sent' | 'failed'
  providerId?: string
  errorDetail?: string
}): Promise<void> {
  try {
    const db = createServiceClient()

    await (db.from('notification_log') as unknown as {
      insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>
    }).insert({
      user_id: opts.userId,
      viewing_id: opts.viewingId ?? null,
      listing_id: opts.listingId ?? null,
      channel: opts.channel,
      event_type: opts.eventType,
      status: opts.status,
      provider_id: opts.providerId ?? null,
      error_detail: opts.errorDetail ?? null,
      sent_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to log notification:', err)
  }
}

// ── Main dispatch ───────────────────────────────────────────────────────────

export async function dispatchNotification(opts: {
  userId: string
  eventType: string
  listingId?: string
  viewingId?: string
  channels: {
    email?: { to: string; subject: string; html: string }
    sms?: { to: string; body: string }
    whatsapp?: { to: string; templateName: string; params: string[] }
  }
}): Promise<void> {
  const prefs = await checkPreferences(opts.userId)

  const promises: Promise<void>[] = []

  // ── Email ───────────────────────────────────────────────────────────────
  if (opts.channels.email && prefs.emailEnabled) {
    promises.push(
      (async () => {
        try {
          const result = await getResend().emails.send({
            from: EMAIL_FROM,
            to: opts.channels.email!.to,
            subject: opts.channels.email!.subject,
            html: opts.channels.email!.html,
          })

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'email',
            eventType: opts.eventType,
            status: 'sent',
            providerId: result.data?.id ?? undefined,
          })
        } catch (err) {
          const detail = err instanceof Error ? err.message : 'Unknown email error'
          console.error('dispatchNotification email failed:', detail)

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'email',
            eventType: opts.eventType,
            status: 'failed',
            errorDetail: detail,
          })
        }
      })()
    )
  }

  // ── SMS ─────────────────────────────────────────────────────────────────
  if (opts.channels.sms && prefs.smsEnabled) {
    promises.push(
      (async () => {
        try {
          const result = await sendSms({
            to: opts.channels.sms!.to,
            body: opts.channels.sms!.body,
          })

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'sms',
            eventType: opts.eventType,
            status: 'sent',
            providerId: result?.sid ?? undefined,
          })
        } catch (err) {
          const detail = err instanceof Error ? err.message : 'Unknown SMS error'
          console.error('dispatchNotification sms failed:', detail)

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'sms',
            eventType: opts.eventType,
            status: 'failed',
            errorDetail: detail,
          })
        }
      })()
    )
  }

  // ── WhatsApp ────────────────────────────────────────────────────────────
  if (opts.channels.whatsapp && prefs.whatsappEnabled) {
    promises.push(
      (async () => {
        try {
          const result = await sendWhatsAppTemplate(
            opts.channels.whatsapp!.to,
            opts.channels.whatsapp!.templateName,
            opts.channels.whatsapp!.params
          )

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'whatsapp',
            eventType: opts.eventType,
            status: 'sent',
            providerId: result?.messageId ?? undefined,
          })
        } catch (err) {
          const detail = err instanceof Error ? err.message : 'Unknown WhatsApp error'
          console.error('dispatchNotification whatsapp failed:', detail)

          await logNotification({
            userId: opts.userId,
            viewingId: opts.viewingId,
            listingId: opts.listingId,
            channel: 'whatsapp',
            eventType: opts.eventType,
            status: 'failed',
            errorDetail: detail,
          })
        }
      })()
    )
  }

  await Promise.allSettled(promises)
}
