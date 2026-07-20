import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { parseListingsFromEmail } from '@/lib/listing-parse'

/**
 * POST /api/inbound/agent-listings
 *
 * Inbound webhook for listings@yalla.house. Agents paste that address into
 * their own property mailing lists; the mail provider (SendGrid Inbound Parse,
 * Postmark, Cloudflare Email Worker, Resend Inbound, …) POSTs each received
 * message here. We store the raw email, match the sender to an agent, parse
 * listing candidates, and queue them for admin review + distribution.
 *
 * Auth: a shared secret. Configure INBOUND_LISTINGS_SECRET and pass it as the
 * `x-inbound-secret` header (or `?secret=` query param) from the mail provider.
 * This is a machine webhook, not a user action — no Supabase JWT involved.
 */

function extractEmail(raw?: string | null): { email: string | null; name: string | null } {
  if (!raw) return { email: null, name: null }
  const m = raw.match(/<([^>]+)>/)
  const email = (m?.[1] ?? raw).trim().toLowerCase()
  const name = m ? raw.replace(/<[^>]+>/, '').replace(/["']/g, '').trim() : null
  return { email: /\S+@\S+\.\S+/.test(email) ? email : null, name: name || null }
}

function pick(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v
  }
  return null
}

export async function POST(request: Request) {
  const expected = process.env.INBOUND_LISTINGS_SECRET
  if (!expected) {
    console.error('inbound/agent-listings: INBOUND_LISTINGS_SECRET not configured')
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }
  const url = new URL(request.url)
  const provided = request.headers.get('x-inbound-secret') ?? url.searchParams.get('secret')
  if (provided !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Accept both JSON (Postmark/Resend-style) and multipart form (SendGrid-style).
  let raw: Record<string, unknown> = {}
  const ct = request.headers.get('content-type') ?? ''
  try {
    if (ct.includes('application/json')) {
      raw = await request.json()
    } else if (ct.includes('multipart/form-data') || ct.includes('application/x-www-form-urlencoded')) {
      const fd = await request.formData()
      fd.forEach((v, k) => { raw[k] = typeof v === 'string' ? v : `[file:${(v as File).name}]` })
    } else {
      raw = await request.json().catch(() => ({}))
    }
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const fromRaw = pick(raw, 'from', 'From', 'sender', 'FromFull.Email')
  const { email: fromEmail, name: fromName } = extractEmail(fromRaw)
  const toRaw = pick(raw, 'to', 'To', 'recipient', 'envelope')
  const { email: toEmail } = extractEmail(toRaw)
  const subject = pick(raw, 'subject', 'Subject')
  const text = pick(raw, 'text', 'TextBody', 'plain', 'body-plain', 'stripped-text')
  const html = pick(raw, 'html', 'HtmlBody', 'body-html', 'stripped-html')
  const messageId = pick(raw, 'MessageID', 'message-id', 'Message-Id', 'messageId', 'message_id')

  const service = createServiceClient()

  // De-dupe on provider message id (if the provider gives us one).
  if (messageId) {
    const { data: dupe } = await (service.from('agent_inbound_emails') as any)
      .select('id').eq('provider_message_id', messageId).maybeSingle()
    if (dupe) return NextResponse.json({ received: true, duplicate: true })
  }

  // Match the sender to a known agent (by contact email on their profile).
  let agentUserId: string | null = null
  let agentCountry: string | null = null
  if (fromEmail) {
    const { data: agent } = await (service.from('agent_profiles') as any)
      .select('user_id, country_code')
      .ilike('email', fromEmail)
      .limit(1)
      .maybeSingle()
    if (agent) { agentUserId = agent.user_id; agentCountry = agent.country_code ?? null }
  }

  // Store the raw email.
  const { data: emailRow, error: emailErr } = await (service.from('agent_inbound_emails') as any)
    .insert({
      provider_message_id: messageId,
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      subject,
      text_body: text,
      html_body: html,
      headers: (raw['headers'] && typeof raw['headers'] === 'object') ? raw['headers'] : {},
      agent_user_id: agentUserId,
      status: 'received',
    })
    .select('id')
    .single()

  if (emailErr || !emailRow) {
    console.error('inbound/agent-listings insert error:', emailErr)
    return NextResponse.json({ error: 'store_failed' }, { status: 500 })
  }

  // Parse listing candidates and queue them.
  let listingCount = 0
  try {
    const candidates = parseListingsFromEmail({ subject, text, html, countryHint: agentCountry })
    if (candidates.length) {
      const rows = candidates.map(c => ({
        email_id: emailRow.id,
        agent_user_id: agentUserId,
        title: c.title,
        price_text: c.priceText,
        price_amount: c.priceAmount,
        currency: c.currency,
        location: c.location,
        postcode: c.postcode,
        country_code: c.countryCode,
        property_type: c.propertyType,
        bedrooms: c.bedrooms,
        url: c.url,
        description: c.description,
        status: 'new',
      }))
      const { error: listErr } = await (service.from('agent_inbound_listings') as any).insert(rows)
      if (listErr) throw listErr
      listingCount = rows.length
    }
    await (service.from('agent_inbound_emails') as any)
      .update({ status: 'parsed', listing_count: listingCount })
      .eq('id', emailRow.id)
  } catch (e) {
    console.error('inbound/agent-listings parse error:', e)
    await (service.from('agent_inbound_emails') as any)
      .update({ status: 'error', parse_error: String(e).slice(0, 400) })
      .eq('id', emailRow.id)
  }

  return NextResponse.json({ received: true, listings: listingCount })
}
