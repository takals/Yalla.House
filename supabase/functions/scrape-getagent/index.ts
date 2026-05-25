// scrape-getagent — GetAgent.co.uk comparison directory sweeper (UK).
// POST { "country_code": "GB", "outcode_offset": 0, "outcode_limit": 50 }
// Returns { success, fetched, inserted, updated, errors, nextOutcodeOffset, done }
//
// Source: https://www.getagent.co.uk/estate-agents/{outcode}
// GetAgent indexes ~12K UK agencies with named branch managers (which TPO/PRS don't expose).
// This is the source we lean on when we want the human contact rather than just the branch.
//
// Strategy: sweep by outcode. ~2.9K UK outcodes → roughly 60 batches at limit=50.
// Each outcode page lists every agency operating in that outcode + their named branch manager.
//
// Parser is left as TODO — fill in after inspecting one outcode page.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const GETAGENT_BASE = 'https://www.getagent.co.uk/estate-agents/'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; outcode_offset?: number; outcode_limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const outcode_offset = body.outcode_offset ?? 0
  const outcode_limit  = body.outcode_limit  ?? 50

  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `GetAgent sweep is GB-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  // Pull this batch's outcodes from postcode_grid (DISTINCT to avoid hammering the same outcode
  // multiple times across postcodes within it).
  const { data: outcodes } = await sb.from('postcode_grid')
    .select('outcode')
    .eq('country_code', 'GB')
    .eq('in_use', true)
    .not('outcode', 'is', null)
    .order('outcode')
    .range(outcode_offset, outcode_offset + outcode_limit - 1)

  const uniqueOutcodes = Array.from(new Set((outcodes ?? []).map(r => r.outcode))).filter(Boolean) as string[]

  for (const outcode of uniqueOutcodes) {
    try {
      const url = `${GETAGENT_BASE}${outcode.toLowerCase()}`
      const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
      if (!resp.ok) {
        if (resp.status !== 404) errors.push(`outcode ${outcode}: HTTP ${resp.status}`)
        continue
      }
      const html = await resp.text()

      // TODO: parse GetAgent outcode page. Each agency block typically contains:
      //   - agency name + branch town
      //   - branch manager name + role
      //   - agency website
      //   - past sales / lettings stats (useful as activity proxy)
      const records = parseGetAgentOutcode(html, outcode)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:    rec.name,
            country_code:   'GB',
            source:         'getagent',
            source_id:      rec.id ?? `${rec.slug}-${outcode}`,
            source_url:     rec.profile_url ?? `${GETAGENT_BASE}${outcode.toLowerCase()}#${rec.slug}`,
            postcode:       rec.postcode ?? null,
            website:        rec.website ?? null,
            branch_manager: rec.branch_manager ?? null,
            coverage_outcodes:  [outcode],
            raw_payload:    { ...rec, observed_at_outcode: outcode, past_sales: rec.past_sales },
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(500)
    } catch (e) {
      errors.push(`outcode ${outcode}: ${(e as Error).message}`)
    }
  }

  const nextOutcodeOffset = outcode_offset + (outcodes?.length ?? 0)
  const done = (outcodes?.length ?? 0) < outcode_limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextOutcodeOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// PLACEHOLDER — fill in after inspecting one GetAgent outcode page.
function parseGetAgentOutcode(_html: string, _outcode: string):
  Array<{ name: string; slug: string; id?: string; profile_url?: string; postcode?: string; website?: string; branch_manager?: string; past_sales?: number }>
{
  return []
}
