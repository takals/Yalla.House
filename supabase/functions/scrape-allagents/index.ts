// scrape-allagents — allAgents.co.uk review directory sweeper (UK).
// POST { "country_code": "GB", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://www.allagents.co.uk/
// allAgents is a review aggregator with broad coverage of small independents that the
// portals miss. Each agency page has a name, branch list, contact info, review count
// and average rating.
//
// Strategy: iterate /find-an-agent/ paginated results. Each card → upsert one agent
// observation per branch.
//
// Parser is left as TODO — fill in after inspecting one /find-an-agent/?page=N page.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const ALLAGENTS_BASE = 'https://www.allagents.co.uk/find-an-agent/'
const PAGE_SIZE = 24

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 100

  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `allAgents sweep is GB-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage   = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      const url = `${ALLAGENTS_BASE}?page=${page}`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) { errors.push(`page ${page}: HTTP ${resp.status}`); continue }
      const html = await resp.text()

      // TODO: parse allAgents cards. Each card has:
      //   - agency name + branch town
      //   - profile slug (/agent/{slug})
      //   - star rating + review count (useful as activity proxy)
      //   - postcode (sometimes on card, sometimes only on detail page)
      const records = parseAllAgentsResults(html)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:   rec.name,
            country_code:  'GB',
            source:        'allagents',
            source_id:     rec.slug,
            source_url:    `https://www.allagents.co.uk/agent/${rec.slug}/`,
            postcode:      rec.postcode ?? null,
            raw_address:   rec.address ?? null,
            raw_payload:   { ...rec, rating: rec.rating, review_count: rec.review_count },
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

// PLACEHOLDER — fill in after inspecting one allAgents results page.
function parseAllAgentsResults(_html: string):
  Array<{ name: string; slug: string; postcode?: string; address?: string; rating?: number; review_count?: number }>
{
  return []
}
