# Agent DB — Morning Report

**Generated:** 2026-05-02 09:00 BST
**Last collector run:** 2026-05-02 00:00 UTC

> Notion MCP returned 401 unauthorized — Notion auth still down per memory. Writing Drive-synced markdown instead — needs manual review on phone.

## Headline (Apple Watch ready)

```
⚪ Agent DB: no new agents overnight (3rd zero-night in a row)
Total: 17,014 | Email: 9,694 | Phone: 11,106
Pipeline ran clean; Notion auth still down.
```

## Live DB stats (queried just now)

| Metric        | Last run | Live now | Δ |
|---------------|---------:|---------:|---:|
| Total agents  |   17,014 |   17,014 |  0 |
| With email    |    9,694 |    9,694 |  0 |
| With phone    |   11,106 |   11,106 |  0 |
| With website  |    4,536 |    4,536 |  0 |
| With postcode |   16,243 |   16,243 |  0 |

Live numbers match the run's totals exactly — no late-arriving CF decodes since 00:00 UTC.

## Last run breakdown (2026-05-02 00:00 UTC)

- **Scrape:** 2,000 rows scanned (pages 1–200 in 4×50-page batches), **0 inserted** — entire window deduped for the third run in a row.
- **Enrich-Propertymark:** 487 profiles enriched across 20 batches at limit=25 (offset 0→500). Phones/postcodes/services landing as expected; email always 0 here (Cloudflare-protected, deferred to decoder).
- **Enrich-CF-Emails:** 250 rows scanned across offsets 0–250 (5 batches at limit=50), **0 emails decoded, 0 websites recovered**. Decoder has caught up with the easily-decodable backlog at the head of the table.

## Movement vs. previous run (2026-04-30)

- Total: +0 (no new agents)
- with_email: +1 (late CF decode)
- with_phone: +7
- with_website: 0
- with_postcode: 0

## Recurring blocker — needs Tarek's attention

**Three runs in a row**, pages 1–200 of Propertymark have returned zero new agents. The last two reports flagged this and recommended rotating the window forward; SKILL.md still pins startPage=1, so we re-scraped the same dead window last night and burned ~2,000 fetches for nothing.

The run wrote the recommended next offsets into `next_run_start` in last-run.json. **Recommended fix:** rewrite the agent-collector SKILL.md so the scrape phase reads `next_run_start.scrape_propertymark_start_page` from the prior run's report rather than using a hardcoded start page. Same approach for the CF-decode offset (decoder is also chewing on a window that's already exhausted).

## Next-run starting offsets (per last-run.json)

| Phase                      | Start | End |
|----------------------------|------:|----:|
| scrape_propertymark page   |   401 | 600 |
| enrich_propertymark offset |   500 |  —  |
| enrich_cf_emails offset    |   250 |  —  |

## Issues from last run

- pg_net 10-way fan-out at limit=50 (request_ids 286–295) all timed out at the 60s pg_net ceiling — 9 in DNS stage, 1 in HTTP stage. Recovered by replaying as waves of 3–5 at limit=25. **Confirmed sweet spot: 3–5 concurrent at limit=25 for enrich.**
- enrich-cf-emails 5-way fan-out at limit=100 (request_ids 316–320) timed out (4 DNS-stage, 1 HTTP-stage). Recovered with limit=50 in pairs / sequential. **CF decoder safe shape: limit=50, ≤3 concurrent.**
- Edge function hostname still blocked from bash sandbox proxy (HTTP 403 'received-from-proxy-after-CONNECT'); invocations proxied via net.http_post (pg_net) from inside Postgres.
- Canonical report path ~/Documents/Claude/Scheduled/agent-collector/last-run.json still outside sandbox mounts — collector falls back to Yalla.House/.claude/scheduled-reports/agent-collector/.

## Notification status

- ❌ **Notion ping not delivered** — notion-search returned 401 Unauthorized. Memory note `project_notion_down.md` confirms the email switch broke auth.
- ⚠️ Until Notion is re-authed, scheduled tasks can't ping the watch. Tarek needs to re-connect Notion in Cowork.
- ✅ Fallback report saved to `~/Desktop/Yalla.House/.claude/scheduled-reports/agent-morning-report/latest-report.md` (Drive-synced).

## Sources

- last-run.json: `Yalla.House/.claude/scheduled-reports/agent-collector/last-run.json`
- Supabase project `suchdotsrrlsfxrvsmvy` — `agent_profiles` where `data_source='propertymark'`
