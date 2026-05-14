// scrape-prs — Property Redress Scheme member sweeper.
// POST { "country_code": "GB", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://www.theprs.co.uk/consumer/members/
// PRS publishes a public Agent Finder. ~18K members.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const PRS_BASE = 'https://www.theprs.co.uk/consumer/members/'
const PAGE_SIZE = 20 // PRS member-search page size; tune after inspection

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 100

  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `PRS is GB-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage   = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      // PRS uses a search form. Empty query returns all members; iterate via &page=N or &start=offset.
      const url = `${PRS_BASE}?page=${page}`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) { errors.push(`page ${page}: HTTP ${resp.status}`); continue }
      const html = await resp.text()

      // TODO: parse member rows. Expected fields per row:
      //   - firm name
      //   - membership ID
      //   - registered address (postcode may be embedded)
      //   - business type: ESTATE_AGENT | LETTING_AGENT | PROPERTY_MANAGER
      const records = parsePrsMembers(html)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:   rec.name,
            country_code:  'GB',
            source:        'prs',
            source_id:     rec.membership_id,
            source_url:    rec.profile_url ?? PRS_BASE,
            postcode:      rec.postcode ?? null,
            raw_address:   rec.address ?? null,
            service_types: rec.business_types ?? null,
            raw_payload:   rec,
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(450)
    } catch (e) {
      errors.push(`page ${page}: ${(e as Error).message}`)
    }
  }

  const nextOffset = offset + fetched
  const done = fetched < limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function parsePrsMembers(_html: string): Array<{
  name: string
  membership_id: string
  profile_url?: string
  address?: string
  postcode?: string
  business_types?: string[]
}> {
  return []
}
