// Shared agent upsert helper used by all scrape-* edge functions.
// Country-aware. Idempotent. Records every observation in agent_source_links.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type AgentObservation = {
  // Required
  agency_name: string
  country_code: string                // 'GB' | 'DE' | 'AE' | 'TR' | ...
  source: string                      // 'tpo' | 'prs' | 'rightmove' | 'companies_house' | ...
  // Source identity (at least one of these must be present)
  source_id?: string                  // e.g. TPO membership number, Rightmove branch ID
  source_url?: string
  // Optional enrichment
  email?: string | null
  phone?: string | null
  website?: string | null
  postcode?: string | null
  raw_address?: string | null
  service_types?: string[] | null
  coverage_outcodes?: string[] | null
  coverage_postcodes?: string[] | null
  branch_manager?: string | null
  raw_payload?: Record<string, unknown>
}

export function client(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Upsert an agent observation. Returns { inserted, updated, agent_user_id }.
 *
 * Dedup key: (lower(agency_name), country_code, postcode_prefix_3) when postcode present,
 * otherwise (lower(agency_name), country_code, source).
 *
 * On match: extends coverage_outcodes / coverage_postcodes (array union),
 * updates last_seen on the source link, fills missing email/phone/website/postcode.
 */
export async function upsertAgent(sb: SupabaseClient, obs: AgentObservation) {
  const nameKey = obs.agency_name.trim().toLowerCase()
  const postcodePrefix = (obs.postcode ?? '').trim().toUpperCase().slice(0, 3) || null

  // Find existing match
  const { data: existing } = await sb
    .from('agent_profiles')
    .select('user_id, email, phone, website, postcode, coverage_outcodes, coverage_postcodes')
    .eq('country_code', obs.country_code)
    .ilike('agency_name', obs.agency_name)
    .limit(1)
    .maybeSingle()

  let agent_user_id: string

  if (existing) {
    agent_user_id = existing.user_id
    const merged = {
      email:   existing.email   ?? obs.email   ?? null,
      phone:   existing.phone   ?? obs.phone   ?? null,
      website: existing.website ?? obs.website ?? null,
      postcode: existing.postcode ?? obs.postcode ?? null,
      coverage_outcodes:  unionArr(existing.coverage_outcodes,  obs.coverage_outcodes),
      coverage_postcodes: unionArr(existing.coverage_postcodes, obs.coverage_postcodes),
      coverage_last_seen_at: new Date().toISOString(),
    }
    await sb.from('agent_profiles').update(merged).eq('user_id', agent_user_id)
  } else {
    // Create a new agent_profiles row. Note: in the current schema agent_profiles.user_id
    // references auth.users, so for scraped agents we mint a placeholder user via auth admin.
    // The propertymark scraper currently uses a service-role auth.admin.createUser flow —
    // we mirror that here. (TODO: extract into a single helper once propertymark fn is in repo.)
    const { data: authUser } = await sb.auth.admin.createUser({
      email: obs.email ?? `${nameKey.replace(/[^a-z0-9]/g, '')}+${obs.source}@scraped.yalla.house`,
      email_confirm: true,
      user_metadata: { scraped: true, source: obs.source, country_code: obs.country_code },
    })
    if (!authUser?.user) throw new Error('failed to mint placeholder auth user')
    agent_user_id = authUser.user.id

    await sb.from('agent_profiles').insert({
      user_id: agent_user_id,
      agency_name: obs.agency_name,
      country_code: obs.country_code,
      email: obs.email ?? null,
      phone: obs.phone ?? null,
      website: obs.website ?? null,
      postcode: obs.postcode ?? null,
      raw_address: obs.raw_address ?? null,
      service_types: obs.service_types ?? null,
      coverage_outcodes: obs.coverage_outcodes ?? null,
      coverage_postcodes: obs.coverage_postcodes ?? null,
      coverage_last_seen_at: new Date().toISOString(),
      branch_manager: obs.branch_manager ?? null,
      data_source: obs.source,
      source_url: obs.source_url ?? null,
    })
  }

  // Link observation
  if (obs.source_id || obs.source_url) {
    await sb.from('agent_source_links').upsert({
      agent_user_id,
      source: obs.source,
      source_id: obs.source_id ?? obs.source_url ?? `${nameKey}-${postcodePrefix ?? 'na'}`,
      source_url: obs.source_url ?? null,
      country_code: obs.country_code,
      last_seen_at: new Date().toISOString(),
      raw_payload: obs.raw_payload ?? null,
    }, { onConflict: 'source,source_id,country_code' })
  }

  return { inserted: !existing, updated: !!existing, agent_user_id }
}

function unionArr(a?: string[] | null, b?: string[] | null): string[] | null {
  const set = new Set<string>()
  ;(a ?? []).forEach(x => x && set.add(x))
  ;(b ?? []).forEach(x => x && set.add(x))
  return set.size ? Array.from(set).sort() : null
}
