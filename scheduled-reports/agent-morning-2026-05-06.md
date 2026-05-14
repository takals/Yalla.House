---
run_date: 2026-05-06
collector_run_at: 2026-05-05T23:27:22Z
notion_status: FAILED — API token unauthorized (401). Fallback file used.
fallback_note: Original fallback path /Users/tarekalsaleh/Documents/Claude/Scheduled/agent-morning-report/ was not in the session's mounted folders; wrote here instead.
---

# Agent DB — Morning Report (2026-05-06)

**Status:** Pipeline ran clean overnight. 1 new agent discovered, 477 profiles enriched.

## Headline (Apple Watch summary)

```
🟢 Agent DB: +1 new overnight
Total: 17,017 | Email: 9,715 | Phone: 11,117
Enriched: 477 profiles | Emails decoded: 0
```

## Live DB stats (queried 2026-05-06 09:00)

| Metric | Count | Coverage |
|---|---|---|
| Total agents | 17,017 | — |
| With email | 9,715 | 57.1% |
| With phone | 11,117 | 65.3% |
| With website | 4,536 | 26.7% |
| With postcode | 16,243 | 95.5% |

Live snapshot matches the post-run totals exactly — no drift since the collector finished.

## Overnight collector run (2026-05-05 23:27 UTC)

- New agents: **1** (17,016 → 17,017)
- Profiles enriched: 477
- CF emails decoded: 0
- DB deltas: +1 email, +3 phones, +0 websites, +0 postcodes

## Phase progress + next-run starting offsets

| Phase | This run | Next run starts at |
|---|---|---|
| Scrape (Propertymark) | 200 pages, 1 inserted | page **201** |
| Enrich Propertymark profiles | 477 processed, 477 enriched | offset **490** |
| Enrich CF emails | 415 processed, 0 found | offset **415** |

## Errors / notes

Several pg_net timeouts hit during the run — all recovered with smaller batch sizes:

- Scrape pages 1–50 timed out at 55s (req 359) — recovered with 25-page parallel batches
- Enrich offsets 0/50 limit 50 timed out at 90s (reqs 369–370) — recovered with limit 10/15
- Enrich-cf-emails offsets 0/100/200/300/400 limit 100 timed out at 90s (reqs 404–408) — recovered with 15/25-profile batches

No catastrophic failures. Heavy parallelism (6–10 simultaneous pg_net calls) is the working pattern. Function reported 0 new emails/websites but DB delta shows +1 email, +3 phones — same enrichment side-effect within `enrich-propertymark` seen on previous runs.

## Recommendations

- **Pages 1–200 are saturated** — only 1 new agent across 2,000 listings re-scraped. Future runs should sample deeper page ranges to find new agents.
- **CF decoder returning zero** across 415 candidates — may be safe to deprioritise this phase, or shift its starting offset much higher to find undecoded records.

## Notion delivery — REQUIRES MANUAL REVIEW

Notion MCP returned `401 unauthorized` — the API token is invalid/expired. This matches the existing memory note (`project_notion_down.md` — email switch broke Notion auth). The morning ping was NOT delivered to Notion. Please:

1. Re-authenticate the Notion connector, or
2. Copy the headline block above and post manually to the Master To-Do List or Agent Database page.

## Path note

The scheduled task expects fallback files at `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-morning-report/latest-report.md`. That folder is not in this session's mounted directories, so this report is at:

`Yalla.House/scheduled-reports/agent-morning-2026-05-06.md`

If you want the original Documents path to keep working for scheduled runs, mount that folder in your Cowork session config, or update the SKILL.md fallback path to point inside Yalla.House.
