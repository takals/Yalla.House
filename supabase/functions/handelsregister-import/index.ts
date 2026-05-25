// handelsregister-import — Bulk importer for the German Handelsregister (DE equivalent of
// Companies House SIC 68310). Filters by WZ2008 code 68.31 ("Vermittlung von Grundstücken,
// Gebäuden und Wohnungen für Dritte").
//
// POST { "country_code": "DE", "snapshot_path": "handelsregister/2026-05-23.json.gz" }
// Returns { success, fetched, inserted, updated, errors }
//
// Strategy:
//   1. Drop a Handelsregister snapshot (sourced from OffeneRegister.de or the official
//      bulk export) into Supabase Storage at `imports/{snapshot_path}`.
//   2. This function streams the snapshot, filters by Wirtschaftszweig 68.31, and upserts
//      each matching legal entity via the shared agent-upsert helper.
//
// Why a snapshot, not the live Handelsregister API?
//   - Handelsregister.de has no bulk API and aggressive rate limits.
//   - OffeneRegister publishes a free monthly snapshot of the entire register.
//   - Bundesanzeiger publishes financial filings — joinable on Handelsregister number.
//
// Parser is left as TODO — fill in after capturing one OffeneRegister snapshot row.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; snapshot_path?: string; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'DE').toUpperCase()
  const snapshot_path = body.snapshot_path
  const limit = body.limit ?? 5000

  if (country_code !== 'DE') {
    return Response.json({ success: false, error: `Handelsregister is DE-only, got ${country_code}` }, { status: 400 })
  }
  if (!snapshot_path) {
    return Response.json({ success: false, error: 'snapshot_path is required (path inside the imports/ bucket)' }, { status: 400 })
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0, inserted = 0, updated = 0

  // Pull the snapshot from Storage
  const { data: blob, error: dlErr } = await sb.storage.from('imports').download(snapshot_path)
  if (dlErr || !blob) {
    return Response.json({ success: false, error: `download failed: ${dlErr?.message ?? 'no blob'}` }, { status: 500 })
  }

  // Parse — expect newline-delimited JSON (OffeneRegister export format).
  // Each line is a legal entity; we filter by WZ code prefix.
  const text = await blob.text()
  const lines = text.split('\n').filter(l => l.trim())

  for (const line of lines) {
    if (fetched >= limit) break
    try {
      const row = JSON.parse(line) as HandelsregisterRow

      // TODO: confirm field name after inspecting one snapshot row.
      // OffeneRegister names it `wirtschaftszweig` or `branche`; might be a code or a free-text branch.
      const wz = (row.wirtschaftszweig ?? row.branche ?? '').toString()
      if (!wz.startsWith('68.31') && !wz.startsWith('68.32')) continue

      fetched++
      const out = await upsertAgent(sb, {
        agency_name:  row.name,
        country_code: 'DE',
        source:       'handelsregister',
        source_id:    row.registernummer ?? row.id ?? row.name,
        source_url:   row.url ?? null,
        postcode:     row.postleitzahl ?? null,
        raw_address:  row.adresse ?? null,
        raw_payload:  row as unknown as Record<string, unknown>,
      })
      if (out.inserted) inserted++; else updated++
    } catch (e) {
      errors.push(`line: ${(e as Error).message}`)
      if (errors.length > 50) {
        errors.push('aborting — > 50 parse errors')
        break
      }
    }
  }

  return Response.json({ success: true, country_code, fetched, inserted, updated, errors })
})

type HandelsregisterRow = {
  name: string
  registernummer?: string
  id?: string
  url?: string
  postleitzahl?: string
  adresse?: string
  wirtschaftszweig?: string
  branche?: string
  [k: string]: unknown
}
