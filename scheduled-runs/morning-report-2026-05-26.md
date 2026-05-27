# Agent Collection Report — 2026-05-26

**Run ID:** `fee887ee-9a5f-4c29-a235-25aeec725498`
**Window:** 2026-05-25 23:03 → 23:31 UTC (28 minutes)

## Headline KPIs
| Metric | Value |
|--------|-------|
| New agents (total) | +127 |
| New GB | +127 |
| New DE | +0 |
| Enriched | 250 |
| New emails decoded | +3 |
| Sources productive | 1 / 7 enabled |
| Sources saturated (≥3 zero runs) | 0 |
| Errors | 6 (all undeployed scrapers) |

## Per-Country Totals
| Country | Total | With Email | With Phone | With Website | With Postcode |
|---------|-------|------------|------------|--------------|---------------|
| GB | 17,548 | 10,673 (60.8%) | 11,240 (64.1%) | 4,544 (25.9%) | 16,252 (92.6%) |
| DE | 0 | 0 | 0 | 0 | 0 |

## Per-Source Breakdown
| Source | Country | New | Enriched | Errors | Status |
|--------|---------|-----|----------|--------|--------|
| propertymark | GB | +127 | 250 | 0 | productive (pages 401-1300) |
| prs | GB | 0 | — | 1 | blocked — edge function 404 |
| tpo | GB | 0 | — | 1 | blocked — edge function 404 |
| rightmove | GB | 0 | — | 1 | blocked — edge function 404 |
| zoopla | GB | 0 | — | 1 | blocked — edge function 404 |
| onthemarket | GB | 0 | — | 1 | blocked — edge function 404 |
| companies_house | GB | 0 | — | 1 | blocked — edge function 404 |

### propertymark yield zones (pages 401-1300)
| Page range | New agents | Notes |
|------------|------------|-------|
| 401-600 | 9 across 200 pages | slow — near saturation tail |
| 601-800 | 49 across 200 pages | most productive (39% of run) |
| 801-1000 | 38 across 200 pages | productive |
| 1001-1300 | 31 across 300 pages | declining |

## Run Trend (last 7 runs)
| Date | GB | DE | Other | Total |
|------|----|----|-------|-------|
| 2026-05-25 | +127 | 0 | 0 | +127 |
| 2026-05-24 | +1 | 0 | 0 | +1 |

Sparkline (total new per run): **1 → 127**

Trend direction: ↑ trending up — yesterday's run scraped pages 1-400 (saturated tail); tonight extended into the productive 601-1000 zone.

## Saturation Warnings
None — no source has hit 3+ consecutive zero-new runs. The six non-deployed sources have `consecutive_zero_runs = 1` only; their `saturation_status` remains `unknown` until parsers ship.

## Errors (6)
Same state as 2026-05-24 — all six non-deployed GB edge functions still 404:
- `scrape-prs` — PRS (~18K agents)
- `scrape-tpo` — The Property Ombudsman (~40K agents)
- `scrape-rightmove-agents` — Rightmove agent finder
- `scrape-zoopla-agents` — Zoopla agent finder
- `scrape-onthemarket-agents` — OnTheMarket agent finder
- `companies-house-import` — Companies House SIC 68310 import

Also: `generate-run-summary` edge function returned 404 — the collector wrote `summary_markdown` inline into the JSON instead.

## Next-Run Offsets
| Source | Next start | Rationale |
|--------|------------|-----------|
| propertymark | page **1301** | Yields tapered to ~3 per 25-page batch at 1276-1300. Stop if 3 consecutive 25-page batches yield 0. |

## Next Actions
1. **Deploy the 6 missing GB scrapers** — PRS (~18K) + TPO (~40K) alone would more than triple the dataset. Same blocker for two nights running.
2. **Continue propertymark from page 1301** next run; auto-stop when 3 consecutive 25-page batches yield 0.
3. **Add `enrichment_attempted_at` column on `agent_profiles`** — enrich-propertymark is re-confirming already-populated records (250 fetched, 0 new fields). A tracker would let it target unenriched rows.
4. **Build website enrichment** — 25.9% coverage is the weakest field (vs 60.8% email, 64.1% phone, 92.6% postcode).
5. **Enable DE pipeline** — DE sources are seeded but disabled; total stays at 0 until parsers are deployed.
6. **Deploy `generate-run-summary` edge function** — the morning report skill is currently working off the inline summary in the JSON rather than a structured DB-backed summary.
