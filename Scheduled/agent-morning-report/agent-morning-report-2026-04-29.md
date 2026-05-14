---
generated: 2026-04-29T09:00:00+01:00
collector_run_at: 2026-04-29T00:00:00Z
delivery_channel: fallback (Notion MCP unauthorized — token invalid)
status: ⚪ ran clean, 0 new agents (pages 1–200 fully deduped)
---

# Agent DB — Morning Report (Apr 29)

⚪ **Agent DB: no new agents overnight**
Total: **17,013** | Email: **9,675** | Phone: **11,087**
Enriched: **510** profiles | Emails decoded: **0**
Pipeline ran clean — retries needed but every phase landed.

## Overnight Run Summary
- **Scrape (pages 1–200):** 2,000 listings checked, 0 new agents — every (name+location) pair on the first 200 pages already exists in the DB. Third consecutive run on these pages with zero inserts.
- **Propertymark enrichment (offsets 0–524):** 510 profiles enriched in 14 batches of 25. Phones +195, websites +80, postcodes +481, services +411. Emails on profile pages remain Cloudflare-obfuscated → 0 added at this stage (expected).
- **Cloudflare email decode (offsets 0–449):** 0 emails recovered. The targeted window has been fully decoded by prior runs.

## Live DB vs Last-Run Report
Live query confirms the report's totals exactly — DB at 17,013 / 9,675 / 11,087 / 4,536 / 16,243.

## Deltas vs Previous Run
| Metric | Δ |
|---|---|
| total | 0 |
| with_email | +9 |
| with_phone | +11 |
| with_website | +2 |
| with_postcode | 0 |

The +9 emails / +11 phones / +2 websites came from the enrichment pass cleaning up partial records, not from new agents.

## Next-Run Starting Offsets (from collector)
- `scrape_propertymark`: **201** (deeper pages — first 200 are exhausted)
- `enrich_propertymark`: **525**
- `enrich_cf_emails`: **450**

## Recurring Issue — SKILL.md Drift
The collector report (and the Apr 27 report before it) recommends rotating the scraper past page 200, but the agent-collector SKILL.md still pins the run to pages 1–200. Three runs in a row have wasted the scrape phase on duplicates. **Recommended fix:** update agent-collector SKILL.md to read `next_run_starting_offsets` from the previous report so subsequent runs drift deeper automatically.

## Errors / Notes
- Initial Phase 1 batch (50 pages) hit the 60s edge function wall-clock + pg_net 90s timeout. Re-ran as 25-page batches successfully.
- Initial Phase 2 batch (offset 0, limit 50) timed out at 90s pg_net limit; switched to limit=25.
- Initial Phase 3 fan-out (5× parallel cf-emails) saw 4/5 fail at DNS lookup. Sequential calls all succeeded.
- 8-way parallelism worked for enrich-propertymark; 3-way is the safe ceiling for cf-emails.

## Delivery Note
Notion MCP returned **401 unauthorized** (invalid API token) — matches the known "Notion temporarily down" status in memory. Written to workspace fallback instead of pinged via Notion. Tarek will not get the Apple Watch ping until the Notion token is restored.

**Action when Notion is restored:** re-run this report manually or wait for the next 9 AM scheduled run.
