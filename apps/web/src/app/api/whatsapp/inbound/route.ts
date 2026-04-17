import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * 360dialog WhatsApp Business API — Inbound Webhook
 *
 * This endpoint receives inbound messages from home hunters who have seen
 * a listing on a portal (Rightmove, Zoopla, etc.) and text the smart phone
 * number shown on the listing or flyer.
 *
 * Flow:
 * 1. Hunter sends a WhatsApp message (e.g. "YH-AB12" or a portal URL or address)
 * 2. We identify the listing from the message content
 * 3. We reply with the Yalla.House listing link
 * 4. We log the lead in `inbound_leads` for tracking
 *
 * 360dialog webhook format:
 * https://docs.360dialog.com/docs/waba-api/webhooks
 */

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'
const WHATSAPP_API_KEY = process.env['WHATSAPP_API_KEY']
const RATE_LIMIT_PER_HOUR = 20

// Portal URL extraction rules
const PORTAL_URL_PATTERNS: Array<{ slug: string; pattern: RegExp }> = [
  { slug: 'rightmove',     pattern: /rightmove\.co\.uk\/properties?\/(\d+)/i },
  { slug: 'zoopla',        pattern: /zoopla\.co\.uk\/for-sale\/details\/(\d+)/i },
  { slug: 'immoscout24',   pattern: /immobilienscout24\.de\/expose\/(\d+)/i },
  { slug: 'immowelt',      pattern: /immowelt\.de\/expose\/([a-z0-9-]+)\.html/i },
]

// Short ID pattern: YH-XXXX
const SHORT_ID_PATTERN = /\b(YH-[A-Z0-9]{4,6})\b/i

// GET for 360dialog webhook verification
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get('hub.challenge')
  const verifyToken = req.nextUrl.searchParams.get('hub.verify_token')

  if (verifyToken === process.env['WHATSAPP_VERIFY_TOKEN'] && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 360dialog sends events in the Cloud API format
  const entry = payload?.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value

  if (!value?.messages?.[0]) {
    // Not a message event (could be status update) — acknowledge
    return NextResponse.json({ status: 'ok' })
  }

  const message = value.messages[0]
  const contact = value.contacts?.[0]
  const from = message.from // Phone number in international format (no +)
  const body = (message.text?.body ?? '').trim()
  const contactName = contact?.profile?.name ?? null

  if (!body || !from) {
    return NextResponse.json({ status: 'ok' })
  }

  const db = createServiceClient()

  // ── Rate limiting ────────────────────────────────────────────────────
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await (db.from('comms_events') as any)
    .select('id', { count: 'exact', head: true })
    .eq('from_number', from)
    .eq('channel', 'whatsapp')
    .gte('created_at', hourAgo)

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json({ status: 'rate_limited' })
  }

  // Log inbound event
  await logCommsEvent(db, {
    channel: 'whatsapp',
    from_number: from,
    to_number: value.metadata?.display_phone_number ?? '',
    event_type: 'INBOUND_MESSAGE',
    message_body: body.slice(0, 500),
  })

  // ── Case 1: Short ID match (YH-XXXX) ────────────────────────────────
  const shortIdMatch = body.match(SHORT_ID_PATTERN)
  if (shortIdMatch) {
    const shortId = shortIdMatch[1]!.toUpperCase()
    const { data: listing } = await (db.from('listings') as any)
      .select('id, place_id, slug, short_id, title, title_de, city, postcode')
      .eq('short_id', shortId)
      .eq('status', 'active')
      .maybeSingle()

    if (listing) {
      const url = buildListingUrl(listing)
      await logInboundLead(db, {
        listing_id: listing.id,
        channel: 'whatsapp',
        source: 'short_id',
        contact_phone: from,
        contact_name: contactName,
        raw_message: body,
        matched_by: 'short_id',
        reply_link: url,
      })
      await sendWhatsAppReply(from, buildReplyMessage(listing, url))
      return NextResponse.json({ status: 'matched', match_type: 'short_id' })
    }
  }

  // ── Case 2: Ref code match (yh_xx_xxxx / place_id format) ───────────
  const refMatch = body.match(/yh[_-][a-z]{2}[_-][a-z0-9]+/i)
  if (refMatch) {
    const placeId = refMatch[0].replace(/-/g, '_').toLowerCase()
    const { data: listing } = await (db.from('listings') as any)
      .select('id, place_id, slug, short_id, title, title_de, city, postcode')
      .eq('place_id', placeId)
      .eq('status', 'active')
      .maybeSingle()

    if (listing) {
      const url = buildListingUrl(listing)
      await logInboundLead(db, {
        listing_id: listing.id,
        channel: 'whatsapp',
        source: 'refcode',
        contact_phone: from,
        contact_name: contactName,
        raw_message: body,
        matched_by: 'refcode',
        reply_link: url,
      })
      await sendWhatsAppReply(from, buildReplyMessage(listing, url))
      return NextResponse.json({ status: 'matched', match_type: 'refcode' })
    }
  }

  // ── Case 3: Portal URL match ─────────────────────────────────────────
  for (var { slug, pattern } of PORTAL_URL_PATTERNS) {
    const urlMatch = body.match(pattern)
    if (urlMatch) {
      const externalId = urlMatch[1]

      const { data: portalConfig } = await (db.from('portal_config') as any)
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (portalConfig?.id) {
        const { data: row } = await (db.from('listing_portal_status') as any)
          .select('listing_id, listings(id, place_id, slug, short_id, title, title_de, city, postcode)')
          .eq('external_id', externalId)
          .eq('portal_id', portalConfig.id)
          .eq('status', 'published')
          .maybeSingle()

        if (row?.listings) {
          const listing = row.listings
          const url = buildListingUrl(listing)
          await logInboundLead(db, {
            listing_id: listing.id,
            channel: 'whatsapp',
            source: `portal_${slug}`,
            contact_phone: from,
            contact_name: contactName,
            raw_message: body,
            matched_by: 'portal_url',
            reply_link: url,
          })
          await sendWhatsAppReply(from, buildReplyMessage(listing, url))
          return NextResponse.json({ status: 'matched', match_type: 'portal_url' })
        }
      }
      break
    }
  }

  // ── Case 4: Address fuzzy match ──────────────────────────────────────
  if (body.length >= 5) {
    const { data: matches } = await (db as any).rpc('fuzzy_match_listings', {
      query_text: body,
      country: 'GB',
      threshold: 0.25,
      max_results: 3,
    })

    if (matches && matches.length === 1) {
      const match = matches[0]
      // Fetch full listing data for URL
      const { data: listing } = await (db.from('listings') as any)
        .select('id, place_id, slug, short_id, title, title_de, city, postcode')
        .eq('id', match.id)
        .maybeSingle()

      if (listing) {
        const url = buildListingUrl(listing)
        await logInboundLead(db, {
          listing_id: listing.id,
          channel: 'whatsapp',
          source: 'address_match',
          contact_phone: from,
          contact_name: contactName,
          raw_message: body,
          matched_by: 'address',
          reply_link: url,
        })
        await sendWhatsAppReply(from, buildReplyMessage(listing, url))
        return NextResponse.json({ status: 'matched', match_type: 'address' })
      }
    }

    if (matches && matches.length > 1) {
      // Multiple matches — ask for clarification
      var lines = ['We found multiple properties. Reply with the number:']
      matches.forEach(function(m: any, i: number) {
        lines.push((i + 1) + '. ' + (m.address_line1 ?? '') + ', ' + (m.city ?? ''))
      })
      await sendWhatsAppReply(from, lines.join('\n'))
      return NextResponse.json({ status: 'disambiguation' })
    }
  }

  // ── No match — friendly fallback ─────────────────────────────────────
  await sendWhatsAppReply(
    from,
    "Thanks for your message! We couldn't identify the property.\n\nPlease share the property code (e.g. YH-AB12) from the listing, or paste the property URL.\n\nVisit yalla.house to browse all properties."
  )

  return NextResponse.json({ status: 'no_match' })
}

// ── Helpers ──────────────────────────────────────────────────────────────

function buildListingUrl(listing: Record<string, any>): string {
  var identifier = listing.slug ?? listing.place_id
  return SITE_URL + '/en/p/' + identifier + '?ref=whatsapp'
}

function buildReplyMessage(listing: Record<string, any>, url: string): string {
  var title = listing.title ?? listing.title_de ?? 'Property'
  var location = [listing.postcode, listing.city].filter(Boolean).join(' ')
  return 'Here\'s the property you\'re looking for:\n\n' +
    '🏠 ' + title + '\n' +
    '📍 ' + location + '\n\n' +
    'View details & book a viewing:\n' + url + '\n\n' +
    'Yalla.House — Your property, your way.'
}

async function sendWhatsAppReply(to: string, text: string): Promise<void> {
  if (!WHATSAPP_API_KEY || WHATSAPP_API_KEY === 'your-360dialog-api-key') {
    console.warn('WhatsApp reply skipped: WHATSAPP_API_KEY not configured')
    console.log('Would send to', to, ':', text)
    return
  }

  var phone = to.replace(/\D/g, '')
  try {
    var res = await fetch('https://waba.360dialog.io/v1/messages', {
      method: 'POST',
      headers: {
        'D360-API-KEY': WHATSAPP_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    })
    if (!res.ok) {
      var errText = await res.text()
      console.error('WhatsApp reply failed:', res.status, errText)
    }
  } catch (err) {
    console.error('WhatsApp reply error:', err)
  }
}

async function logCommsEvent(db: any, data: {
  channel: string
  from_number: string
  to_number: string
  event_type: string
  message_body?: string
}): Promise<void> {
  try {
    await (db.from('comms_events') as any).insert(data)
  } catch (err) {
    console.error('logCommsEvent error:', err)
  }
}

async function logInboundLead(db: any, data: {
  listing_id: string
  channel: string
  source: string
  contact_phone: string
  contact_name: string | null
  raw_message: string
  matched_by: string
  reply_link: string
}): Promise<void> {
  try {
    await (db.from('inbound_leads') as any).insert({
      listing_id: data.listing_id,
      channel: data.channel,
      source: data.source,
      contact_phone: data.contact_phone,
      contact_name: data.contact_name,
      raw_message: data.raw_message,
      status: 'link_sent',
      matched_by: data.matched_by,
      reply_sent_at: new Date().toISOString(),
      reply_channel: 'whatsapp',
      reply_link: data.reply_link,
    })
  } catch (err) {
    console.error('logInboundLead error:', err)
  }
}
