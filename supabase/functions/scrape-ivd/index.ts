// scrape-ivd — IVD Maklerverband member directory sweeper (Germany).
// POST { "country_code": "DE", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://ivd.net/maklersuche/
// IVD is Germany's primary estate-agent trade body (~6K members, sales-heavy).
// The Maklersuche is an AJAX-backed search; the JSON endpoint follows the pattern
//   POST https://ivd.net/wp-admin/admin-ajax.php  action=ivd_search&page=N
// returning { items: [{ name, address, plz, ort, phone, email, website, member_id }] }
//
// Parser is left as TODO — fill in after capturing one request payload from the live site.
// The wiring above is identical to scrape-tpo so the same orchestration handles it.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const IVD_AJAX = 'https://ivd.net/wp-admin/admin-ajax.php'
const PAGE_SIZE = 20

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'DE').toUpperCase()
  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 100

  if (country_code !== 'DE') {
    return Response.json({ success: false, error: `IVD is DE-only, got ${country_code}` }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage   = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      const form = new URLSearchParams({ action: 'ivd_search', page: String(page) })
      const resp = await fetch(IVD_AJAX, {
        method: 'POST',
        headers: {
          'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: form.toString(),
      })
      if (!resp.ok) { errors.push(`page ${page}: HTTP ${resp.status}`); continue }
      const payload = await resp.json().catch(() => null) as { items?: unknown[] } | null

      // TODO: shape mapping after capturing a real response. Expected fields per item:
      //   name, member_id, plz (5-digit), ort (town), phone, email, website, address
      const records = parseIvdResponse(payload)

      for (const rec of records) {
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name:  rec.name,
            country_code: 'DE',
            source:       'ivd',
            source_id:    rec.member_id,
            source_url:   `https://ivd.net/maklersuche/?mid=${rec.member_id}`,
            postcode:     rec.plz ?? null,
            email:        rec.email ?? null,
            phone:        rec.phone ?? null,
            website:      rec.website ?? null,
            raw_address:  rec.address ?? null,
            service_types: ['sales', 'lettings'],
            raw_payload:  rec,
          })
          if (out.inserted) inserted++; else updated++
        } catch (e) {
          errors.push(`upsert ${rec.name}: ${(e as Error).message}`)
        }
      }

      await sleep(500) // polite — IVD's WP backend doesn't love hammering
    } catch (e) {
      errors.push(`page ${page}: ${(e as Error).message}`)
    }
  }

  const nextOffset = offset + fetched
  const done = fetched < limit
  return Response.json({ success: true, country_code, fetched, inserted, updated, errors, nextOffset, done })
})

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// PLACEHOLDER — fill in after capturing one real ivd_search AJAX response.
// IVD's Maklersuche uses WordPress admin-ajax with a JSON `items` array.
function parseIvdResponse(_payload: { items?: unknown[] } | null):
  Array<{ name: string; member_id: string; plz?: string; ort?: string; phone?: string; email?: string; website?: string; address?: string }>
{
  return []
}
