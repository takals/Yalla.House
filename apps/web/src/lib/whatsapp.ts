/**
 * WhatsApp notifications via 360dialog
 *
 * All outbound messages use pre-approved WhatsApp message templates.
 * Templates must be registered at: https://hub.360dialog.com
 *
 * Required templates (language: de):
 *   1. yalla_new_viewing_request  — params: {{1}} ownerName, {{2}} listingTitle, {{3}} buyerName, {{4}} buyerPhone
 *   2. yalla_viewing_confirmed    — params: {{1}} buyerName, {{2}} listingTitle
 *   3. yalla_viewing_declined     — params: {{1}} buyerName, {{2}} listingTitle
 *   4. yalla_viewing_day_of       — params: {{1}} buyerName, {{2}} listingTitle, {{3}} time, {{4}} address
 *   5. yalla_viewing_follow_up    — params: {{1}} buyerName, {{2}} listingTitle
 *   6. yalla_viewing_reminder     — params: {{1}} recipientName, {{2}} listingTitle, {{3}} scheduledDate
 */

const API_KEY = process.env['WHATSAPP_API_KEY']
const PHONE_ID = process.env['WHATSAPP_PHONE_ID']
const BASE_URL = 'https://waba.360dialog.io/v1/messages'

/** Strip all non-digits. 360dialog expects numbers without leading + */
function normalisePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

async function sendTemplate(
  to: string,
  templateName: string,
  parameters: string[]
): Promise<void> {
  if (!API_KEY || API_KEY === 'your-360dialog-api-key') {
    console.warn('WhatsApp: WHATSAPP_API_KEY not configured — skipping')
    return
  }
  if (!PHONE_ID || PHONE_ID === 'your-phone-number-id') {
    console.warn('WhatsApp: WHATSAPP_PHONE_ID not configured — skipping')
    return
  }

  const phone = normalisePhone(to)
  if (phone.length < 7) {
    console.warn('WhatsApp: invalid phone number — skipping')
    return
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
          parameters: parameters.map(text => ({ type: 'text', text })),
        },
      ],
    },
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'D360-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`360dialog ${res.status}: ${text}`)
  }
}

// ── Notification 1: New viewing request → owner ───────────────────────────────

export async function sendViewingRequestWhatsApp(opts: {
  ownerPhone: string
  ownerName: string | null
  listingTitle: string
  buyerName: string
  buyerPhone: string | null
}): Promise<void> {
  try {
    await sendTemplate(opts.ownerPhone, 'yalla_new_viewing_request', [
      opts.ownerName?.split(' ')[0] ?? 'Eigentümer',
      opts.listingTitle,
      opts.buyerName,
      opts.buyerPhone ?? '—',
    ])
  } catch (err) {
    console.error('sendViewingRequestWhatsApp failed:', err)
  }
}

// ── Notification 2: Viewing confirmed → buyer ─────────────────────────────────

export async function sendViewingConfirmedWhatsApp(opts: {
  buyerPhone: string
  buyerName: string | null
  listingTitle: string
}): Promise<void> {
  try {
    await sendTemplate(opts.buyerPhone, 'yalla_viewing_confirmed', [
      opts.buyerName?.split(' ')[0] ?? 'Interessent',
      opts.listingTitle,
    ])
  } catch (err) {
    console.error('sendViewingConfirmedWhatsApp failed:', err)
  }
}

// ── Notification 3: Viewing declined → buyer ──────────────────────────────────

export async function sendViewingDeclinedWhatsApp(opts: {
  buyerPhone: string
  buyerName: string | null
  listingTitle: string
}): Promise<void> {
  try {
    await sendTemplate(opts.buyerPhone, 'yalla_viewing_declined', [
      opts.buyerName?.split(' ')[0] ?? 'Interessent',
      opts.listingTitle,
    ])
  } catch (err) {
    console.error('sendViewingDeclinedWhatsApp failed:', err)
  }
}

// ── Notification 4: Day-of address → hunter ──────────────────────────────────

export async function sendViewingDayOfWhatsApp(opts: {
  buyerPhone: string
  buyerName: string | null
  listingTitle: string
  address: string
  scheduledTime: string
}): Promise<void> {
  try {
    const time = new Date(opts.scheduledTime).toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit',
    })
    await sendTemplate(opts.buyerPhone, 'yalla_viewing_day_of', [
      opts.buyerName?.split(' ')[0] ?? 'Interessent',
      opts.listingTitle,
      time,
      opts.address,
    ])
  } catch (err) {
    console.error('sendViewingDayOfWhatsApp failed:', err)
  }
}

// ── Notification 5: Follow-up feedback → hunter ──────────────────────────────

export async function sendViewingFollowUpWhatsApp(opts: {
  buyerPhone: string
  buyerName: string | null
  listingTitle: string
}): Promise<void> {
  try {
    await sendTemplate(opts.buyerPhone, 'yalla_viewing_follow_up', [
      opts.buyerName?.split(' ')[0] ?? 'Interessent',
      opts.listingTitle,
    ])
  } catch (err) {
    console.error('sendViewingFollowUpWhatsApp failed:', err)
  }
}

// ── Notification 6: Viewing reminder → hunter/owner ──────────────────────────

export async function sendViewingReminderWhatsApp(opts: {
  recipientPhone: string
  recipientName: string | null
  listingTitle: string
  scheduledAt: string
}): Promise<void> {
  try {
    const date = new Date(opts.scheduledAt).toLocaleDateString('de-DE', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
    await sendTemplate(opts.recipientPhone, 'yalla_viewing_reminder', [
      opts.recipientName?.split(' ')[0] ?? 'Interessent',
      opts.listingTitle,
      date,
    ])
  } catch (err) {
    console.error('sendViewingReminderWhatsApp failed:', err)
  }
}
