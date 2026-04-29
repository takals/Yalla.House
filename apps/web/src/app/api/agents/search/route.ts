import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// ─── UK Postcode Normalisation ────────────────────────────────────────────────
function normalisePostcode(input: string) {
  const raw = input.replace(/\s+/g, '').toUpperCase()

  // Full UK postcode
  const fullMatch = raw.match(/^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/)
  if (fullMatch) {
    const outcode = fullMatch[1]!
    const area = outcode.replace(/\d.*$/, '')
    return { full: `${outcode} ${fullMatch[2]}`, outcode, area, valid: true }
  }

  // Partial (outcode): "IG2", "SW1A", "E1"
  const partialMatch = raw.match(/^([A-Z]{1,2}\d[A-Z\d]?)$/)
  if (partialMatch) {
    const outcode = partialMatch[1]!
    const area = outcode.replace(/\d.*$/, '')
    return { full: outcode, outcode, area, valid: true }
  }

  // Area only: "IG", "SW", "E"
  const areaMatch = raw.match(/^([A-Z]{1,2})$/)
  if (areaMatch) {
    return { full: areaMatch[1]!, outcode: areaMatch[1]!, area: areaMatch[1]!, valid: true }
  }

  return { full: raw, outcode: raw, area: raw, valid: false }
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
    phone: agent.phone,
    email: agent.email,
    website: agent.website,
    source: agent.data_source,
    sourceUrl: agent.source_url,
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

  // ── Tier 1: exact district match ──────────────────────────────────────────
  const { data: districtAgents } = await (supabase as any)
    .from('agent_profiles')
    .select(AGENT_SELECT)
    .like('postcode', `${parsed.outcode}%`)
    .order('verified_at', { ascending: false, nullsFirst: false })
    .limit(limit)

  let results: ReturnType<typeof formatAgent>[] =
    ((districtAgents ?? []) as AgentRow[]).map(a => formatAgent(a, 'exact_district', 95))

  // ── Tier 2: same area (if not enough or radius allows) ────────────────────
  if (results.length < limit && radiusTier !== 'district') {
    const existingIds = new Set(results.map(r => r.id))

    const { data: areaAgents } = await (supabase as any)
      .from('agent_profiles')
      .select(AGENT_SELECT)
      .like('postcode', `${parsed.area}%`)
      .order('verified_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    const areaResults = ((areaAgents ?? []) as AgentRow[])
      .filter(a => !existingIds.has(a.user_id))
      .map(a => formatAgent(a, 'same_area', 80))

    results = [...results, ...areaResults].slice(0, limit)
  }

  // ── Tier 3: wide search (neighbouring areas) ─────────────────────────────
  if (results.length < 10 && radiusTier === 'wide') {
    const existingIds = new Set(results.map(r => r.id))

    // Get agents who list this area in their coverage_areas JSONB
    const { data: coverageAgents } = await (supabase as any)
      .from('agent_profiles')
      .select(AGENT_SELECT)
      .or(`postcode.like.${parsed.area}%`)
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
    },
  })
}
