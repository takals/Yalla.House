---
run_date: 2026-05-07
collector_run_at: 2026-05-05T23:27:22Z (STALE — ~33h old)
notion_status: FAILED — API token unauthorized (401). Fallback file used.
---

# Agent DB — Morning Report (2026-05-07)

**Status:** 🔴 Collector did NOT run last night. Notion ping blocked (auth still broken).

## Headline (Apple Watch summary)

```
🔴 Agent DB: collector didn't run last night
Last known total: 17,018
Pipeline last logged 2026-05-05 23:27 UTC.
Notion auth still broken — manual review needed.
```

## Live DB stats (queried 2026-05-07 09:00)

| Metric | Count |
|---|---|
| Total agents | **17,018** |
| With email | 9,717 |
| With phone | 11,119 |
| With website | 4,536 |
| With postcode | 16,243 |

Filter: `data_source = 'propertymark'`

## What I checked

1. `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-collector/last-run.json` — last write **2026-05-05T23:27:22Z**, ~33 hours stale. Expected a fresh write from the 2026-05-06 night run; none exists.
2. Live DB query — totals show **+1 agent, +2 emails, +2 phones** vs the last logged snapshot (17,017→17,018, 9,715→9,717, 11,117→11,119). Tiny drift, likely a partial run or stray write that didn't update the log.

## Drift since last logged run (2026-05-05)

- Agents: 17,017 → **17,018** (+1)
- Emails: 9,715 → **9,717** (+2)
- Phones: 11,117 → **11,119** (+2)
- Websites: 4,536 → 4,536 (no change)
- Postcodes: 16,243 → 16,243 (no change)

Movement is small enough that it could be a manual edit or a partial enrichment run. The scheduled nightly job did NOT produce a results file.

## Suggested next actions

1. **Notion auth:** still 401 unauthorized. This matches `project_notion_down.md` — needs reconnect before morning pings resume reaching the Apple Watch.
2. **Collector status:** check the scheduled-task logs for the 2026-05-06 midnight run of `agent-collector` — figure out why no `last-run.json` was written. May need a manual retrigger.
3. **When pipeline resumes:** bump next offsets per the 2026-05-05 file:
   - Scrape: next page **201**
   - Enrich Propertymark: offset **490**
   - Enrich CF emails: offset **415**

## Notion delivery — REQUIRES MANUAL REVIEW

Notion MCP returned `401 unauthorized`. The API token is still invalid/expired (matches `project_notion_down.md`). Morning ping was NOT delivered to Notion. Please:

1. Re-authenticate the Notion connector, or
2. Copy the headline block above and post it manually to the Master To-Do List / Agent Database page.

## Reference: last successful run (2026-05-05)

- New agents: 1 across pages 1–200
- Profiles enriched: 477
- CF emails decoded: 0
- Errors: 6× pg_net timeouts on initial large batches; recovered via smaller parallel batches.
