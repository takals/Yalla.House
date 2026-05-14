# Agent Database

**Status:** UK complete, Germany next
**Last updated:** 2026-04-14

## What It Is
Massive database of real estate agents scraped from professional directories, enriched with email/phone/services from profile pages and agency websites. Foundation for the Yalla.House agent marketplace.

## UK (Complete)
- **Source:** Propertymark (NAEA/ARLA) directory
- **Count:** 16,993 agents, 7,563 unique agency names
- **Emails:** ~12,000 projected (Cloudflare XOR decode, 77% hit rate)
- **Postcodes:** 16,243 (96%), Phones: 10,932 (64%), Websites: 4,527 (27%)
- **Supabase project:** suchdotsrrlsfxrvsmvy
- **Live at:** yalla.house/en/agents (postcode search with GIN index)

## Three-Phase Pipeline (Reusable)
1. **Directory Scrape** — paginate national directory, extract name + location + profile URL
2. **Profile Enrichment** — fetch each profile, parse address/postcode/phone/website/services, decode obfuscated emails (Cloudflare XOR)
3. **Website Email Pass** — scrape agency websites for missing emails

## Edge Functions
- `scrape-propertymark` (v3) — sequential page fetch with 500ms delay, retry on 429
- `enrich-propertymark` (v4) — parse profile HTML for address/phone/website/services
- `enrich-cf-emails` — Cloudflare data-cfemail XOR decode
- `enrich-emails` — scrape agency websites for mailto/email patterns

## PL/pgSQL Functions
- `bulk_insert_agents_v2` — name+location dedup via email slug
- `enrich_agent_profiles` — COALESCE update for all fields

## DB Schema
- `agent_profiles.coverage_areas` — jsonb array: `[{"country_code":"GB","postcode_prefixes":["SW","SW11"]}]`
- Indexes: GIN on coverage_areas, btree on data_source, agency_name, verified_at

## Country Rollout
- **Wave 1:** UK (done), Germany (IVD + ImmoScout24)
- **Wave 2:** France (FNAIM), Netherlands (NVM), Spain (CGCOAPI), Italy (FIAIP)
- **Strategy doc:** Agent-Database-Rollout-Strategy.docx in Yalla.House folder

## Growth Flywheel (Designed, Not Built Yet)
1. **Signup Research Agent** — Inngest job pre-populates dashboard with local agents on signup
2. **User-Contributed Agents** — "Add an Agent" form + auto-verification pipeline
3. **Background Discovery Agent** — weekly re-scrape, coverage gap fill, new source discovery
