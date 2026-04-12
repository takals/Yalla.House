'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'

interface SearchResult {
  id: string
  place_id: string
  address_line1: string | null
  city: string | null
  postcode: string | null
  status: string
  bedrooms: number | null
  property_type: string | null
  owner_name: string | null
  owner_email: string | null
}

export async function searchPropertiesAction(query: string): Promise<{
  results?: SearchResult[]
  error?: string
}> {
  // Auth + admin check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return { error: 'Not authorized' }
  }

  const db = createServiceClient()
  const trimmed = query.trim()

  if (!trimmed || trimmed.length < 2) {
    return { error: 'Query too short' }
  }

  // Case 1: Ref code match (yh_xx_xxxx)
  const refMatch = trimmed.match(/yh[_-][a-z]{2}[_-][a-z0-9]+/i)
  if (refMatch) {
    const placeId = refMatch[0].replace(/-/g, '_').toLowerCase()
    const { data } = await (db as any)
      .from('listings')
      .select(`
        id, place_id, address_line1, city, postcode, status, bedrooms, property_type,
        owner:users!owner_id(full_name, email)
      `)
      .eq('place_id', placeId)
      .limit(1)

    return {
      results: (data ?? []).map(mapResult),
    }
  }

  // Case 2: Postcode search (starts with digits, 4-5 chars)
  const postcodeMatch = trimmed.match(/^\d{4,5}$/)
  if (postcodeMatch) {
    const { data } = await (db as any)
      .from('listings')
      .select(`
        id, place_id, address_line1, city, postcode, status, bedrooms, property_type,
        owner:users!owner_id(full_name, email)
      `)
      .like('postcode', `${trimmed}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      results: (data ?? []).map(mapResult),
    }
  }

  // Case 3: Fuzzy address match (pg_trgm)
  const { data: fuzzyResults } = await (db as any).rpc('fuzzy_match_listings', {
    query_text: trimmed,
    country: 'DE',
    threshold: 0.2,
    max_results: 10,
  })

  if (fuzzyResults && fuzzyResults.length > 0) {
    // Fuzzy results return minimal data — fetch full details
    const ids = fuzzyResults.map((r: any) => r.id)
    const { data } = await (db as any)
      .from('listings')
      .select(`
        id, place_id, address_line1, city, postcode, status, bedrooms, property_type,
        owner:users!owner_id(full_name, email)
      `)
      .in('id', ids)

    return {
      results: (data ?? []).map(mapResult),
    }
  }

  // Case 4: Plain text search on address_line1 or city
  const { data: textResults } = await (db as any)
    .from('listings')
    .select(`
      id, place_id, address_line1, city, postcode, status, bedrooms, property_type,
      owner:users!owner_id(full_name, email)
    `)
    .or(`address_line1.ilike.%${trimmed}%,city.ilike.%${trimmed}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    results: (textResults ?? []).map(mapResult),
  }
}

function mapResult(row: any): SearchResult {
  return {
    id: row.id,
    place_id: row.place_id,
    address_line1: row.address_line1,
    city: row.city,
    postcode: row.postcode,
    status: row.status,
    bedrooms: row.bedrooms,
    property_type: row.property_type,
    owner_name: row.owner?.full_name ?? null,
    owner_email: row.owner?.email ?? null,
  }
}

export async function sendPropertyLinkAction(data: {
  phoneNumber: string
  placeId: string
  channel: 'sms' | 'whatsapp'
}): Promise<{ success?: boolean; error?: string }> {
  // Auth + admin check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return { error: 'Not authorized' }
  }

  const propertyUrl = `${SITE_URL}/p/${data.placeId}`
  const message = `Hier ist die Immobilie, die Sie gesucht haben: ${propertyUrl}\nSie können dort direkt eine Besichtigung buchen.`

  // Log the send event
  const db = createServiceClient()
  await (db.from('comms_events') as any).insert({
    channel: data.channel,
    from_number: 'admin',
    to_number: data.phoneNumber,
    event_type: 'ADMIN_SEND_LINK',
    message_body: message,
  })

  // In production, this would call Twilio API to send SMS/WhatsApp
  // For now, we log the event and return success
  // TODO: Wire Twilio send when TWILIO_ACCOUNT_SID is configured
  const twilioSid = process.env['TWILIO_ACCOUNT_SID']
  const twilioToken = process.env['TWILIO_AUTH_TOKEN']
  const twilioFrom = process.env['TWILIO_FROM_NUMBER']

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
      const toNumber = data.channel === 'whatsapp'
        ? `whatsapp:${data.phoneNumber}`
        : data.phoneNumber
      const fromNumber = data.channel === 'whatsapp'
        ? `whatsapp:${twilioFrom}`
        : twilioFrom

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { error: `Twilio error: ${errorData.message ?? response.statusText}` }
      }
    } catch (err: unknown) {
      return { error: `Send failed: ${err instanceof Error ? err.message : 'Unknown error'}` }
    }
  }

  return { success: true }
}
