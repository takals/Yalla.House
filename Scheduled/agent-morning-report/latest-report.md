---
generated: 2026-05-05T09:00:00+01:00
collector_run_at: 2026-05-03T00:11:00Z (2 days stale)
delivery_channel: fallback (Notion MCP unauthorized — token still invalid)
status: 🔴 collector did not run last night — last successful run was May 3
---

# Agent DB — Morning Report (May 5)

🔴 **Agent DB: collector didn't run last night**
Last known total (live DB): **17,016** | Email: **9,714** | Phone: **11,114**
The most recent `last-run.json` is from **2026-05-03 00:11 UTC** — two scheduled overnight runs (May 4 and May 5) appear to have been skipped.

## What the live DB shows right now
| Metric | Live (May 5) | Last report (May 3) | Δ |
|---|---:|---:|---:|
| total | 17,016 | 17,014 | +2 |
| with_email | 9,714 | 9,705 | +9 |
| with_phone | 11,114 | 11,110 | +4 |
| with_website | 4,536 | 4,536 | 0 |
| with_postcode | 16,243 | 16,243 | 0 |

The +2 agents and small enrichment deltas suggest something nudged the DB between May 3 and May 5 (perhaps a manual run, or a partial scheduled run that did not write `last-run.json`). It is **not** a full overnight collector cycle.

## Why no overnight run
The scheduled `agent-collector` task should write `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-collector/last-run.json` after each run. The current file's timestamp is `2026-05-03T00:11:00Z`, so neither the May 4 nor the May 5 overnight runs completed. Possible causes:

1. **Scheduled-task runner not firing** — worth checking the scheduled-tasks list to confirm `agent-collector` is still active and on a daily cadence.
2. **Edge function / Supabase outage at midnight UTC** — the May 3 run already had to recover from cold-start retries; a longer outage could have failed both subsequent runs silently.
3. **Sandbox auth drift** — host-Mac osascript path used to bypass the supabase.co proxy block may have lost permissions.

## Next-Run Starting Offsets (from May 3 run, unchanged)
- `scrape_propertymark`: **201**
- `enrich_propertymark`: **500**
- `enrich_cf_emails`: **500**

## Recurring Issue — SKILL.md Drift
Same flag as the Apr 29 report: agent-collector SKILL.md is still pinned to pages 1–200 for scraping. Three consecutive runs have produced 0 new inserts from that window. The dedupe is clean, but it's wasted edge-function budget. Recommended fix unchanged: have the collector read `next_run_start_page` from the previous report and increment automatically.

## Errors / Notes from last successful run (May 3)
- Phase 3 (`enrich-cf-emails`) saw empty initial responses on every batch but all 5 retried successfully after 30s — likely cold-start on the edge function instance.
- Phase 2 enrichment counter reports `withEmail = 0` even though DB delta showed +11 emails — emails are being decoded as a side-effect of the propertymark enrichment, not the dedicated CF-email phase. Worth fixing the counter for accurate reporting.

## Delivery Note
Notion MCP returned **401 unauthorized** (token still invalid — same state as Apr 29). Report written to workspace fallback. Tarek will **not** receive the Apple Watch ping until the Notion token is restored.

**Recommended actions:**
1. Investigate why `agent-collector` skipped May 4 and May 5 overnight slots — check `mcp__scheduled-tasks__list_scheduled_tasks` for status.
2. Restore Notion auth so future morning reports actually ping the watch.
3. Manually trigger a fresh agent-collector run today if continued data growth matters before the next scheduled slot.
