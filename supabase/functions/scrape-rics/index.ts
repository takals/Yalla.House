// scrape-rics — RICS Find a Surveyor directory sweeper (UK).
// POST { "country_code": "GB", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://www.ricsfirms.com/
// RICS-regulated firms — strong on commercial + valuation, with substantial overlap
// with TPO but unique long-tail in non-residential surveying agencies.
// Pagination: the search results page uses ?page=N.
//
// Parser is left as TODO — fill in after inspecting the search results HTML.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const RICS_BASE = 'https://www.ricsfirms.com/search/'
const PAGE_SIZE = 20

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 100

  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `RICS sweep is GB-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage   = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      const url = `${RICS_BASE}?page=${page}`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) { errors.push(`page ${page}: HTTP ${resp.status}`); continue }
      const html = await resp.text()

      // TODO: parse RICS firm cards. Each card typically contains:
      //   - firm name
      //   - RICS firm number
      //   - registered office address + postcode
      //   - service tags (Sales / Lettings / Commercial / Valuation / Survey)
      //   - link to firm profile page
      const records = parseRicsResults(html)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:   rec.name,
            country_code:  'GB',
            source:        'rics',
            source_id:     rec.firm_number,
            source_url:    rec.profile_url ?? `${RICS_BASE}firm/${rec.firm_number}`,
            postcode:      rec.postcode ?? null,
            raw_address:   rec.address ?? null,
            service_types: rec.services ?? null,
            raw_payload:   rec,
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(500)
    } catch (e) {
      errors.push(`page ${page}: ${(e as Error).message}`)
    }
  }

  const nextOffset = offset + fetched
  const done = fetched < limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// PLACEHOLDER — fill in after inspecting the RICS results HTML.
function parseRicsResults(_html: string):
  Array<{ name: string; firm_number: string; profile_url?: string; postcode?: string; address?: string; services?: string[] }>
{
  return []
}
