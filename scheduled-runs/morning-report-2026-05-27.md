# Agent Collection Report — 2026-05-27

**Run ID:** `870745d2-ee30-4bdf-ad4e-dd71cb4a5225`
**Run window:** 2026-05-26 23:02 → 23:14 UTC (12 min)
**Run kind:** scheduled

## Headline KPIs
| Metric | Value |
|--------|-------|
| New agents (total) | +1 |
| New GB | +1 |
| New DE | 0 |
| Enriched | 75 |
| New emails decoded | 0 |
| Sources productive | 1 / 7 enabled |
| Sources saturated (≥3 zero-run streak) | 0 |
| Errors | 8 (6 undeployed scrapers + 1 missing summary fn + 1 pg_net quirk) |

## Per-Country Totals
| Country | Total | With Email | With Phone | With Website | With Postcode |
|---------|-------|------------|------------|--------------|---------------|
| GB | 17,549 | 10,673 (60.8%) | 11,241 (64.1%) | 4,544 (25.9%) | 16,252 (92.6%) |
| DE | 0 | 0 (—) | 0 (—) | 0 (—) | 0 (—) |

## Per-Source Breakdown
| Source | Country | New | Enriched | Errors | Status |
|--------|---------|----:|---------:|-------:|--------|
| propertymark | GB | +1 | 75 | 0 | productive (verification sweep pages 201–500) |
| prs | GB | 0 | 0 | 1 | not deployed (404) |
| tpo | GB | 0 | 0 | 1 | not deployed (404) |
| rightmove | GB | 0 | 0 | 1 | not deployed (404) |
| zoopla | GB | 0 | 0 | 1 | not deployed (404) |
| onthemarket | GB | 0 | 0 | 1 | not deployed (404) |
| companies_house | GB | 0 | 0 | 1 | not deployed (404) |
| enrich_cf_emails | GB | — | 0 emails / 0 sites | 0 | CF-obfuscated pool already cleared |

## 7-Run Trend (last 3 runs in DB)
| Date | GB | DE | Other | Total |
|------|---:|---:|------:|------:|
| 2026-05-26 | +1 | 0 | 0 | +1 |
| 2026-05-25 | +127 | 0 | 0 | +127 |
| 2026-05-24 | +1 | 0 | 0 | +1 |

Sparkline (oldest→newest): 1 → 127 → 1
Trend direction: → flat (yield depends entirely on which propertymark pages get probed; productive zone was harvested 2026-05-25)

## Saturation Warnings
No registry entries hit the 3-run zero streak yet. However, the run notes flag:
- **propertymark pages 1–500 fully saturated** — defer next probe to `next_offsets.propertymark.next_start_page = 1301`.
- **CF email pool clean** — no obfuscated emails left in GB pool.

## Errors
| Source | Issue |
|--------|-------|
| prs | scrape-prs edge function returns 404 — not deployed (3rd run in a row) |
| tpo | scrape-tpo edge function returns 404 — not deployed (3rd run in a row) |
| rightmove | scrape-rightmove-agents edge function returns 404 — not deployed |
| zoopla | scrape-zoopla-agents edge function returns 404 — not deployed |
| onthemarket | scrape-onthemarket-agents edge function returns 404 — not deployed |
| companies_house | companies-house-import edge function returns 404 — not deployed |
| generate-run-summary | edge function returns 404 — markdown summary was written into collector JSON instead |
| pg_net | Client timeout fixed at 60s; parallelism >3 starves DNS resolver. Edge functions completed server-side. |

## Why Yield Was Tiny
Last night's run probed propertymark pages 201–500 (7,500 records) to verify a stale registry note. Net yield was +1 because the prior nightly run (2026-05-25) had already swept pages 401–1300 and harvested 127 agents from the productive zone. The 201–400 gap is now confirmed empty.

## Next Actions (auto-generated)
1. **Deploy the six missing scraper edge functions** — this is the biggest unlock. Pool sizes upstream:
   - PRS ≈ 18K · TPO ≈ 40K · Rightmove ≈ 25K · Zoopla ≈ 25K · OnTheMarket ≈ 12K · Companies House ≈ 30K (SIC 68310)
   - Deploying any one would more than double the GB pool.
2. **Next propertymark probe** should start at page 1301; stop after 3 consecutive 25-page zero batches.
3. **Refresh agent_source_registry notes** for propertymark — current notes are stale (claimed 201–300 productive; this run confirmed saturated).
4. **Add `enrichment_attempted_at` column** to `agent_profiles` so enrich-propertymark stops re-touching the same 25 records on every parallel call.
5. **DE pool still 0** — DE sources scaffolded but no parsers built. Continue prioritising DE source scaffolding to unblock cross-country coverage.
6. **Deploy `generate-run-summary`** edge function so morning reports stop having to reconstruct summaries from the JSON.

## Infrastructure Snapshot
- **Deployed edge functions:** bulk-insert-agents, scrape-propertymark, enrich-propertymark, enrich-emails, enrich-cf-emails, debug-profile
- **Missing edge functions:** scrape-prs, scrape-tpo, scrape-rightmove-agents, scrape-zoopla-agents, scrape-onthemarket-agents, companies-house-import, generate-run-summary
- **pg_net quirks:** 60s client timeout vs 150s edge timeout; parallelism >3 starves DNS resolver; enrich-propertymark fetches offset=0 in all parallel calls (duplicate work)
