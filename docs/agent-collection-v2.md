# Agent Collection v2 — Country-Aware, Multi-Source

> Status: scaffolded 2026-04-28. Migration + 4 edge function stubs in repo, parsers TODO. Not yet deployed.

## Goal

Move agent_profiles from "17K Propertymark UK records" to "complete UK legal universe + active-portal map", with the schema country-ready so the same pipeline runs for DE/AE/TR by adding registry rows, not code.

## What changed in the schema

Migration: `supabase/migrations/20260428000000_agent_coverage_country_aware.sql`

- `agent_profiles.country_code` — was missing. Defaults to GB for the existing 17K rows. All future inserts must set this.
- `agent_profiles.coverage_outcodes text[]` — populated by Rightmove agent finder (each outcode an agent advertises in).
- `agent_profiles.coverage_postcodes text[]` — populated from listing-level scrapes (full postcodes the agent actually has live property at). Evidence-based.
- `agent_profiles.coverage_last_seen_at timestamptz` — when this agent's coverage was last refreshed.
- `agent_source_links` — many-to-many between agents and sources. One agent can be confirmed in TPO + PRS + Companies House + Rightmove + Propertymark; each link records source_id/url/last_seen.
- `postcode_grid` — master postcode list per country. UK target: ~1.7M postcodes loaded from Doogal CSV.
- `agent_source_registry` — declarative list of sources per country. Adding a new country = inserting rows.

GIN indexes on the two coverage_* arrays mean queries like "all agents serving SW1A 1AA" are fast.

## Sources, by tier

### Tier 1 — Legal universe (mandatory membership = ~100% coverage)

| Source | Estimated count | What it adds | Function |
|---|---|---|---|
| TPO register | ~40K branches | Largest single agent register; mandatory by law | `scrape-tpo` |
| PRS members | ~18K members | Other half of legal universe; lettings-heavy | `scrape-prs` |
| Companies House SIC 68310/68320 | ~30K legal entities | Company numbers, directors, financial filings, registered addresses | `companies-house-import` |

After Tier 1 we expect closer to ~50K unique UK agency records (after dedupe), up from 17K Propertymark-only.

### Tier 2 — Portal-active (proves who's currently trading + gives postcode coverage)

| Source | Estimated count | What it adds | Function |
|---|---|---|---|
| Rightmove agent finder | ~25K active branches | **The postcode→agent map** (only source that gives this) | `scrape-rightmove-agents` |
| Zoopla find-agents | ~25K | Cross-check, Scotland coverage via S1Homes | `scrape-zoopla-agents` (TODO) |
| OnTheMarket directory | ~12K | Premium fill-in (Savills/KF network) | `scrape-onthemarket-agents` (TODO) |

### Tier 3 — Postcode grid

Master postcode list loaded from Doogal.co.uk CSV (~1.7M UK postcodes with lat/lng). Drives Tier 2 sweepers and underpins coverage queries. Loaded via one-off `psql \copy` from a CSV dropped into Supabase Storage — not an edge function.

## Dedup strategy

Match key: `(lower(agency_name), country_code, postcode_prefix_3)` when postcode is present, otherwise `(lower(agency_name), country_code, source)`.

Implemented in `supabase/functions/_shared/agent-upsert.ts`. On match, the helper:

- Fills any null email / phone / website / postcode from the new observation.
- Unions `coverage_outcodes` and `coverage_postcodes` arrays.
- Updates `coverage_last_seen_at`.
- Always records the observation in `agent_source_links` (idempotent per `(source, source_id, country_code)`).

## Multi-country wiring

Every scraper function takes `country_code` in the request body and validates it. UK-specific scrapers (TPO, PRS, Companies House, Rightmove) reject non-GB explicitly so we don't silently mis-attribute records.

Adding Germany later means:
1. Insert DE rows into `agent_source_registry` (already seeded as `enabled = false` for ImmoScout24 / Immowelt / IVD).
2. Drop a DE postcode CSV into `postcode_grid` (PLZ codes, 5 digits).
3. Build the corresponding scrape-* function for each enabled DE source.
4. Schedule the DE pipeline alongside the GB one.

No core code changes; the schema and shared helper already handle multi-country.

## Deployment plan

1. **Apply migration** — review SQL, then run via `apply_migration` once approved.
2. **Load postcode grid** — drop Doogal CSV (~1.7M rows) into Supabase Storage, run a one-off `psql \copy` into `postcode_grid`. Doogal is licensed CC-BY so attribution required.
3. **Inspect TPO/PRS/Rightmove HTML structure** — visit each source by hand, dump 1-2 sample pages, and fill in the `parse*` functions in each scaffold. This is the only real engineering work; the rest is plumbing.
4. **Smoke test each scraper** with `limit: 10` against staging data.
5. **Wire into the existing nightly schedule** alongside the Propertymark scraper.

## Open questions

- Do we want to scrape Zoopla and OnTheMarket if Tier 1 + Rightmove already gives near-complete coverage? Likely defer until we measure overlap from the first three.
- For Companies House: bulk monthly snapshot vs the per-company API (1 call per company, rate-limited). Snapshot is cheaper and complete; API is fresher. Start with snapshot.
- Coverage staleness — how often do we refresh? Suggested default: agents not seen in 90 days get re-checked; new outcodes scraped weekly.
