import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'

/**
 * Twilio SMS — inbound webhook validation + outbound SMS via raw fetch (no SDK)
 *
 * Required env vars for outbound SMS:
 *   TWILIO_ACCOUNT_SID   — Twilio Account SID
 *   TWILIO_AUTH_TOKEN     — Twilio Auth Token
 *   TWILIO_PHONE_NUMBER   — Twilio sender phone number (E.164)
 */

const ACCOUNT_SID = process.env['TWILIO_ACCOUNT_SID']
const AUTH_TOKEN = process.env['TWILIO_AUTH_TOKEN']
const FROM_NUMBER = process.env['TWILIO_PHONE_NUMBER']

// ── Webhook signature validation ────────────────────────────────────────────

/**
 * Validates that an inbound webhook request genuinely came from Twilio.
 * Uses HMAC-SHA1 over (URL + sorted POST params) signed with TWILIO_AUTH_TOKEN.
 * Returns true in development (no auth token set) so local testing works without Twilio.
 */
export function validateTwilioSignature(
  req: NextRequest,
  params: Record<string, string>,
): boolean {
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  if (!authToken) return true  // dev: skip validation when no token configured

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const pathname = req.nextUrl.pathname.replace(/.*\/api\/twilio/, '/api/twilio')
  const url = `${process.env['NEXT_PUBLIC_SITE_URL']}${pathname}`

  const sortedKeys = Object.keys(params).sort()
  const data = url + sortedKeys.map(k => k + params[k]).join('')

  const expected = createHmac('sha1', authToken).update(data, 'utf8').digest('base64')
  return expected === signature
}

// ── Phone normalisation ─────────────────────────────────────────────────────

/** Normalise phone to E.164: must start with +, strip everything else */
function normalisePhone(phone: string): string {
  const stripped = phone.replace(/[^\d+]/g, '')
  if (stripped.startsWith('+')) return stripped
  // If no leading +, assume it was stripped — prepend it
  return `+${stripped.replace(/\D/g, '')}`
}

// ── Config check ────────────────────────────────────────────────────────────

function getSmsConfig(): { accountSid: string; authToken: string; fromNumber: string } | null {
  if (!ACCOUNT_SID || ACCOUNT_SID === 'your-twilio-account-sid') {
    console.warn('Twilio: TWILIO_ACCOUNT_SID not configured — skipping')
    return null
  }
  if (!AUTH_TOKEN || AUTH_TOKEN === 'your-twilio-auth-token') {
    console.warn('Twilio: TWILIO_AUTH_TOKEN not configured — skipping')
    return null
  }
  if (!FROM_NUMBER || FROM_NUMBER === 'your-twilio-phone-number') {
    console.warn('Twilio: TWILIO_PHONE_NUMBER not configured — skipping')
    return null
  }
  return { accountSid: ACCOUNT_SID, authToken: AUTH_TOKEN, fromNumber: FROM_NUMBER }
}

// ── Core SMS sender ─────────────────────────────────────────────────────────

export async function sendSms(opts: {
  to: string
  body: string
}): Promise<{ sid: string } | null> {
  const config = getSmsConfig()
  if (!config) return null

  const phone = normalisePhone(opts.to)
  if (phone.length < 8) {
    console.warn('Twilio: invalid phone number — skipping')
    return null
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`
  const credentials = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')

  const params = new URLSearchParams()
  params.set('To', phone)
  params.set('From', config.fromNumber)
  params.set('Body', opts.body)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Twilio ${res.status}: ${text}`)
  }

  const json = (await res.json()) as { sid: string }
  return { sid: json.sid }
}

// ── Convenience: Viewing confirmed → hunter ─────────────────────────────────

export async function sendViewingConfirmedSms(opts: {
  hunterPhone: string
  hunterName: string | null
  listingTitle: string
  scheduledAt: string
}): Promise<{ sid: string } | null> {
  const name = opts.hunterName?.split(' ')[0] ?? 'there'
  const date = new Date(opts.scheduledAt).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  try {
    return await sendSms({
      to: opts.hunterPhone,
      body: `Hi ${name}, your viewing for "${opts.listingTitle}" is confirmed for ${date}. — Yalla.House`,
    })
  } catch (err) {
    console.error('sendViewingConfirmedSms failed:', err)
    return null
  }
}

// ── Convenience: Viewing reminder → recipient ───────────────────────────────

export async function sendViewingReminderSms(opts: {
  recipientPhone: string
  recipientName: string | null
  listingTitle: string
  scheduledAt: string
}): Promise<{ sid: string } | null> {
  const name = opts.recipientName?.split(' ')[0] ?? 'there'
  const date = new Date(opts.scheduledAt).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  try {
    return await sendSms({
      to: opts.recipientPhone,
      body: `Reminder: your viewing for "${opts.listingTitle}" is coming up on ${date}. — Yalla.House`,
    })
  } catch (err) {
    console.error('sendViewingReminderSms failed:', err)
    return null
  }
}

// ── Convenience: New viewing request → owner ────────────────────────────────

export async function sendViewingRequestSms(opts: {
  ownerPhone: string
  ownerName: string | null
  listingTitle: string
  hunterName: string
}): Promise<{ sid: string } | null> {
  const name = opts.ownerName?.split(' ')[0] ?? 'there'

  try {
    return await sendSms({
      to: opts.ownerPhone,
      body: `Hi ${name}, ${opts.hunterName} has requested a viewing for "${opts.listingTitle}". Check your dashboard to respond. — Yalla.House`,
    })
  } catch (err) {
    console.error('sendViewingRequestSms failed:', err)
    return null
  }
}
