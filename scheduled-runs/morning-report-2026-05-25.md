# Agent Collection Report — 2026-05-25

Run started: 2026-05-24 23:02 UTC · finished 23:23 UTC · duration 21 min
Run ID: `f2db2c80-c8d1-4842-a90d-d29430a24914`

## Headline KPIs
| Metric | Value |
|--------|-------|
| New agents (total) | +1 |
| New GB | +1 |
| New DE | 0 |
| Enriched | 99 |
| New emails decoded | 0 |
| New phones | 0 |
| Sources productive | 1/7 |
| Sources saturated (≥3 zero-runs) | 0 |
| Errors (DB run row) | 8 |

## Per-Country Totals (live)
| Country | Total | With Email | With Phone | With Website | With Postcode |
|---------|-------|------------|------------|--------------|---------------|
| GB | 17,421 | 10,670 (61.2%) | 11,240 (64.5%) | 4,544 (26.1%) | 16,252 (93.3%) |
| DE | 0 | 0 (—) | 0 (—) | 0 (—) | 0 (—) |

Coverage gains vs 2026-05-23 snapshot: +324 total, +76 with-email, +2 with-website, +0 phone, +0 postcode.

## Per-Source Breakdown
| Source | Country | New | Enriched | Errors | Status |
|--------|---------|-----|----------|--------|--------|
| propertymark | GB | +1 | 99 | 0 | productive — pages 1-400 saturated this run |
| prs | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |
| tpo | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |
| rightmove | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |
| companies_house | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |
| zoopla | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |
| onthemarket | GB | 0 | 0 | 1 | scraper edge function 404 (not deployed) |

Productive ratio: **1/7 enabled GB sources** are actually deployed and running. The other six are flagged `enabled = true` in `agent_source_registry` but their scraper functions return 404.

## 7-Run Trend
The `agent_collector_runs` table currently holds **only the most recent run** (older history not retained / not yet logged).

| Run | GB | DE | Other | Total |
|------|----|----|-------|-------|
| 2026-05-24 23:02 | +1 | 0 | 0 | +1 |

Sparkline (latest only): `1`. Multi-run trend will populate once subsequent runs are recorded — consider relaxing any TTL or retention policy on this table if rows are being pruned.

## Saturation Warnings
- **propertymark**: pages 1-400 yielded ~0 net new this run — extend range to **401-700** next run, or mark saturated if zero new.
- **enrich-cf-emails**: offsets 0-40 fully exhausted; reseed from mid-range zones (2000-6500 per May 23 yield map).
- No source has hit the formal 3-consecutive-zero-runs threshold yet (all six unproductive sources are at 1 zero-run — they need deployment, not retirement).

## Errors (full list from JSON)
1. `prs` — function_missing — 404 NOT_FOUND from /functions/v1/scrape-prs
2. `tpo` — function_missing — 404 NOT_FOUND from /functions/v1/scrape-tpo
3. `rightmove` — function_missing — 404 NOT_FOUND from /functions/v1/scrape-rightmove-agents
4. `companies_house` — function_missing — 404 NOT_FOUND from /functions/v1/companies-house-import
5. `zoopla` — function_missing — 404 NOT_FOUND from /functions/v1/scrape-zoopla-agents
6. `onthemarket` — function_missing — 404 NOT_FOUND from /functions/v1/scrape-onthemarket-agents
7. `propertymark` — timeout — initial 50-page batches exceeded pg_net 58s timeout; recovered by switching to 25-page parallel batches
8. `enrich-propertymark` — timeout — limit=50 timed out; reverted to limit=10/20
9. `enrich-cf-emails` — timeout — limit=100 and limit=50 both timed out; reverted to limit=20
10. `generate-run-summary` — function_missing — edge function referenced in spec is not deployed (summary written inline to canonical JSON instead)

## Next Actions (prioritised)
1. **Deploy or disable the six missing GB scrapers.** Each missing function logs a 404 every run. Either ship `scrape-prs`, `scrape-tpo`, `scrape-rightmove-agents`, `companies-house-import`, `scrape-zoopla-agents`, `scrape-onthemarket-agents` — or set `enabled = false` in `agent_source_registry` until they're ready.
2. **Advance propertymark to pages 401-700** next run; 1-400 is saturated.
3. **Re-aim enrich-cf-emails at offsets 2000-6500** with limit=30 parallel pairs — this was the highest-yield zone per the May 23 run. Skip offsets 0-40 (now exhausted).
4. **Cap batch sizes** to avoid the recurring pg_net 58s timeout: propertymark at 25 pages/batch, enrich-propertymark at limit=30, enrich-cf-emails at limit=20-30.
5. **Configure the pg vault secret** `app.settings.service_role_key` so the SQL templates from the task spec stop needing the JWT inlined.
6. **DE pipeline still at zero** — DE sources are seeded but disabled. Enable when parsers are ready (no German source has run yet).
7. **Deploy `generate-run-summary` edge function** or absorb that responsibility entirely into this scheduled-task runner.

## Notes
- Canonical paths used (per spec): read from `/Users/tarekalsaleh/Desktop/Yalla.House/scheduled-runs/agent-collector-last-run.json`; wrote to `/Users/tarekalsaleh/Desktop/Yalla.House/scheduled-runs/latest-morning-report.md` + dated copy.
- Live DB headline view (`agent_collector_country_headline`) and `agent_collector_runs` confirmed the JSON figures.
- The Linux sandbox cannot reach `*.supabase.co` directly (proxy 403); the overnight collector relied on `pg_net.http_post` from inside Postgres.
