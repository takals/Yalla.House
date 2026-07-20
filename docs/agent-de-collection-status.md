# German agent collection — status & next steps (2026-07-20)

## Where we are
- **DE agents in the database: 0.** Every German source in `agent_source_registry`
  is `enabled = false`.
- The only live scraper in production is `scrape-propertymark` (GB). It is the
  reason the UK has ~19k agents and Germany has none.

## Why we can't just "switch Germany on"
The German scraper edge functions **are not deployed**, and the two that exist in
the repo are **stubs**, not working collectors:

| Source (registry `scraper_fn`) | Repo code | Deployed | State |
|---|---|---|---|
| `ivd` → `scrape-ivd` | yes | no | **stub** — `parseIvdResponse()` returns `[]`. IVD's `/maklersuche/` URL now 404s; the AJAX shape needs re-capturing. |
| `handelsregister` → `handelsregister-import` | yes | no | **stub** — needs a manually-uploaded OffeneRegister snapshot and the WZ-68.31 field mapping is a TODO. |
| `gewerbeamt_berlin` → `scrape-gewerbeamt-berlin` | **no code** | no | not started |
| `immoscout24`, `immowelt`, `xing`, … | partial/none | no | portal directories; `legitimate_interest` basis — hold for legal review |

Enabling these in the registry would make the nightly collector call functions
that return nothing (or 404) — zero agents collected, just noise. So they are
**left disabled on purpose**.

## What DOES collect German agents today (shipped 2026-07-20)
Two consent-based channels that don't depend on scrapers and are DSGVO-clean:
1. **Self-add** — a German agent not in our directory can add their agency via
   the `/agent/profile` intake. This now writes a real `agent_profiles` row with
   their contact email + inferred `country_code` (5-digit PLZ → DE). Previously
   the chat intake wrote only "memories" and never created a profile — fixed.
2. **Inbound listings** — agents forward their property mailouts to
   `listings@yalla.house`; the sender is matched to (or becomes a signal for) an
   agent record.

## Concrete next step to start *scraped* DE collection
Pick the most tractable public-register source and make ONE real:
1. **IVD** is the best candidate (single trade body, ~6k members). Needs:
   - Find the current Maklersuche URL/endpoint (old one 404s).
   - Capture one real search response (browser devtools → network) and fill in
     `parseIvdResponse()` with the true field names.
   - `deploy_edge_function scrape-ivd`, test-invoke with `{country_code:'DE', limit:20}`,
     confirm rows land via the shared `upsertAgent` helper (country-namespaced).
   - Flip `enabled = true` for `ivd` in `agent_source_registry`.
2. **Google Places** (`google_places_de`, est. 25k) is the highest-yield but needs
   a `GOOGLE_MAPS_API_KEY` and has per-request cost — a paid, reliable alternative
   to fragile HTML scraping.

Until one of the above is done, German scraped collection stays at zero by design.
