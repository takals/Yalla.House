# Agent Collection — Strategy & Expansion Plan

> Companion to `agent-collection-v2.md`. That doc covers schema + plumbing already in the repo. This doc covers (a) better per-run reporting, (b) more UK sources beyond the v2 scaffolding, (c) Germany rollout. Written 2026-05-23.

---

## Part 1 — Make every run readable in 10 seconds

### What's broken today

The last-run JSON (`scheduled-runs/agent-collector-last-run.json`) has the right data but the wrong shape. The number you actually care about — **how many new agents this run** — sits on line 5 of a 73-line file and never gets surfaced as a headline. Last run: zero new (Propertymark is saturated). You couldn't have known that without reading the JSON.

Once Germany is live, the same JSON would jumble GB + DE numbers together with no per-country split. And once v2 parsers ship, "new agents" without "from which source" hides whether TPO is pulling its weight or whether Rightmove is the real engine.

### Fix — a `last-run-summary.md` written alongside the JSON every run

Same data, designed for humans + Notion paste. Fixed structure so it can also be diffed run-over-run:

```
# Agent collector — 2026-05-23 00:30 UTC

## Headline
+0 new agents · 17,044 total · 0 new emails · 458 enriched

## By country
| Country | New | Total | New emails | New coverage outcodes |
|--|--|--|--|--|
| GB | 0 | 17,044 | 0 | 0 |
| DE | — | — | — | — |

## By source (this run)
| Source | New | Enriched | Errors |
|--|--|--|--|
| Propertymark scrape | 0 | — | 0 |
| Propertymark enrich | — | 458 | 1 (retried OK) |
| CF email decode | — | 0 (saturated) | 0 |

## Run-over-run trend (last 7 runs)
New agents: 38, 12, 4, 1, 0, 0, 0  ← Propertymark saturated, switch on v2 sources

## Next-run starting offsets
enrich_propertymark: 500 · enrich_cf_emails: 300 · scrape_propertymark_pages: 201

## Known issues
- Cowork sandbox blocks supabase.co outbound (use pg_net inside Postgres)
- pg_net DNS serialises above 4x parallel
```

### Concrete reporting changes to ship

1. **Lead with the new-agents count, by country.** That's the single number that tells you the collector is working.
2. **Add source attribution per run** — once v2 ships, every new row gets stamped with which scraper inserted it via `agent_source_links`. The summary pulls a `count(*) GROUP BY source` for the run window.
3. **Add a 7-run rolling trend.** When a source goes to zero new for 3 runs in a row, that's the signal to retire it from the nightly schedule and let a fresher source carry the slot.
4. **Surface coverage gain, not just headcount.** "+12 new outcodes covered" matters more than "+12 new agency rows" because outcoverage is the product asset.
5. **Email-yield breakout.** Three distinct numbers: new emails (truly new addresses), updated emails (overwrites), enrichments that hit a row that already had one (wasted work — flag to advance the offset).
6. **One-line saturation flag per source.** If new agents this run = 0 for 3 consecutive runs at a given offset, the summary says: `Propertymark scrape: saturated at offset 0–200. Advance to 201 or retire.`

### Where this lives

- Generator: small TypeScript file in the same edge function that closes out a run, writes to `scheduled-runs/last-run-summary.md` (overwrites) and `scheduled-runs/history/YYYY-MM-DD.md` (append).
- Notion integration: the existing 9am-report flow already pings your phone — extend it to paste the headline of the summary as the Notion task description, so you see it on the watch without opening the file.

---

## Part 2 — Get more agents into the UK database

### What we have

| Tier | Source | Status | Est. coverage |
|--|--|--|--|
| 1 | Propertymark (ARLA/NAEA) | Live, 17K rows | ~17K branches |
| 1 | TPO register | Scaffolded, parser TODO | ~40K branches |
| 1 | PRS members | Scaffolded, parser TODO | ~18K members |
| 1 | Companies House SIC 68310/68320 | Scaffolded, parser TODO | ~30K entities |
| 2 | Rightmove agent finder | Scaffolded, parser TODO | ~25K active |
| 2 | Zoopla find-agents | Listed as TODO | ~25K active |
| 2 | OnTheMarket | Listed as TODO | ~12K |

After all the scaffolded sources ship: ~50K unique UK agencies (post-dedupe). That's solid for the legal universe but still has gaps — independents, lettings-only firms, named humans rather than branches.

### New sources to add to the registry

**Tier 1 add-ons — regulatory/membership (mandatory, high-confidence):**

| Source | Why it adds value | Est. new rows | Cost |
|--|--|--|--|
| **RICS Find a Surveyor** | Commercial + valuation agents who skip TPO/PRS | +5–8K | Free, scrape |
| **NTSEAT register** (National Trading Standards Estate Agency Team) | Required to operate; also lists banned firms (compliance signal) | +2K | Free, FOI route |
| **CMP scheme member lists** (UKALA, MoneyShield, Propertymark CMP, RICS CMP) | Lettings agents are legally required to be in one; union of all four = complete lettings universe | +3–5K | Free, scrape |
| **The Lettings Industry Council (TLIC)** | Premium lettings | +500 | Free |

**Tier 2 add-ons — directories/comparison sites (proves they're trading):**

| Source | Why it adds value | Est. new rows | Cost |
|--|--|--|--|
| **allAgents.co.uk** | Independent reviews; captures small firms the portals miss | +5K | Free, scrape |
| **GetAgent** | Comparison site; lists named branch managers (human contact, not just branch) | +3K | Free, scrape |
| **PrimeLocation** | DMG-owned, premium tilt, low overlap with Zoopla on top-end firms | +2K | Free, scrape |
| **HomeOwnersAlliance recommended agents** | Curated, high-quality | +1K | Free, scrape |
| **Engel & Völkers UK shops** | The UK arm of E&V — under-represented elsewhere | +200 branches | Free |

**Tier 3 — enrichment (no new agencies, but add humans + emails):**

| Source | Why it adds value | Cost |
|--|--|--|--|
| **Apollo.io or Hunter.io bulk enrichment** | Domain → verified email lookup for every agency we have a website for (currently 4,538 rows) | ~$500 one-off for 10K credits |
| **Companies House Officers API** | For each agency company number, pull directors + their other directorships. Maps the human network behind the brands. | Free, rate-limited |
| **LinkedIn Sales Navigator + Phantombuster** | Named contacts (director, lettings manager). The human, not the branch. | £80/mo + £100/mo |
| **Trustpilot estate-agent category** | Agency name + website + review volume — review volume is a proxy for how active they are | Free, scrape |

**Tier 4 — proprietary signal (long-tail, but uniquely ours):**

| Source | Why it adds value | Cost |
|--|--|--|--|
| **Google Maps Places API** (`type=real_estate_agency`) per outcode | Captures the high-street independents who don't list on any portal | ~$200 to sweep all 2,900 UK outcodes |
| **Local authority HMO licence registers** | Each council publishes the property manager named on every HMO licence | Free, FOI route, slow |
| **Street View "To Let" / "For Sale" board OCR** | Long-tail independents nobody else has captured | Expensive, defer |

### Recommended UK rollout order

1. Ship the four scaffolded v2 parsers (TPO, PRS, Companies House, Rightmove). Gets us to ~50K.
2. Add RICS + CMP scheme members (Tier 1 add-ons). Gets us to ~58K.
3. Add allAgents + GetAgent (Tier 2 add-ons, mainly for emails + named humans). Quality boost more than headcount.
4. Run Apollo/Hunter enrichment across the full base. Push email coverage from 59% → ~85%.
5. Defer Google Maps sweep until 1–4 are saturated; it's the most expensive per row.

---

## Part 3 — Expand to Germany

### Strategic equivalence map

The German market mirrors the UK structure but with different bodies and a different legal regime. Same v2 schema works — only the registry rows change.

| UK pillar | Germany equivalent |
|--|--|
| TPO register (mandatory) | §34c GewO licences via local Gewerbeämter (no national register — must aggregate by city) |
| Propertymark / ARLA | IVD (Immobilienverband Deutschland) — primary trade body |
| PRS / UKALA | BVFI + VDIV (property managers, adjacent) |
| Companies House SIC 68310 | Handelsregister, WZ2008 code 68.31 |
| Rightmove agent finder | ImmoScout24 Maklerverzeichnis |
| Zoopla / OnTheMarket | Immowelt + Immonet |
| allAgents / GetAgent | Maklerprofil.de |
| LinkedIn UK | Xing (much higher Makler penetration than LinkedIn in DE) |

### Sources to seed into `agent_source_registry` for DE

**Tier 1 — legal/regulatory:**

| Source | Type | Est. count | Notes |
|--|--|--|--|
| IVD member directory | Membership | ~6K agencies | Primary trade body. Scrape at ivd.net/mitglieder-suche. |
| BVFI member directory | Membership | ~5K | Second trade body, complementary. |
| VDIV member directory | Membership | ~3K | Property managers (Verwalter), adjacent segment. |
| Handelsregister WZ 68.31 | Company register | ~40K legal entities | Equivalent of Companies House SIC 68310. Bundesanzeiger or Handelsregister.de. |
| §34c GewO via city Gewerbeämter | Licence register | ~30K (cumulative) | No national source — must aggregate top 30 cities (Berlin, Hamburg, Munich, Köln, Frankfurt, Stuttgart…). FOI / IFG requests where not online. |

**Tier 2 — portal-active:**

| Source | Type | Est. count | Notes |
|--|--|--|--|
| ImmoScout24 Maklerverzeichnis | Portal directory | ~20K active | The Rightmove of Germany. Postcode→agent map. |
| Immowelt agent finder | Portal directory | ~15K | Second major portal, different long-tail. |
| Immonet agent finder | Portal directory | ~10K | Third portal, heavy overlap with Immowelt but captures regional independents. |
| eBay Kleinanzeigen Immobilien (Makler accounts) | Marketplace | ~5K | Smaller agents post here. |
| Engel & Völkers Shops | Franchise directory | ~400 shops | All E&V locations listed at engelvoelkers.com/de/shops/. |
| Von Poll Immobilien Standorte | Franchise directory | ~350 | von-poll.com/de/standorte. |
| RE/MAX Germany Büros | Franchise directory | ~200 | remax.de. |

**Tier 3 — enrichment:**

| Source | Type | Notes |
|--|--|--|
| Maklerprofil.de | Review aggregator | German equivalent of allAgents. |
| Xing | Professional network | Where German Makler actually live (higher penetration than LinkedIn DE). |
| LinkedIn DE Sales Navigator | Professional network | "Makler" + "Immobilienmakler" filter. |
| Google Maps Places per PLZ | Maps API | Same approach as UK. |

**Tier 4 — local:**

| Source | Type | Notes |
|--|--|--|
| IHK Mitgliederverzeichnis (80 local chambers) | Chamber of commerce | Every Makler is an IHK member. Cumulative coverage > Handelsregister. |
| Bundesanzeiger financial filings | Company filings | For agencies above the disclosure threshold — financial signal. |

### Postcode grid for DE

Equivalent of the UK Doogal CSV. Options:
- **OpenPLZ API** (open data) — full PLZ→Ort mapping, ~8.2K distinct PLZs (5-digit) covering Germany.
- **Deutsche Post PLZ file** — paid, includes street-level granularity (~25K rows). Probably overkill for agent-coverage queries.

Recommend OpenPLZ: free, sufficient granularity for "agents covering PLZ 10115".

### Sequencing the Germany rollout

| Step | Action | Output |
|--|--|--|
| 1 | Seed `agent_source_registry` with the DE rows from the tables above (enabled = false initially) | Country code path lit up; no scraping yet |
| 2 | Load OpenPLZ data into `postcode_grid` for country_code = 'DE' | DE coverage queries become possible |
| 3 | Update the run-summary generator to emit per-country sections | Headline shows "GB 0 new · DE 0 new" so we can spot DE starting to populate |
| 4 | Build the IVD scraper (smallest, simplest source) and enable it | First DE rows in the DB |
| 5 | Build the ImmoScout24 Maklerverzeichnis scraper | Postcode→agent map for DE |
| 6 | Build the Handelsregister WZ 68.31 importer (bulk snapshot, not per-company API) | Legal universe |
| 7 | Add Immowelt + Immonet + franchise directories | Fills gaps |
| 8 | Email enrichment pass on the DE base (Apollo supports DE) | Outreach-ready |

### Legal note for the Germany pipeline

DSGVO (GDPR) requires a documented lawful basis for processing business contact data. Two safe bases:

1. **Legitimate interest (Art. 6(1)(f))** for B2B prospecting — defensible for an agent directory that targets agencies, not consumers, with an easy opt-out.
2. **Public interest** for data taken from public registers (Handelsregister, IVD's public member directory).

Action item: add a `data_basis` column to `agent_source_registry` recording which lawful basis applies per source — IVD members = legitimate interest, Handelsregister = public register, Maklerprofil reviews = legitimate interest with stricter retention. Lawyer-review before the first DE outreach campaign.

---

## Part 4 — Execution order (do these in this sequence)

1. **Reporting first** (1 evening). Write the `last-run-summary.md` generator. No new sources, just visibility. You can't optimise what you can't see.
2. **Ship the four scaffolded v2 UK parsers.** Gets UK from 17K → ~50K. The parser work is HTML-inspection grunt work — already planned in v2 doc.
3. **Seed the DE registry rows** (still disabled). Lights up the country-code path without committing to scrapers.
4. **Load OpenPLZ into `postcode_grid` for DE.**
5. **Build the IVD scraper.** Smallest DE source = fastest validation that the schema is country-agnostic in practice.
6. **Add UK Tier 1 extras: RICS + CMP schemes.**
7. **Build ImmoScout24 Maklerverzeichnis** (the big one for DE). After this, DE goes from a few thousand to ~20K.
8. **Build Handelsregister WZ 68.31 importer for DE.**
9. **Email enrichment pass across both countries** (Apollo/Hunter).
10. **Add Tier 2/3 long-tail UK + DE** (allAgents, GetAgent, Maklerprofil, etc.) only after 1–9 are humming.

Stop adding sources when run-over-run new-agent counts go to single digits across three consecutive runs in a country — that's the signal the legal universe is captured and further work is enrichment, not collection.

---

## Open questions for Tarek

1. Apollo vs Hunter for email enrichment? Apollo has better DE coverage but is pricier per credit. Hunter is cheaper and great for UK domains. We can run both and dedupe.
2. Do we run a DE legal review before the first IVD scrape, or after we have data sitting in the DB? My vote: build first, hold outreach until reviewed. Collection from a public register is low-risk; sending the first email is the moment of legal exposure.
3. Notion integration — extend the 9am phone ping to include the run summary headline? You said you want phone/watch pings; this is the obvious place.

---

## What shipped (2026-05-23)

**Migration** — `supabase/migrations/20260523000000_agent_collector_v3_sources_and_reporting.sql`
- New columns on `agent_source_registry`: `data_basis`, `saturation_status`, `last_run_at`, `last_run_new_count`, `consecutive_zero_runs`.
- New table `agent_collector_runs` — one row per run, drives the summary generator and the 7-run trend.
- New views `agent_collector_country_headline` and `agent_collector_source_contribution` — replace hand-rolled COUNTs in the JSON.
- Seeded 10 UK Tier-1/2 add-ons and 14 DE sources — all `enabled = false` with `data_basis` set per source.

**Edge function scaffolds** — `generate-run-summary`, `record-run.ts`, `scrape-ivd`, `scrape-immoscout24-agents`, `handelsregister-import`, `scrape-rics`, `scrape-allagents`, `scrape-getagent`, `scrape-prs`, `scrape-tpo`, `scrape-rightmove-agents`.

---

## What shipped (2026-05-24)

**Source URL corrections** — investigated live sites, found broken URLs:
- **IVD**: `/maklersuche/` returns 404 — site restructured, member search now behind login (members only). Updated `agent_source_registry` base_url and notes. IVD scraper cannot work as designed — needs alternative approach (regional IVD sites, or manual data acquisition).
- **TPO**: `/find-a-member` redirects to complaint page. Updated base_url to `/register-of-businesses/` (confirmed working search page).
- **Propertymark**: Updated notes to reflect `saturation_status = 'productive'` with `last_run_new_count = 14`.

**Collector scheduled task — upgraded to multi-source, multi-country:**
- Previously: UK Propertymark-only, no run recording, no per-source tracking
- Now: queries `agent_source_registry` for all enabled sources, calls each source's edge function, records results into `agent_collector_runs` table, updates per-source saturation tracking, calls `generate-run-summary` edge function for structured KPI output
- Auto-display: new agents inserted via `upsertAgent()` are immediately searchable via `agent-finder.ts` (no manual step needed)

**Morning report — upgraded with structured KPIs:**
- Previously: simple emoji + total count from `last-run.json`
- Now: per-country breakdown (GB/DE flags), per-source success table, 7-run trend sparkline, saturation warnings, source success rate, detailed local markdown report with percentages and next-action suggestions

**Current DB state:** 17,420 GB agents (10,670 with email, 61%), 0 DE agents, 31 sources registered (7 GB enabled, 0 DE enabled), `agent_collector_runs` table ready (first row will be written tonight).

---

## What's still TODO

### Parser work (blocking new source activation)
All edge function scaffolds have the request/response wiring complete but parsers return `[]`. Each needs HTML inspection to fill in the parser:

| Source | Country | Status | Blocker |
|--|--|--|--|
| `scrape-propertymark` | GB | **Live, working** | None — this is the production scraper |
| `scrape-tpo` | GB | Scaffold | Need to inspect `/register-of-businesses/` HTML |
| `scrape-prs` | GB | Scaffold | Need to inspect member search HTML |
| `scrape-rightmove-agents` | GB | Scaffold | Need to inspect agent-finder HTML per outcode |
| `companies-house-import` | GB | Scaffold | Need to wire Companies House API |
| `scrape-allagents` | GB | Scaffold | Need to inspect `/find-an-agent/` HTML |
| `scrape-getagent` | GB | Scaffold | Need to inspect per-outcode pages |
| `scrape-rics` | GB | Scaffold | Need to inspect search results HTML |
| `scrape-ivd` | DE | **Blocked** | Member search behind login wall — needs alternative approach |
| `scrape-immoscout24-agents` | DE | Scaffold | Need to inspect `/anbieter/` pages |
| `handelsregister-import` | DE | Scaffold | Need to wire Handelsregister API/bulk export |

### Infrastructure TODO
- Load OpenPLZ into `postcode_grid` for `country_code = 'DE'` (~8.2K rows)
- Deploy updated edge function scaffolds to Supabase (once parsers are filled)
- DE legal review before first outreach email

### Activation sequence (once parsers are ready)
1. Enable source in `agent_source_registry` → `UPDATE SET enabled = true WHERE source = 'xxx'`
2. Next nightly run picks it up automatically (collector queries enabled sources)
3. Morning report shows the new source's contribution
4. No code changes needed — registry-driven
