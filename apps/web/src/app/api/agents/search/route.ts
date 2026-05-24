import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// ─── Postcode Normalisation (UK + DE) ────────────────────────────────────────
type PostcodeFormat = 'uk' | 'de'

interface ParsedPostcode {
  full: string
  outcode: string  // UK: "SW1A", DE: "101" (first 3 digits)
  area: string     // UK: "SW", DE: "10" (first 2 digits → region)
  valid: boolean
  format: PostcodeFormat | 'unknown'
}

function normalisePostcode(input: string): ParsedPostcode {
  const raw = input.replace(/\s+/g, '').toUpperCase()

  // ── German PLZ: exactly 5 digits (e.g. "10115", "80331", "20095") ──
  const dePlz = raw.match(/^(\d{5})$/)
  if (dePlz) {
    const plz = dePlz[1]!
    return {
      full: plz,
      outcode: plz.slice(0, 3),   // "101" — district-level
      area: plz.slice(0, 2),       // "10" — region-level (Berlin=10, München=80)
      valid: true,
      format: 'de',
    }
  }

  // ── German partial: 2-3 digits (region/district prefix) ──
  const dePart = raw.match(/^(\d{2,3})$/)
  if (dePart) {
    const digits = dePart[1]!
    return {
      full: digits,
      outcode: digits.length >= 3 ? digits : digits,
      area: digits.slice(0, 2),
      valid: true,
      format: 'de',
    }
  }

  // ── UK: Full postcode (e.g. "SW1A 1AA") ──
  const fullMatch = raw.match(/^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/)
  if (fullMatch) {
    const outcode = fullMatch[1]!
    const area = outcode.replace(/\d.*$/, '')
    return { full: `${outcode} ${fullMatch[2]}`, outcode, area, valid: true, format: 'uk' }
  }

  // ── UK: Partial outcode (e.g. "IG2", "SW1A", "E1") ──
  const partialMatch = raw.match(/^([A-Z]{1,2}\d[A-Z\d]?)$/)
  if (partialMatch) {
    const outcode = partialMatch[1]!
    const area = outcode.replace(/\d.*$/, '')
    return { full: outcode, outcode, area, valid: true, format: 'uk' }
  }

  // ── UK: Area only (e.g. "IG", "SW", "E") ──
  const areaMatch = raw.match(/^([A-Z]{1,2})$/)
  if (areaMatch) {
    return { full: areaMatch[1]!, outcode: areaMatch[1]!, area: areaMatch[1]!, valid: true, format: 'uk' }
  }

  return { full: raw, outcode: raw, area: raw, valid: false, format: 'unknown' }
}

// Map postcode format to country_code for DB filtering
function countryFromFormat(format: PostcodeFormat | 'unknown'): string | null {
  switch (format) {
    case 'uk': return 'GB'
    case 'de': return 'DE'
    default: return null
  }
}

// ─── Agent Row Shape ──────────────────────────────────────────────────────────
interface AgentRow {
  user_id: string
  agency_name: string | null
  phone: string | null
  email: string | null
  website: string | null
  postcode: string | null
  raw_address: string | null
  data_source: string | null
  source_url: string | null
  service_types: string[] | null
  property_types: string[] | null
  verified_at: string | null
  branch_manager: string | null
  focus: string | null
  portal_presence: string[] | null
}

function formatAgent(agent: AgentRow, matchType: string, baseScore: number) {
  let score = baseScore
  if (agent.verified_at) score = Math.min(100, score + 3)
  if (agent.email) score = Math.min(100, score + 1)
  if (agent.phone) score = Math.min(100, score + 1)

  return {
    id: agent.user_id,
    agencyName: agent.agency_name ?? 'Unknown Agency',
    branchManager: agent.branch_manager,
    address: agent.raw_address,
    postcode: agent.postcode,
    // PII: email + phone redacted from search results — only exposed via invite flow
    hasEmail: !!agent.email,
    hasPhone: !!agent.phone,
    website: agent.website,
    source: agent.data_source,
    verifiedAt: agent.verified_at,
    serviceTypes: agent.service_types ?? [],
    propertyTypes: agent.property_types ?? [],
    portalPresence: agent.portal_presence ?? [],
    focus: agent.focus,
    matchScore: score,
    matchType,
  }
}

const AGENT_SELECT = `
  user_id, agency_name, phone, email, website, postcode, raw_address,
  data_source, source_url, service_types, property_types,
  verified_at, branch_manager, focus, portal_presence
`

export async function GET(request: NextRequest) {
  // ── Auth gate — only authenticated users can search agents ───────────
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const postcodeInput = searchParams.get('postcode') ?? ''
  const radiusTier = searchParams.get('radius') ?? 'area'
  const limitParam = searchParams.get('limit') ?? '50'

  if (!postcodeInput.trim()) {
    return NextResponse.json({ agents: [], meta: { total: 0, query: '', radius: radiusTier, error: 'no_postcode' } })
  }

  const parsed = normalisePostcode(postcodeInput)
  if (!parsed.valid) {
    return NextResponse.json({ agents: [], meta: { total: 0, query: postcodeInput, radius: radiusTier, error: 'invalid_postcode' } })
  }

  const supabase = createServiceClient()
  const limit = Math.min(parseInt(limitParam) || 50, 200)
  const countryCode = countryFromFormat(parsed.format)

  // Helper: apply country_code filter when we can detect it from the postcode
  function withCountry(query: any) {
    return countryCode ? query.eq('country_code', countryCode) : query
  }

  // ── Tier 1: exact district match ──────────────────────────────────────────
  const { data: districtAgents } = await withCountry(
    (supabase as any)
      .from('agent_profiles')
      .select(AGENT_SELECT)
      .ilike('postcode', `${parsed.outcode}%`)
  )
    .order('verified_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  let results: ReturnType<typeof formatAgent>[] =
    ((districtAgents ?? []) as AgentRow[]).map(a => formatAgent(a, 'exact_district', 95))

  // ── Tier 2: same area (if not enough or radius allows) ────────────────────
  if (results.length < limit && radiusTier !== 'district') {
    const existingIds = new Set(results.map(r => r.id))

    const { data: areaAgents } = await withCountry(
      (supabase as any)
        .from('agent_profiles')
        .select(AGENT_SELECT)
        .ilike('postcode', `${parsed.area}%`)
    )
      .order('verified_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    const areaResults = ((areaAgents ?? []) as AgentRow[])
      .filter(a => !existingIds.has(a.user_id))
      .map(a => formatAgent(a, 'same_area', 80))

    results = [...results, ...areaResults].slice(0, limit)
  }

  // ── Tier 3: wide search — coverage_postcodes array or all agents in country ─
  if (results.length < 10 && radiusTier === 'wide') {
    const existingIds = new Set(results.map(r => r.id))

    // Search agents whose coverage_postcodes array contains the searched area,
    // OR who have no postcode (national agencies). This is genuinely wider than
    // tier 2 because coverage_postcodes can include areas the agent isn't based in.
    const coverageFilter = `coverage_postcodes.cs.{${parsed.area}},coverage_postcodes.cs.{${parsed.outcode}}`
    const { data: coverageAgents } = await withCountry(
      (supabase as any)
        .from('agent_profiles')
        .select(AGENT_SELECT)
        .or(coverageFilter)
    )
      .order('verified_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    const coverageResults = ((coverageAgents ?? []) as AgentRow[])
      .filter(a => !existingIds.has(a.user_id))
      .map(a => formatAgent(a, 'coverage_match', 70))

    results = [...results, ...coverageResults].slice(0, limit)
  }

  return NextResponse.json({
    agents: results,
    meta: {
      total: results.length,
      query: parsed.full,
      area: parsed.area,
      district: parsed.outcode,
      radius: radiusTier,
      country: countryCode,
      format: parsed.format,
    },
  })
}
