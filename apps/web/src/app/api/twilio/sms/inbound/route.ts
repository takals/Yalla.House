import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/twilio'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'
const RATE_LIMIT_PER_HOUR = 10
const SESSION_TTL_MINUTES = 30

// Portal URL extraction rules: slug → regex to pull out the external_id
const PORTAL_URL_PATTERNS: Array<{ slug: string; pattern: RegExp }> = [
  { slug: 'immoscout24',  pattern: /immobilienscout24\.de\/expose\/(\d+)/i },
  { slug: 'immowelt',     pattern: /immowelt\.de\/expose\/([a-z0-9-]+)\.html/i },
]

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const params = Object.fromEntries(form.entries()) as Record<string, string>
  if (!validateTwilioSignature(req, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''
  const to   = params['To'] ?? ''
  const body = (params['Body'] ?? '').trim()

  // Rate limiting — count events in last hour
  const db = createServiceClient()
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await (db.from('comms_events') as any)
    .select('id', { count: 'exact', head: true })
    .eq('from_number', from)
    .gte('created_at', hourAgo)

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return twimlReply('Zu viele Anfragen. Bitte versuchen Sie es in einer Stunde erneut.')
  }

  await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, message_body: body, event_type: 'SMS_RECEIVED' })

  // Check for active disambiguation session
  const { data: session } = await (db.from('sms_sessions') as any)
    .select('*')
    .eq('from_number', from)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (session?.state === 'awaiting_disambiguation') {
    const idx = parseInt(body, 10) - 1
    const candidates: Array<{ listing_id: string; label: string }> = session.candidates ?? []
    const chosen = candidates[idx]

    if (chosen) {
      const { data: listing } = await (db.from('listings') as any)
        .select('place_id')
        .eq('id', chosen.listing_id)
        .maybeSingle()

      if (listing) {
        await clearSession(from)
        await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_PROPERTY_MATCHED', match_type: 'address', listing_id: chosen.listing_id })
        return twimlReply(successMessage(`${SITE_URL}/p/${listing.place_id}`))
      }
    }

    return twimlReply(`Ungültige Auswahl. Antworten Sie mit 1–${candidates.length}.`)
  }

  // ── Case S1: Ref code match ──────────────────────────────────────────────
  const refMatch = body.match(/yh[_-][a-z]{2}[_-][a-z0-9]+/i)
  if (refMatch) {
    const placeId = refMatch[0].replace(/-/g, '_').toLowerCase()
    const { data: listing } = await (db.from('listings') as any)
      .select('id, place_id')
      .eq('place_id', placeId)
      .eq('status', 'active')
      .maybeSingle()

    if (listing) {
      await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_PROPERTY_MATCHED', match_type: 'refcode', listing_id: listing.id })
      return twimlReply(successMessage(`${SITE_URL}/p/${listing.place_id}`))
    }

    return twimlReply('Dieser Referenzcode wurde nicht gefunden. Bitte prüfen Sie den Code und versuchen Sie es erneut.')
  }

  // ── Case S2: Portal URL match ────────────────────────────────────────────
  for (const { slug, pattern } of PORTAL_URL_PATTERNS) {
    const urlMatch = body.match(pattern)
    if (urlMatch) {
      const externalId = urlMatch[1]

      const { data: row } = await (db
        .from('listing_portal_status') as any)
        .select('listing_id, listings(place_id)')
        .eq('external_id', externalId)
        .eq('portal_id', (
          await (db.from('portal_config') as any)
            .select('id')
            .eq('slug', slug)
            .maybeSingle()
        )?.data?.id)
        .eq('status', 'published')
        .maybeSingle()

      if (row?.listing_id) {
        const placeId = row.listings?.place_id
        await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_PROPERTY_MATCHED', match_type: 'portal_url', listing_id: row.listing_id })
        return twimlReply(successMessage(`${SITE_URL}/p/${placeId}`))
      }

      break
    }
  }

  // ── Case S3: Address fuzzy match (pg_trgm) ───────────────────────────────
  if (body.length >= 5) {
    const { data: matches } = await (db as any).rpc('fuzzy_match_listings', {
      query_text: body,
      country: 'DE',
      threshold: 0.25,
      max_results: 5,
    })

    if (matches && matches.length === 1) {
      await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_PROPERTY_MATCHED', match_type: 'address', listing_id: matches[0].id })
      return twimlReply(successMessage(`${SITE_URL}/p/${matches[0].place_id}`))
    }

    if (matches && matches.length > 1) {
      const candidates = matches.map((m: any) => ({ listing_id: m.id, label: `${m.address_line1}, ${m.city}` }))
      const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000).toISOString()

      await (db.from('sms_sessions') as any).upsert({
        from_number: from,
        state: 'awaiting_disambiguation',
        candidates,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'from_number' })

      const list = candidates.map((c: any, i: number) => `${i + 1}. ${c.label}`).join('\n')
      await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_AMBIGUOUS_ADDRESS' })
      return twimlReply(`Ich habe mehrere Treffer gefunden. Bitte antworten Sie mit der Nummer:\n${list}`)
    }
  }

  // ── Case S4: No match ────────────────────────────────────────────────────
  await logCommsEvent({ channel: 'sms', from_number: from, to_number: to, event_type: 'COMMS_NO_MATCH' })
  return twimlReply(
    'Leider kein Treffer. Antworten Sie mit:\n1) Referenzcode (yh_de_xxxx)\n2) Portal-Link\n3) Straße + Stadt'
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function twimlReply(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`
  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } })
}

function successMessage(url: string): string {
  return `Hier ist die Immobilienseite: ${url}\nViewing buchen oder Eigentümer kontaktieren direkt auf der Seite.`
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function clearSession(fromNumber: string) {
  const db = createServiceClient()
  await (db.from('sms_sessions') as any).delete().eq('from_number', fromNumber)
}

async function logCommsEvent(event: {
  channel: string
  from_number: string
  to_number: string
  event_type: string
  message_body?: string
  match_type?: string
  listing_id?: string
}) {
  const db = createServiceClient()
  await (db.from('comms_events') as any).insert(event)
}
