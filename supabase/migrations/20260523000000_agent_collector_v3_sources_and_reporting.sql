-- Agent collector v3 — expanded sources + per-run reporting infrastructure
-- Builds on v2 (20260428000000_agent_coverage_country_aware.sql).
--
-- Adds:
--   1. data_basis + saturation_status columns to agent_source_registry
--   2. agent_collector_runs table — one row per scheduled run, drives last-run-summary.md
--   3. New UK source rows: RICS, NTSEAT, CMP schemes, allAgents, GetAgent, PrimeLocation,
--      HomeOwnersAlliance, Google Maps sweep
--   4. Full DE source set: IVD (already seeded — extending notes), BVFI, VDIV,
--      Handelsregister, ImmoScout24 (already seeded), Immowelt (already seeded), Immonet,
--      Engel & Völkers Shops, Von Poll Standorte, Maklerprofil, Xing
--
-- All new DE sources start with enabled=false. Lighting them up is a registry update,
-- no code change.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend agent_source_registry schema
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE agent_source_registry
  ADD COLUMN IF NOT EXISTS data_basis text,
  -- 'public_register' | 'legitimate_interest' | 'consent' | 'contractual'
  -- DSGVO Art. 6 basis for processing — required for DE before first outreach
  ADD COLUMN IF NOT EXISTS saturation_status text NOT NULL DEFAULT 'unknown',
  -- 'fresh' | 'productive' | 'saturated' | 'unknown'
  -- Set by the run-summary generator when a source returns 0 new for 3 consecutive runs
  ADD COLUMN IF NOT EXISTS last_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_run_new_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consecutive_zero_runs int NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. agent_collector_runs — one row per run, surfaced in last-run-summary.md
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_collector_runs (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at      timestamptz   NOT NULL DEFAULT now(),
  finished_at     timestamptz,
  run_kind        text          NOT NULL DEFAULT 'scheduled', -- 'scheduled' | 'manual' | 'backfill'
  -- Per-country headline counts (the number Tarek actually cares about)
  new_agents_gb   int           NOT NULL DEFAULT 0,
  new_agents_de   int           NOT NULL DEFAULT 0,
  new_agents_other int          NOT NULL DEFAULT 0,
  enriched_count  int           NOT NULL DEFAULT 0,
  new_emails      int           NOT NULL DEFAULT 0,
  new_phones      int           NOT NULL DEFAULT 0,
  new_websites    int           NOT NULL DEFAULT 0,
  new_outcodes    int           NOT NULL DEFAULT 0,
  -- Source breakdown is a JSON object: { tpo: { new: 12, enriched: 0 }, ivd: ... }
  sources_breakdown jsonb       NOT NULL DEFAULT '{}'::jsonb,
  -- Errors + notes carried over from the existing JSON shape
  errors          jsonb         NOT NULL DEFAULT '[]'::jsonb,
  notes           jsonb         NOT NULL DEFAULT '[]'::jsonb,
  -- Next-run starting offsets, also persisted for the orchestrator to pick up
  next_offsets    jsonb         NOT NULL DEFAULT '{}'::jsonb,
  -- The full JSON payload (legacy compatibility with scheduled-runs/agent-collector-last-run.json)
  full_payload    jsonb
);

CREATE INDEX IF NOT EXISTS agent_collector_runs_started_at_idx ON agent_collector_runs (started_at DESC);

ALTER TABLE agent_collector_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS agent_collector_runs_admin_read ON agent_collector_runs;
CREATE POLICY agent_collector_runs_admin_read ON agent_collector_runs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

COMMENT ON TABLE agent_collector_runs IS
  'One row per scheduled run of the agent collector. Drives last-run-summary.md and the 7-run trend.';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Backfill data_basis for existing GB sources (all public_register)
-- ────────────────────────────────────────────────────────────────────────────

UPDATE agent_source_registry
SET data_basis = 'public_register'
WHERE country_code = 'GB' AND data_basis IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. New UK source rows (Tier 1 add-ons + Tier 2 directories)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO agent_source_registry
  (source, country_code, display_name, base_url, scraper_fn, is_legal_universe, is_portal,
   estimated_record_count, notes, enabled, data_basis)
VALUES
  ('rics',              'GB', 'RICS Find a Surveyor',
   'https://www.ricsfirms.com/',                                    'scrape-rics',
   true,  false,  17000, 'RICS-regulated firms — commercial + valuation skew', false, 'public_register'),

  ('ntseat',            'GB', 'National Trading Standards Estate Agency Team',
   'https://www.tradingstandards.uk/business-advice/property',      'scrape-ntseat',
   true,  false,   2000, 'Banned-firms list + register — compliance signal', false, 'public_register'),

  ('ukala',             'GB', 'UKALA Client Money Protection',
   'https://www.ukala.org.uk/find-an-agent/',                       'scrape-ukala',
   true,  false,   5000, 'CMP scheme for lettings — legally required membership', false, 'public_register'),

  ('moneyshield',       'GB', 'MoneyShield CMP Scheme',
   'https://www.money-shield.co.uk/find-a-member',                  'scrape-moneyshield',
   true,  false,   3000, 'CMP scheme for lettings', false, 'public_register'),

  ('propertymark_cmp',  'GB', 'Propertymark Client Money Protection',
   'https://www.propertymark.co.uk/cmp',                            'scrape-propertymark-cmp',
   true,  false,   4000, 'CMP scheme for lettings — Propertymark members', false, 'public_register'),

  ('allagents',         'GB', 'allAgents review directory',
   'https://www.allagents.co.uk/',                                  'scrape-allagents',
   false, false,  15000, 'Review-driven; captures small independents the portals miss', false, 'legitimate_interest'),

  ('getagent',          'GB', 'GetAgent comparison',
   'https://www.getagent.co.uk/',                                   'scrape-getagent',
   false, false,  12000, 'Comparison site; named branch managers (human contact)', false, 'legitimate_interest'),

  ('primelocation',     'GB', 'PrimeLocation agents',
   'https://www.primelocation.com/find-agents/',                    'scrape-primelocation',
   false, true,    8000, 'DMG-owned; premium tilt', false, 'legitimate_interest'),

  ('homeownersalliance','GB', 'HomeOwnersAlliance recommended agents',
   'https://hoa.org.uk/services/find-an-estate-agent/',             'scrape-hoa-agents',
   false, false,   1000, 'Curated, high-quality short list', false, 'legitimate_interest'),

  ('google_places',     'GB', 'Google Maps Places (real_estate_agency per outcode)',
   'https://maps.googleapis.com/maps/api/place/textsearch/json',    'sweep-google-places',
   false, false,  30000, 'High-street independents not on portals; ~$200 to sweep all UK outcodes', false, 'public_register')
ON CONFLICT (source, country_code) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      base_url     = EXCLUDED.base_url,
      scraper_fn   = EXCLUDED.scraper_fn,
      notes        = EXCLUDED.notes,
      data_basis   = EXCLUDED.data_basis;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Full DE source set — building out the registry for Germany rollout
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO agent_source_registry
  (source, country_code, display_name, base_url, scraper_fn, is_legal_universe, is_portal,
   estimated_record_count, notes, enabled, data_basis)
VALUES
  -- Tier 1 — legal/regulatory
  ('ivd',                 'DE', 'IVD Maklerverband — Mitgliederverzeichnis',
   'https://ivd.net/maklersuche/',                                  'scrape-ivd',
   true,  false,   6000, 'Primary DE trade body — sales-heavy', false, 'public_register'),

  ('bvfi',                'DE', 'BVFI — Bundesverband für die Immobilienwirtschaft',
   'https://www.bvfi.de/mitglieder/',                               'scrape-bvfi',
   true,  false,   5000, 'Second trade body, complementary to IVD', false, 'public_register'),

  ('vdiv',                'DE', 'VDIV — Verband der Immobilienverwalter',
   'https://www.vdiv.de/mitglieder',                                'scrape-vdiv',
   true,  false,   3000, 'Property managers (Verwalter) — adjacent segment', false, 'public_register'),

  ('handelsregister',     'DE', 'Handelsregister — WZ2008 68.31',
   'https://www.handelsregister.de/',                               'handelsregister-import',
   true,  false,  40000, 'DE company register, filter by WZ 68.31 Vermittlung Immobilien', false, 'public_register'),

  ('gewerbeamt_berlin',   'DE', 'Berlin Gewerbeamt §34c GewO licences',
   'https://www.berlin.de/sen/wirtschaft/wirtschaft/gewerbe/',      'scrape-gewerbeamt-berlin',
   true,  false,   4000, 'Local Makler licence register — Berlin (template for other cities via IFG)', false, 'public_register'),

  -- Tier 2 — portal-active
  ('immoscout24',         'DE', 'ImmobilienScout24 Maklerverzeichnis',
   'https://www.immobilienscout24.de/anbieter/',                    'scrape-immoscout24-agents',
   false, true,   30000, 'Largest DE portal — the Rightmove of Germany; postcode→agent map', false, 'legitimate_interest'),

  ('immowelt',            'DE', 'Immowelt Maklerverzeichnis',
   'https://www.immowelt.de/profil/',                               'scrape-immowelt-agents',
   false, true,   20000, 'Second DE portal — different long-tail to ImmoScout24', false, 'legitimate_interest'),

  ('immonet',             'DE', 'Immonet Maklersuche',
   'https://www.immonet.de/profil/',                                'scrape-immonet-agents',
   false, true,   10000, 'Third DE portal — heavy overlap with Immowelt but captures regional independents', false, 'legitimate_interest'),

  ('engel_voelkers',      'DE', 'Engel & Völkers Shops',
   'https://www.engelvoelkers.com/de/shops/',                       'scrape-engel-voelkers',
   false, false,    400, 'All E&V locations — franchise directory', false, 'public_register'),

  ('von_poll',            'DE', 'Von Poll Immobilien Standorte',
   'https://www.von-poll.com/de/standorte',                         'scrape-von-poll',
   false, false,    350, 'Von Poll franchise locations', false, 'public_register'),

  ('remax_de',            'DE', 'RE/MAX Germany Büros',
   'https://www.remax.de/buero-suche',                              'scrape-remax-de',
   false, false,    200, 'RE/MAX DE franchise directory', false, 'public_register'),

  -- Tier 3 — enrichment / review
  ('maklerprofil',        'DE', 'Maklerprofil review aggregator',
   'https://www.maklerprofil.de/',                                  'scrape-maklerprofil',
   false, false,   8000, 'German equivalent of allAgents — review-driven', false, 'legitimate_interest'),

  ('xing_makler',         'DE', 'Xing — Makler/Immobilienmakler search',
   'https://www.xing.com/search/people',                            'scrape-xing-makler',
   false, false,  20000, 'Where DE Makler actually live — higher penetration than LinkedIn DE', false, 'legitimate_interest'),

  ('google_places_de',    'DE', 'Google Maps Places (real_estate_agency per PLZ)',
   'https://maps.googleapis.com/maps/api/place/textsearch/json',    'sweep-google-places',
   false, false,  25000, 'Local independents; sweep all ~8.2K DE PLZs via OpenPLZ', false, 'public_register')
ON CONFLICT (source, country_code) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      base_url     = EXCLUDED.base_url,
      scraper_fn   = EXCLUDED.scraper_fn,
      notes        = EXCLUDED.notes,
      data_basis   = EXCLUDED.data_basis,
      is_legal_universe = EXCLUDED.is_legal_universe,
      is_portal    = EXCLUDED.is_portal,
      estimated_record_count = EXCLUDED.estimated_record_count;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Helper view — per-country headline numbers for the dashboard + summary generator
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW agent_collector_country_headline AS
SELECT
  country_code,
  COUNT(*)                                        AS total_agents,
  COUNT(*) FILTER (WHERE email IS NOT NULL)       AS with_email,
  COUNT(*) FILTER (WHERE phone IS NOT NULL)       AS with_phone,
  COUNT(*) FILTER (WHERE website IS NOT NULL)     AS with_website,
  COUNT(*) FILTER (WHERE postcode IS NOT NULL)    AS with_postcode,
  COUNT(*) FILTER (WHERE coverage_outcodes IS NOT NULL AND array_length(coverage_outcodes, 1) > 0) AS with_coverage,
  MAX(coverage_last_seen_at)                      AS last_seen_any
FROM agent_profiles
GROUP BY country_code;

COMMENT ON VIEW agent_collector_country_headline IS
  'Per-country headline numbers used by the run-summary generator. Replaces the hand-rolled COUNT(*) in the JSON.';

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Helper view — per-source contribution this run (joins links to a time window)
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW agent_collector_source_contribution AS
SELECT
  asl.source,
  asl.country_code,
  COUNT(DISTINCT asl.agent_user_id)                         AS agents_observed,
  COUNT(*) FILTER (WHERE asl.first_seen_at >= now() - interval '24 hours') AS new_in_last_run,
  MAX(asl.last_seen_at)                                     AS last_observation
FROM agent_source_links asl
GROUP BY asl.source, asl.country_code;

COMMENT ON VIEW agent_collector_source_contribution IS
  'How many agents each source has observed, and how many were first observed in the last 24h. Drives the source breakdown in last-run-summary.md.';
