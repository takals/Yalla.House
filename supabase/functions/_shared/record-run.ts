// Shared helper used by the agent-collector orchestrator to record a finished run
// into agent_collector_runs. Drives the run-summary generator.
//
// The same JSON is still written to scheduled-runs/agent-collector-last-run.json
// for backwards compatibility with the legacy scheduled job.

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type SourceBreakdownEntry = {
  new: number
  enriched: number
  errors?: number
}

export type RunPayload = {
  run_kind?: 'scheduled' | 'manual' | 'backfill'
  new_agents_gb?: number
  new_agents_de?: number
  new_agents_other?: number
  enriched_count?: number
  new_emails?: number
  new_phones?: number
  new_websites?: number
  new_outcodes?: number
  sources_breakdown?: Record<string, SourceBreakdownEntry>
  errors?: string[]
  notes?: string[]
  next_offsets?: Record<string, number>
  full_payload?: Record<string, unknown>
}

/**
 * Insert one row into agent_collector_runs and update consecutive_zero_runs +
 * saturation_status on each contributing source. Returns the new run id.
 */
export async function recordRun(sb: SupabaseClient, payload: RunPayload): Promise<{ id: string }> {
  const { data, error } = await sb
    .from('agent_collector_runs')
    .insert({
      finished_at: new Date().toISOString(),
      run_kind: payload.run_kind ?? 'scheduled',
      new_agents_gb: payload.new_agents_gb ?? 0,
      new_agents_de: payload.new_agents_de ?? 0,
      new_agents_other: payload.new_agents_other ?? 0,
      enriched_count: payload.enriched_count ?? 0,
      new_emails: payload.new_emails ?? 0,
      new_phones: payload.new_phones ?? 0,
      new_websites: payload.new_websites ?? 0,
      new_outcodes: payload.new_outcodes ?? 0,
      sources_breakdown: payload.sources_breakdown ?? {},
      errors: payload.errors ?? [],
      notes: payload.notes ?? [],
      next_offsets: payload.next_offsets ?? {},
      full_payload: payload.full_payload ?? null,
    })
    .select('id')
    .single()
  if (error || !data) throw new Error(`recordRun failed: ${error?.message ?? 'no data'}`)

  // Update per-source saturation tracking
  const breakdown = payload.sources_breakdown ?? {}
  for (const [source, entry] of Object.entries(breakdown)) {
    const newCount = entry.new ?? 0
    // We can't know country_code from the source name alone (e.g. immoscout24 is DE-only,
    // tpo is GB-only) — the upsert is intentionally narrow on (source) and updates all
    // matching country rows. This is safe because each source is unique per country.
    if (newCount > 0) {
      await sb.from('agent_source_registry')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_new_count: newCount,
          consecutive_zero_runs: 0,
          saturation_status: 'productive',
        })
        .eq('source', source)
    } else {
      // Increment consecutive_zero_runs; mark saturated if it crosses 3
      const { data: cur } = await sb.from('agent_source_registry')
        .select('consecutive_zero_runs')
        .eq('source', source)
        .limit(1)
        .maybeSingle()
      const next = (cur?.consecutive_zero_runs ?? 0) + 1
      await sb.from('agent_source_registry')
        .update({
          last_run_at: new Date().toISOString(),
          last_run_new_count: 0,
          consecutive_zero_runs: next,
          saturation_status: next >= 3 ? 'saturated' : 'productive',
        })
        .eq('source', source)
    }
  }

  return { id: data.id as string }
}
