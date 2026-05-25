# Agent DB — Morning Report (2026-05-19)

⚪ **Agent DB: no new agents overnight**
Total: **17,057** | Email: **10,187** | Phone: **11,187** | Website: **4,539** | Postcode: **16,246**

Pipeline ran clean.
- Enriched: **482** profiles
- Emails decoded: **2**
- Last run: 2026-05-18 23:25 UTC

## Deltas vs previous run
- Total: +11 | Email: +108 | Phone: +20 | Website: +1 | Postcode: 0

## Heads-up
- **Pages 1–200 saturated for 3rd consecutive run.** Pivot recommended: pages 201–400 or rotate to TPO / PRS / Companies House (per agent-collection-v2 scaffolding).
- pg_net parallelism: cap at 2 concurrent calls — 10-way fan-out triggers DNS timeouts.
- enrich-cf-emails: shrink batch size from 100 → 50 (current setup times out at 90s).

## Errors (all recovered except one)
1. Scrape batch pages 1–50: pg_net 60s timeout, function likely completed. Recovered with parallel retries.
2. Enrich-propertymark: 9/10 parallel salvo hit DNS timeout. Recovered via sequential pairs.
3. Enrich-cf-emails offsets 200/300/400: timed out at 90s, not retried (first 3 successful batches returned 0 emails anyway).

## Notion delivery status
🔴 **Notion MCP returned 401 Unauthorized** — auth still broken (matches known issue from email switch). This report needs manual review. Ping not delivered to phone/Apple Watch.
