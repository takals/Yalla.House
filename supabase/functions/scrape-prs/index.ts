// scrape-prs — Property Redress (formerly PRS) member sweeper.
// POST { "country_code": "GB", "offset": 0, "limit": 100 }
// Returns { success, fetched, inserted, updated, errors, nextOffset, done }
//
// Source: https://www.propertyredress.co.uk/agent-finder (rebranded from theprs.co.uk)
// Backing API discovered 2026-07-19:
//   https://www.portal.propertyredress.co.uk/propertyagent/GetMemberByAPI?companyName=&postcode=&status=&page=N
// Returns JSON arrays of 10 members per page with company name, contact name,
// address, postcode, phone and email — no HTML parsing or CF decoding needed.
// ~20,000 members total (per their site), so ~2,000 pages.
//
// This repo file is the source of truth for the deployed `scrape-prs` edge
// function. It was briefly out of sync (a stub that returned []) — keep them
// in lockstep; a deploy from an older stub silently disables this source.

import { client, upsertAgent } from '../_shared/agent-upsert.ts'

const API_BASE =
  'https://www.portal.propertyredress.co.uk/propertyagent/GetMemberByAPI'
const PAGE_SIZE = 10

type PrMember = {
  fdId: number
  fdCompanyName: string | null
  fdFirstName: string | null
  fdLastName: string | null
  fdCorrespondanceAddressLine1: string | null
  fdCorrespondanceAddressLine2: string | null
  fdPostCode: string | null
  fdTelephoneNo: string | null
  fdEmail: string | null
  fdRegisteredCoNo: string | null
  fdWorkType: string | null
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { country_code?: string; offset?: number; limit?: number }
  try { body = await req.json() } catch { body = {} }

  const country_code = (body.country_code ?? 'GB').toUpperCase()
  const offset = body.offset ?? 0
  const limit = body.limit ?? 100

  if (country_code !== 'GB') {
    return Response.json(
      { success: false, error: `Property Redress is GB-only, got ${country_code}` },
      { status: 400 }
    )
  }

  const sb = client()
  const errors: string[] = []
  let fetched = 0
  let inserted = 0
  let updated = 0
  let sawShortPage = false

  const startPage = Math.floor(offset / PAGE_SIZE) + 1
  const endPage = Math.ceil((offset + limit) / PAGE_SIZE)

  for (let page = startPage; page <= endPage; page++) {
    try {
      const url = `${API_BASE}?companyName=&postcode=&status=&page=${page}`
      const resp = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'YallaHouseAgentBot/1.0 (+contact@yalla.house)',
        },
      })
      if (!resp.ok) {
        errors.push(`page ${page}: HTTP ${resp.status}`)
        continue
      }
      const records = (await resp.json()) as PrMember[]
      if (!Array.isArray(records)) {
        errors.push(`page ${page}: unexpected response shape`)
        continue
      }
      if (records.length < PAGE_SIZE) sawShortPage = true

      for (const rec of records) {
        const contactName = [rec.fdFirstName, rec.fdLastName]
          .map((s) => (s ?? '').trim())
          .filter(Boolean)
          .join(' ')
        const name = (rec.fdCompanyName ?? '').trim() || contactName
        if (!name) continue
        fetched++
        try {
          const out = await upsertAgent(sb, {
            agency_name: name,
            country_code: 'GB',
            source: 'prs',
            source_id: String(rec.fdId),
            source_url: 'https://www.propertyredress.co.uk/agent-finder',
            email: cleanEmail(rec.fdEmail),
            phone: (rec.fdTelephoneNo ?? '').trim() || null,
            postcode: (rec.fdPostCode ?? '').trim().toUpperCase() || null,
            raw_address: [rec.fdCorrespondanceAddressLine1, rec.fdCorrespondanceAddressLine2]
              .map((s) => (s ?? '').trim())
              .filter(Boolean)
              .join(', ') || null,
            branch_manager: contactName || null,
            service_types: rec.fdWorkType ? [rec.fdWorkType] : null,
            raw_payload: rec as unknown as Record<string, unknown>,
          })
          if (out.inserted) inserted++
          else updated++
        } catch (e) {
          errors.push(`upsert ${name}: ${(e as Error).message}`)
        }
      }

      await sleep(400)
      if (records.length === 0) break // past the end of the directory
    } catch (e) {
      errors.push(`page ${page}: ${(e as Error).message}`)
    }
  }

  const nextOffset = offset + fetched
  const done = sawShortPage
  return Response.json({
    success: true,
    country_code,
    fetched,
    inserted,
    updated,
    errors,
    nextOffset,
    done,
  })
})

function cleanEmail(e: string | null): string | null {
  const v = (e ?? '').trim().toLowerCase()
  return v && v.includes('@') ? v : null
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
