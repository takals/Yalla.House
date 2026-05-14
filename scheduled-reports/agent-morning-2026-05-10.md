---
run_date: 2026-05-10
collector_run_at: 2026-05-05T23:27:22Z (STALE — 5 days old)
notion_status: FAILED — API token unauthorized (401). Fallback file used.
---

# Agent DB — Morning Report (2026-05-10)

🔴 **Status: Collector hasn't run since 2026-05-05** — overnight pipeline appears to have stopped firing.

## Apple Watch summary (paste to Notion when auth is back)

```
🔴 Agent DB: collector silent for 5 days
Last known run: 2026-05-05 (17,017 → 17,017)
Total now: 17,044 | Email: 10,077 | Phone: 11,156
Check scheduled tasks — may need manual trigger.
```

## Live DB stats (queried 2026-05-10)

| Metric | Count |
|---|---|
| Total agents | 17,044 |
| With email | 10,077 |
| With phone | 11,156 |
| With website | 4,538 |
| With postcode | 16,245 |

## Last collector snapshot (2026-05-05 23:27 UTC)

- New agents that run: 1 (17,016 → 17,017)
- Profiles enriched: 477
- CF emails decoded: 0
- Errors: 4× pg_net timeouts (recovered with smaller parallel batches)

## Drift since last collector run

| Metric | May 5 snapshot | Today | Delta |
|---|---|---|---|
| Total agents | 17,017 | 17,044 | **+27** |
| With email | 9,715 | 10,077 | **+362** |
| With phone | 11,117 | 11,156 | +39 |
| With website | 4,536 | 4,538 | +2 |
| With postcode | 16,243 | 16,245 | +2 |

The +362 emails over 5 days suggests *something* is running (manual triggers? partial runs?), but the automated overnight job is not refreshing `last-run.json`.

## Action items

1. Check scheduled-tasks list — confirm `agent-collector` midnight task is still enabled.
2. Trigger it manually and verify a fresh `last-run.json` is written.
3. Restore Notion auth so morning pings resume on phone/Apple Watch.

## Resume parameters (from last successful run)

| Phase | Resume at |
|---|---|
| Scrape (Propertymark) | page **201** |
| Enrich Propertymark profiles | offset **490** |
| Enrich CF emails | offset **415** |

## Notes

- Notion MCP returned `401 unauthorized` (still broken since the email switch — see `project_notion_down.md`). Morning ping was NOT delivered to Notion.
- Original spec'd fallback path `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-morning-report/latest-report.md` is outside the sandbox's connected folders, so Write can't reach it. This copy lives inside the Yalla.House workspace instead (auto-syncs to Drive).
