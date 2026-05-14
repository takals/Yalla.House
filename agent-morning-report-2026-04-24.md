# Agent DB Morning Report — 2026-04-24

**Status:** Needs manual review — Notion MCP unauthorized (token invalid), could not ping phone.

## Live DB stats (propertymark, live from Supabase)

| Metric | Count |
|---|---|
| Total agents | 17,000 |
| With email | 9,402 |
| With phone | 10,993 |
| With website | 4,528 |
| With postcode | 16,243 |

## Overnight collector run

The collector's `last-run.json` at `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-collector/last-run.json` was **not accessible** from this scheduled task's folder scope (outside connected folders). Cannot confirm whether the collector ran last night or what it found.

Live DB shows a flat 17,000 total, which matches the last known figure. Two possibilities:

1. **Clean run, no new agents** — collector ran successfully, found only duplicates on re-scrape. Pipeline healthy.
2. **Collector didn't run / errored** — may need manual trigger. Check scheduled tasks.

## Blockers for this report

- **Notion MCP returned 401 unauthorized.** The Notion token needs re-authentication — matches the known "Notion temporarily down — email switch broke auth" state in memory. Until that's fixed, morning reports can't ping Apple Watch.
- **Scheduled task folder scope excludes `/Users/tarekalsaleh/Documents/Claude/Scheduled/`.** The task reads from there but the scheduled-run sandbox only sees the selected project folder. Either widen the scope or store `last-run.json` inside the Yalla.House workspace.

## Action items

1. Re-authenticate Notion MCP (see `mcp__plugin_productivity_notion__authenticate`).
2. Verify overnight agent-collector ran — inspect `last-run.json` directly.
3. Consider moving `last-run.json` into `/Users/tarekalsaleh/Desktop/Yalla.House/.claude/` so the morning report can read it within the session folder scope.
