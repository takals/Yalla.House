// scrape-rightmove-agents — Rightmove Agent Finder sweeper, keyed by outcode.
// POST { "country_code": "GB", "outcodes": ["SW1","M1",...], "branch_type": "SALES" | "LETTINGS" }
//   OR  { "country_code": "GB", "offset": 0, "limit": 50 }   ← drives off postcode_grid
// Returns { success, outcodes_processed, agents_found, inserted, updated, errors, nextOffset, done }
//
// Source URL pattern: /estate-agents/find.html?locationIdentifier=OUTCODE^N&branchType=SALES
// Each outcode response paginates inside the page; we follow next-page links until exhausted.
//
// This is the source that gives us the postcode → agent map. Each agent record is
// upserted with the outcode appended to coverage_outcodes (array union).

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const RM_BASE = 'https://www.rightmove.co.uk/estate-agents/find.html'
const BRANCH_TYPES = ['SALES', 'LETTINGS'] as const
type BranchType = typeof BRANCH_TYPES[number]

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: {
    country_code?: string
    outcodes?: string[]
    branch_type?: BranchType
    offset?: number
    limit?: number
  }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `Rightmove agent finder is GB-only, got ${country_code}` }, { status: 400 })
  }
  const branchType: BranchType = body.branch_type ?? 'SALES'

  const sb = client()

  // Resolve which outcodes to sweep this run.
  let outcodes: string[]
  if (body.outcodes && body.outcodes.length) {
    outcodes = body.outcodes
  } else {
    const offset = body.offset ?? 0
    const limit  = body.limit  ?? 50
    const { data, error } = await sb
      .from('postcode_grid')
      .select('outcode')
      .eq('country_code', 'GB')
      .eq('in_use', true)
      .not('outcode', 'is', null)
      .order('outcode')
      .range(offset, offset + limit - 1)
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 })
    outcodes = Array.from(new Set((data ?? []).map(r => r.outcode))).filter(Boolean)
  }

  const errors: string[] = []
  let agents_found = 0, inserted = 0, updated = 0
  let outcodes_processed = 0

  for (const outcode of outcodes) {
    try {
      // Resolve outcode → Rightmove locationIdentifier. Rightmove uses an internal ID like
      // OUTCODE^123. There's a typeahead endpoint at /typeAhead/uknostreet/<TWO_CHARS>/<NEXT_CHARS>/
      // that returns the locationIdentifier for a given outcode string.
      const locId = await resolveLocationIdentifier(outcode)
      if (!locId) { errors.push(`${outcode}: no locationIdentifier`); continue }

      // Walk paginated agent results
      let page = 1
      let pagedAny = false
      while (true) {
        const url = `${RM_BASE}?locationIdentifier=${encodeURIComponent(locId)}&branchType=${branchType}&page=${page}`
        const resp = await fetch(url, { headers: { 'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)' } })
        if (!resp.ok) { errors.push(`${outcode} p${page}: HTTP ${resp.status}`); break }
        const html = await resp.text()

        // TODO: parse agent cards. Each card has:
        //   - branch ID (in href: /estate-agents/agent/<co>/<branch>-<id>.html)
        //   - branch name + parent company name
        //   - phone number
        //   - branch address (incl. postcode)
        //   - sales/lettings counts
        const records = parseRightmoveAgentCards(html)
        if (!records.length) break
        pagedAny = true

        for (const rec of records) {
          agents_found++
          try {
            const out = await upsertAgent(sb, {
              agency_name:       rec.branch_full_name,
              country_code:      'GB',
              source:            'rightmove',
              source_id:         String(rec.branch_id),
              source_url:        rec.profile_url,
              phone:             rec.phone ?? null,
              postcode:          rec.postcode ?? null,
              raw_address:       rec.address ?? null,
              coverage_outcodes: [outcode],
              raw_payload:       rec,
            })
            if (out.inserted) inserted++; else updated++
          } catch (e) {
            errors.push(`upsert ${rec.branch_full_name}: ${(e as Error).message}`)
          }
        }

        page++
        if (page > 10) break // Rightmove caps results; 10 pages is enough per outcode
        await sleep(350)
      }

      if (pagedAny) outcodes_processed++
      await sleep(500)
    } catch (e) {
      errors.push(`${outcode}: ${(e as Error).message}`)
    }
  }

  return Response.json({
    success: true,
    country_code,
    branch_type: branchType,
    outcodes_processed,
    agents_found,
    inserted,
    updated,
    errors,
    nextOffset: (body.offset ?? 0) + outcodes.length,
    done: outcodes.length < (body.limit ?? 50),
  })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function resolveLocationIdentifier(_outcode: string): Promise<string | null> {
  // TODO: hit Rightmove typeahead
  // /typeAhead/uknostreet/<first2>/<rest>/  returns JSON { typeAheadLocations: [{ locationIdentifier }] }
  return null
}

function parseRightmoveAgentCards(_html: string): Array<{
  branch_id: string | number
  branch_full_name: string
  parent_company?: string
  profile_url: string
  phone?: string
  postcode?: string
  address?: string
}> {
  return []
}
