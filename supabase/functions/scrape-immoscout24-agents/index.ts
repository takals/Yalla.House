// scrape-immoscout24-agents — ImmobilienScout24 Maklerverzeichnis sweeper (Germany).
// POST { "country_code": "DE", "plz_offset": 0, "plz_limit": 50 }
// Returns { success, fetched, inserted, updated, errors, nextPlzOffset, done }
//
// Source: https://www.immobilienscout24.de/anbieter/in-{plz}.html
// Unlike IVD (which has a global search), IS24 needs to be swept per PLZ — this gives
// us the postcode→agent coverage map (equivalent to scrape-rightmove-agents for the UK).
//
// Strategy:
//   1. Pull the next batch of PLZs from postcode_grid WHERE country_code='DE' ORDER BY postcode.
//   2. For each PLZ, fetch /anbieter/in-{plz}.html and parse the listed branches.
//   3. Each branch row gets upserted with coverage_outcodes = [plz.slice(0,2)] and
//      coverage_postcodes = [plz]. The shared upsert unions these across runs.
//
// Parser is left as TODO — fill in after inspecting one PLZ page (HTML or JSON-LD).

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const IS24_BASE = 'https://www.immobilienscout24.de/anbieter/'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; plz_offset?: number; plz_limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'DE').toUpperCase()
  const plz_offset = body.plz_offset ?? 0
  const plz_limit  = body.plz_limit  ?? 50

  if (country_code !== 'DE') {
    return Response.json({ success: false, error: `ImmoScout24 sweep is DE-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  // Pull this batch's PLZs
  const { data: plzRows } = await sb.from('postcode_grid')
    .select('postcode, outcode, area, latitude, longitude')
    .eq('country_code', 'DE')
    .eq('in_use', true)
    .order('postcode')
    .range(plz_offset, plz_offset + plz_limit - 1)

  for (const row of plzRows ?? []) {
    const plz = row.postcode
    try {
      const url = `${IS24_BASE}in-${plz}.html`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) {
        if (resp.status !== 404) errors.push(`plz ${plz}: HTTP ${resp.status}`)
        continue
      }
      const html = await resp.text()

      // TODO: parse IS24 Anbieter cards. Each card typically contains:
      //   - agency name
      //   - branch ID (in the data-id or href)
      //   - registered address line
      //   - phone (sometimes obfuscated, sometimes plain)
      //   - "x Angebote" — listing count, useful signal
      //   - link to https://www.immobilienscout24.de/anbieter/{slug}-{id}.html
      const records = parseIs24PlzPage(html, plz)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:  rec.name,
            country_code: 'DE',
            source:       'immoscout24',
            source_id:    rec.branch_id,
            source_url:   `${IS24_BASE}${rec.slug}-${rec.branch_id}.html`,
            postcode:     rec.postcode ?? plz,
            phone:        rec.phone ?? null,
            raw_address:  rec.address ?? null,
            coverage_outcodes:  [plz.slice(0, 2)],
            coverage_postcodes: [plz],
            raw_payload:  { ...rec, observed_at_plz: plz, listings_count: rec.listings_count },
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(750) // IS24 is rate-limit happy
    } catch (e) {
      errors.push(`plz ${plz}: ${(e as Error).message}`)
    }
  }

  const nextPlzOffset = plz_offset + (plzRows?.length ?? 0)
  const done = (plzRows?.length ?? 0) < plz_limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextPlzOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// PLACEHOLDER — fill in after inspecting an IS24 Anbieter PLZ page.
function parseIs24PlzPage(_html: string, _plz: string):
  Array<{ name: string; branch_id: string; slug: string; postcode?: string; phone?: string; address?: string; listings_count?: number }>
{
  return []
}
