// companies-house-import — load Companies House SIC 68310 (real estate agencies) records.
// POST { "country_code": "GB", "snapshot_url"?: string, "offset": 0, "limit": 1000 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://download.companieshouse.gov.uk/en_output.html  (free monthly bulk CSV)
// Strategy: download the monthly snapshot once, store in Supabase Storage, then this
// function streams rows out of the stored file and upserts those with sic_code starting
// with '6831' (real estate agencies) or '6832' (property managers).

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const SIC_PREFIXES = ['68310', '68320'] // real estate agencies + property managers

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; snapshot_url?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  if (country_code !== 'GB') {
    return Response.json({ success: false, error: `Companies House is GB-only, got ${country_code}` }, { status: 400 })
  }

  const offset = body.offset ?? 0
  const limit  = body.limit  ?? 1000
  const sb = client()

  // TODO: stream rows from Storage object 'datasets/companies-house/BasicCompanyData.csv'
  // (loaded via a separate one-off uploader). Filter by SIC, slice [offset .. offset+limit].
  const rows: Array<{
    company_number: string
    company_name: string
    sic_codes: string[]
    address_line1?: string
    address_line2?: string
    post_code?: string
    company_status?: string
  }> = []

  let fetched = 0, inserted = 0, updated = 0
  const errors: string[] = []

  for (const r of rows) {
    if (!r.sic_codes.some(s => SIC_PREFIXES.some(p => s.startsWith(p)))) continue
    if (r.company_status && r.company_status !== 'Active') continue
    fetched++
    try {
      const out = await upsertAgent(sb, {
        agency_name:  r.company_name,
        country_code: 'GB',
        source:       'companies_house',
        source_id:    r.company_number,
        source_url:   `https://find-and-update.company-information.service.gov.uk/company/${r.company_number}`,
        postcode:     r.post_code ?? null,
        raw_address:  [r.address_line1, r.address_line2].filter(Boolean).join(', ') || null,
        raw_payload:  r,
      })
      if (out.inserted) inserted++; else updated++
    } catch (e) {
      errors.push(`upsert ${r.company_number}: ${(e as Error).message}`)
    }
  }

  return Response.json({
    success: true,
    country_code,
    fetched, inserted, updated, errors,
    nextOffset: offset + fetched,
    done: fetched < limit,
  })
})
