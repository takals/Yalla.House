# Agent collector — sample output (preview)

> This is what `last-run-summary.md` will look like after the next scheduled run picks up the v3 reporting changes. The real file gets overwritten every run by `generate-run-summary` and lands in `scheduled-runs/last-run-summary.md` (here) plus Supabase Storage at `reports/agent-collector/last-run-summary.md`.

# Agent collector — 2026-05-23 00:30 UTC

## Headline
**+0 new agents this run** · 458 enriched · 0 new emails · 0 new phones

## By country
| Country | New this run | Total | With email | With coverage |
|--|--|--|--|--|
| GB | +0 | 17,044 | 10,078 | 0 |
| DE | — | 0 | 0 | 0 |

## By source (this run)
| Country | Source | New | Enriched | Errors |
|--|--|--|--|--|
| GB | propertymark | +0 | 458 | 1 (retried OK) |
| GB | propertymark_cf_email | +0 | 0 | 0 |

## Trend
New agents per run (last 7): 38, 12, 4, 1, 0, 0, 0  → flat

## Saturation flags
- `propertymark` (GB) — 3 consecutive zero-new runs. Consider advancing offset or retiring.
- `propertymark_cf_email` (GB) — 3 consecutive zero-new runs. Consider advancing offset or retiring.

## Next-run starting offsets
- enrich_propertymark: 500
- enrich_cf_emails: 300
- scrape_propertymark_pages: 201

## Errors
- enrich-propertymark offsets 0-450 limit 50: pg_net 90s timeout — switched to limit 25
- enrich-cf-emails 5x100 parallel: all 60s timeouts — switched to 4x50
- enrich-cf-emails offset 150 limit 50: pg_net DNS timeout — retried successfully

## Notes
- Cowork sandbox proxy blocks supabase.co outbound — edge functions invoked from inside Postgres via pg_net.http_post
- pg_net DNS resolution serializes for parallel HTTPS to *.supabase.co — keep concurrency <= 4
- DB-level delta vs function-reported enrichment counts diverge — Phase 2 mostly overwrites already-populated fields
- Propertymark sources are saturated at the front of the queue. Ship the v2 sources (TPO, PRS, Companies House, Rightmove) to start moving the headline number again.
