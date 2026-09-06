import { createServiceClient } from '@/lib/supabase/server'

/**
 * Turns an inbound email on a contact alias into an inbound_leads row.
 *
 * This is the receiving end of the Red Thread non-negotiable: every
 * syndicated listing carries an alias like l-xxxx-immoscout@in.yalla.house,
 * so the address itself identifies the listing AND the source portal. Nothing
 * needs to be parsed out of the body to attribute the enquiry.
 *
 * Resend's email.received webhook is metadata only; the body is a second call.
 * The lead is created from metadata first so it survives even if that call
 * fails — a lead with no body is far better than no lead.
 */

type ReceivedEvent = {
  email_id: string
  from: string
  to: string[]
  subject?: string
  message_id?: string
}

async function fetchBody(emailId: string): Promise<string | null> {
  const key = process.env['RESEND_API_KEY']
  if (!key) return null
  try {
    // resend SDK v4 predates inbound; call the REST endpoint directly.
    const res = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) return null
    const j = (await res.json()) as { text?: string; html?: string }
    return j.text ?? (j.html ? j.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null)
  } catch {
    return null
  }
}

export async function handleReceivedEmail(data: ReceivedEvent): Promise<
  { ok: true; leadId: string } | { ok: false; reason: string }
> {
  const db = createServiceClient()

  // Find the alias among recipients. Guests may CC others; we only act on ours.
  const candidates = (data.to ?? []).map(a => a.trim().toLowerCase())
  let resolved: { alias_id: string; listing_id: string; portal_id: string | null; target_user_id: string } | null = null

  for (const addr of candidates) {
    const { data: rows } = await (db.rpc as any)('resolve_contact_alias', { p_alias: addr })
    if (rows && rows.length) { resolved = rows[0]; break }
  }
  if (!resolved) return { ok: false, reason: 'no_matching_alias' }

  // Idempotency: Resend may retry. message_id is the natural key.
  if (data.message_id) {
    const { data: dupe } = await (db.from('inbound_leads') as any)
      .select('id').eq('source', `email:${data.message_id}`).maybeSingle()
    if (dupe) return { ok: true, leadId: dupe.id }
  }

  const body = await fetchBody(data.email_id)

  const { data: lead, error } = await (db.from('inbound_leads') as any)
    .insert({
      listing_id: resolved.listing_id,
      alias_id: resolved.alias_id,
      portal_id: resolved.portal_id,
      channel: 'email',
      source: data.message_id ? `email:${data.message_id}` : `resend:${data.email_id}`,
      contact_email: data.from?.toLowerCase().slice(0, 320) ?? null,
      raw_message: [data.subject ? `Subject: ${data.subject}` : null, body]
        .filter(Boolean).join('\n\n').slice(0, 5000) || null,
      status: 'pending',
    })
    .select('id').single()

  if (error || !lead) return { ok: false, reason: error?.message ?? 'insert_failed' }
  return { ok: true, leadId: lead.id }
}
