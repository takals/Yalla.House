// generate-run-summary — write last-run-summary.md from the latest agent_collector_runs row.
//
// POST { run_id?: string }   // defaults to latest run if no id passed
// Returns { success, markdown, storage_path }
//
// The markdown lands in Supabase Storage at agent-collector/last-run-summary.md,
// and an extra copy is appended at agent-collector/history/<run-started-at>.md.
//
// Same data also stamps a copy at scheduled-runs/last-run-summary.md in the repo
// when called from the local CLI wrapper (see scripts/agent-collector/run.sh).

import { client } from '../_shared/agent-upsert.ts'

type SourceContribution = {
  source: string
  country_code: string
  agents_observed: number
  new_in_last_run: number
  last_observation: string
}

type CountryHeadline = {
  country_code: string
  total_agents: number
  with_email: number
  with_phone: number
  with_website: number
  with_postcode: number
  with_coverage: number
  last_seen_any: string | null
}

type RunRow = {
  id: string
  started_at: string
  finished_at: string | null
  run_kind: string
  new_agents_gb: number
  new_agents_de: number
  new_agents_other: number
  enriched_count: number
  new_emails: number
  new_phones: number
  new_websites: number
  new_outcodes: number
  sources_breakdown: Record<string, { new: number; enriched: number; errors?: number }>
  errors: string[]
  notes: string[]
  next_offsets: Record<string, number>
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  let body: { run_id?: string } = {}
  try { body = await req.json() } catch { /* default */ }

  const sb = client()

  // 1. Pull the run row (latest if no id)
  let run: RunRow | null = null
  if (body.run_id) {
    const { data } = await sb.from('agent_collector_runs').select('*').eq('id', body.run_id).maybeSingle()
    run = data as RunRow | null
  } else {
    const { data } = await sb.from('agent_collector_runs').select('*').order('started_at', { ascending: false }).limit(1).maybeSingle()
    run = data as RunRow | null
  }
  if (!run) {
    return Response.json({ success: false, error: 'no run row found — has the collector been wired into agent_collector_runs yet?' }, { status: 404 })
  }

  // 2. Per-country headline (current state, not just this run)
  const { data: headlines } = await sb.from('agent_collector_country_headline').select('*')
  const headlineByCountry = new Map<string, CountryHeadline>()
  ;(headlines ?? []).forEach((h: CountryHeadline) => headlineByCountry.set(h.country_code, h))

  // 3. Source contribution this run
  const { data: contributions } = await sb.from('agent_collector_source_contribution').select('*')
  const byCountry = new Map<string, SourceContribution[]>()
  ;(contributions ?? []).forEach((c: SourceContribution) => {
    const list = byCountry.get(c.country_code) ?? []
    list.push(c)
    byCountry.set(c.country_code, list)
  })

  // 4. 7-run trend — total new agents per run, last 7
  const { data: recent } = await sb
    .from('agent_collector_runs')
    .select('started_at, new_agents_gb, new_agents_de, new_agents_other')
    .order('started_at', { ascending: false })
    .limit(7)
  const trend = (recent ?? []).map(r =>
    (r.new_agents_gb ?? 0) + (r.new_agents_de ?? 0) + (r.new_agents_other ?? 0)
  ).reverse()

  // 5. Saturation flags — sources with consecutive_zero_runs >= 3
  const { data: saturated } = await sb
    .from('agent_source_registry')
    .select('source, country_code, display_name, consecutive_zero_runs')
    .gte('consecutive_zero_runs', 3)
    .eq('enabled', true)

  // 6. Compose the markdown
  const md = renderSummary({ run, headlineByCountry, byCountry, trend, saturated: saturated ?? [] })

  // 7. Persist to Supabase Storage (overwrite the live copy + append to history)
  const storagePath = 'agent-collector/last-run-summary.md'
  const historyPath = `agent-collector/history/${run.started_at.replace(/[:.]/g, '-')}.md`
  const bucket = sb.storage.from('reports')
  await bucket.upload(storagePath, new Blob([md], { type: 'text/markdown' }), { upsert: true })
  await bucket.upload(historyPath, new Blob([md], { type: 'text/markdown' }), { upsert: false }).catch(() => {})

  return Response.json({ success: true, storage_path: storagePath, markdown: md })
})

function renderSummary(args: {
  run: RunRow
  headlineByCountry: Map<string, CountryHeadline>
  byCountry: Map<string, SourceContribution[]>
  trend: number[]
  saturated: Array<{ source: string; country_code: string; display_name: string; consecutive_zero_runs: number }>
}): string {
  const { run, headlineByCountry, byCountry, trend, saturated } = args
  const total = run.new_agents_gb + run.new_agents_de + run.new_agents_other
  const sign = total >= 0 ? '+' : ''
  const when = new Date(run.started_at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

  const countries: string[] = []
  for (const code of ['GB', 'DE'] as const) {
    const h = headlineByCountry.get(code)
    const n = code === 'GB' ? run.new_agents_gb : run.new_agents_de
    if (!h && n === 0) continue
    countries.push(
      `| ${code} | ${n >= 0 ? '+' : ''}${n} | ${h?.total_agents ?? 0} | ${h?.with_email ?? 0} | ${h?.with_coverage ?? 0} |`
    )
  }
  if (run.new_agents_other > 0) {
    countries.push(`| Other | +${run.new_agents_other} | — | — | — |`)
  }

  const sourceRows: string[] = []
  for (const [country, list] of byCountry.entries()) {
    list.sort((a, b) => b.new_in_last_run - a.new_in_last_run)
    for (const s of list) {
      const breakdownEntry = run.sources_breakdown?.[s.source]
      sourceRows.push(
        `| ${country} | ${s.source} | ${s.new_in_last_run > 0 ? '+' : ''}${s.new_in_last_run} | ${breakdownEntry?.enriched ?? 0} | ${breakdownEntry?.errors ?? 0} |`
      )
    }
  }

  const trendArrow = trendSparkline(trend)
  const trendLine = trend.length
    ? `New agents per run (last ${trend.length}): ${trend.join(', ')}  ${trendArrow}`
    : 'No prior runs yet.'

  const saturationLines = saturated.length
    ? saturated.map(s => `- \`${s.source}\` (${s.country_code}) — ${s.consecutive_zero_runs} consecutive zero-new runs. Consider advancing offset or retiring.`).join('\n')
    : '- None — all enabled sources still productive.'

  const nextOffsets = Object.entries(run.next_offsets ?? {})
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n') || '- (none set)'

  const errors = run.errors?.length
    ? run.errors.map(e => `- ${e}`).join('\n')
    : '- (no errors)'

  const notes = run.notes?.length
    ? run.notes.map(n => `- ${n}`).join('\n')
    : '- (no notes)'

  return `# Agent collector — ${when}

## Headline
**${sign}${total} new agents this run** · ${run.enriched_count} enriched · ${run.new_emails} new emails · ${run.new_phones} new phones

## By country
| Country | New this run | Total | With email | With coverage |
|--|--|--|--|--|
${countries.join('\n') || '| — | — | — | — | — |'}

## By source (this run)
| Country | Source | New | Enriched | Errors |
|--|--|--|--|--|
${sourceRows.join('\n') || '| — | — | — | — | — |'}

## Trend
${trendLine}

## Saturation flags
${saturationLines}

## Next-run starting offsets
${nextOffsets}

## Errors
${errors}

## Notes
${notes}
`
}

function trendSparkline(trend: number[]): string {
  if (trend.length < 2) return ''
  const last = trend[trend.length - 1]
  const prev = trend[trend.length - 2]
  if (last > prev) return '↑ trending up'
  if (last < prev) return '↓ trending down'
  return '→ flat'
}
