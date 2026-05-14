// scrape-tpo — The Property Ombudsman register sweeper.
// POST { "country_code": "GB", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://www.tpos.co.uk/register-of-businesses/
// TPO publishes a public register of all member firms (mandatory redress scheme).
// Pagination: search results page is paginated; URL pattern includes ?page=N.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const TPO_BASE = 'https://www.tpos.co.uk/register-of-businesses/'
const PAGE_SIZE = 25 // TPO renders 25 results per page; map our 'limit' to ceil(limit/25) pages

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 100

  // TPO is UK-only; reject other countries
  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `TPO is GB-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage   = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      const url = `${TPO_BASE}?page=${page}`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) { errors.push(`page ${page}: HTTP ${resp.status}`); continue }
      const html = await resp.text()

      // TODO: parse register cards out of TPO HTML. Each card typically contains:
      //   - firm name
      //   - membership number (TPO ref)
      //   - registered address (may include postcode)
      //   - scheme(s) joined: SALES / LETTINGS / COMMERCIAL / LEASEHOLD
      // Use deno-dom or regex against the known markup. Below is a placeholder shape.
      const records = parseTpoRegister(html) // returns Array<{ name, ref, address, postcode, schemes[] }>

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:   rec.name,
            country_code:  'GB',
            source:        'tpo',
            source_id:     rec.ref,
            source_url:    `${TPO_BASE}#${rec.ref}`,
            postcode:      rec.postcode ?? null,
            raw_address:   rec.address ?? null,
            service_types: rec.schemes ?? null,
            raw_payload:   rec,
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(450) // be polite
    } catch (e) {
      errors.push(`page ${page}: ${(e as Error).message}`)
    }
  }

  const nextOffset = offset + fetched
  const done = fetched < limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// PLACEHOLDER — fill in after inspecting the TPO register HTML structure.
function parseTpoRegister(_html: string): Array<{ name: string; ref: string; address?: string; postcode?: string; schemes?: string[] }> {
  return []
}
