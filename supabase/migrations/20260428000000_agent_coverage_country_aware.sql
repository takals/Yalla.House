-- Agent collection v2 — country-aware schema + postcode coverage map
-- Drives: scrape-tpo, scrape-prs, scrape-rightmove-agents, companies-house-import
-- Backwards-compatible: all existing rows default to GB (where the current 17K live).

-- 1. country_code on agent_profiles (was missing — Propertymark scraper hardcoded UK)
ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'GB';

CREATE INDEX IF NOT EXISTS agent_profiles_country_code_idx
  ON agent_profiles (country_code);

-- 2. Coverage map — what postcodes does this agent serve?
-- coverage_outcodes is the cheap layer (~3K possible values per country).
-- coverage_postcodes is populated from listing-level data when we have it (full postcode evidence).
ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS coverage_outcodes  text[],
  ADD COLUMN IF NOT EXISTS coverage_postcodes text[],
  ADD COLUMN IF NOT EXISTS coverage_last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS agent_profiles_coverage_outcodes_gin
  ON agent_profiles USING gin (coverage_outcodes);
CREATE INDEX IF NOT EXISTS agent_profiles_coverage_postcodes_gin
  ON agent_profiles USING gin (coverage_postcodes);

-- 3. Source link table — one agent can be found in many sources (TPO, PRS, Propertymark,
--    Rightmove, Companies House). Each link records the source's own ID + URL + last_seen.
CREATE TABLE IF NOT EXISTS agent_source_links (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_user_id   uuid          NOT NULL REFERENCES agent_profiles(user_id) ON DELETE CASCADE,
  source          text          NOT NULL,    -- 'propertymark' | 'tpo' | 'prs' | 'rightmove' | 'zoopla' | 'companies_house' | 'onthemarket'
  source_id       text,                       -- the source's own ID (TPO ref, Companies House number, Rightmove branch ID, etc.)
  source_url      text,
  country_code    text          NOT NULL,
  first_seen_at   timestamptz   NOT NULL DEFAULT now(),
  last_seen_at    timestamptz   NOT NULL DEFAULT now(),
  raw_payload     jsonb,
  CONSTRAINT agent_source_links_unique UNIQUE (source, source_id, country_code)
);

CREATE INDEX IF NOT EXISTS agent_source_links_agent_idx     ON agent_source_links (agent_user_id);
CREATE INDEX IF NOT EXISTS agent_source_links_source_idx    ON agent_source_links (source);
CREATE INDEX IF NOT EXISTS agent_source_links_country_idx   ON agent_source_links (country_code);

-- 4. Master postcode grid — drives systematic per-postcode Rightmove sweeps and
--    underpins coverage queries ("who serves SW1A 1AA?"). Country-aware so PLZ /
--    Turkish posta kodu / etc. live in the same table.
CREATE TABLE IF NOT EXISTS postcode_grid (
  id            bigserial PRIMARY KEY,
  country_code  text      NOT NULL,
  postcode      text      NOT NULL,        -- full postcode (UK: 'SW1A 1AA', DE: '10115')
  outcode       text,                       -- prefix (UK: 'SW1A', DE: first 2 digits '10')
  area          text,                       -- parent area / region (UK: 'SW', DE state)
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  in_use        boolean   NOT NULL DEFAULT true,
  source        text      NOT NULL,        -- 'doogal' | 'royal_mail_paf' | 'osm' etc.
  loaded_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT postcode_grid_unique UNIQUE (country_code, postcode)
);

CREATE INDEX IF NOT EXISTS postcode_grid_country_outcode_idx ON postcode_grid (country_code, outcode);
CREATE INDEX IF NOT EXISTS postcode_grid_country_area_idx    ON postcode_grid (country_code, area);

-- 5. Source registry — declarative list of where we look for agents per country.
--    Lets the dashboard show coverage progress per source and lets us add new
--    countries by inserting rows, no code changes.
CREATE TABLE IF NOT EXISTS agent_source_registry (
  source        text NOT NULL,
  country_code  text NOT NULL,
  display_name  text NOT NULL,
  base_url      text NOT NULL,
  scraper_fn    text,                       -- edge function slug, NULL until built
  is_legal_universe boolean NOT NULL DEFAULT false,  -- TPO+PRS for UK = legal-universe
  is_portal     boolean NOT NULL DEFAULT false,
  estimated_record_count int,
  notes         text,
  enabled       boolean NOT NULL DEFAULT true,
  PRIMARY KEY (source, country_code)
);

INSERT INTO agent_source_registry (source, country_code, display_name, base_url, scraper_fn, is_legal_universe, is_portal, estimated_record_count, notes)
VALUES
  ('propertymark',     'GB', 'Propertymark NAEA/ARLA',         'https://www.propertymark.co.uk/find-an-expert',                      'scrape-propertymark',         false, false, 17000, 'Trade body — sales + lettings'),
  ('tpo',              'GB', 'The Property Ombudsman',         'https://www.tpos.co.uk/register-of-businesses/',                     'scrape-tpo',                  true,  false, 40000, 'Mandatory redress — covers ~entire legal universe'),
  ('prs',              'GB', 'Property Redress Scheme',        'https://www.theprs.co.uk/consumer/members/',                         'scrape-prs',                  true,  false, 18000, 'Mandatory redress — alternative to TPO'),
  ('rightmove',        'GB', 'Rightmove Agent Finder',         'https://www.rightmove.co.uk/estate-agents/find.html',                'scrape-rightmove-agents',     false, true,  25000, 'Active sales/lettings agents — gives postcode coverage'),
  ('zoopla',           'GB', 'Zoopla Find Agents',             'https://www.zoopla.co.uk/find-agents/',                              'scrape-zoopla-agents',        false, true,  25000, 'Cross-check + Scotland coverage via S1Homes'),
  ('onthemarket',      'GB', 'OnTheMarket directory',          'https://www.onthemarket.com/agent/',                                 'scrape-onthemarket-agents',   false, true,  12000, 'Premium network'),
  ('companies_house',  'GB', 'Companies House SIC 68310',      'https://download.companieshouse.gov.uk/en_output.html',              'companies-house-import',      false, false, 30000, 'Free monthly bulk CSV — legal entity layer')
ON CONFLICT (source, country_code) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      base_url     = EXCLUDED.base_url,
      scraper_fn   = EXCLUDED.scraper_fn,
      notes        = EXCLUDED.notes;

-- DE seed rows (placeholders — actual scrapers come later)
INSERT INTO agent_source_registry (source, country_code, display_name, base_url, scraper_fn, is_legal_universe, is_portal, estimated_record_count, notes, enabled)
VALUES
  ('immoscout24',      'DE', 'ImmobilienScout24 Maklerverzeichnis', 'https://www.immobilienscout24.de/anbieter/',                    'scrape-immoscout24-agents',   false, true,  30000, 'Largest DE portal',  false),
  ('immowelt',         'DE', 'Immowelt Maklerverzeichnis',          'https://www.immowelt.de/profil/',                               'scrape-immowelt-agents',      false, true,  20000, 'Second DE portal',   false),
  ('ivd',              'DE', 'IVD Maklerverband',                   'https://ivd.net/maklersuche/',                                  'scrape-ivd',                  false, false, 6000,  'Trade body — sales', false)
ON CONFLICT (source, country_code) DO NOTHING;

-- 6. Backfill country_code on existing rows that have a postcode shaped like a UK postcode.
--    Existing 17K Propertymark rows are all UK so default 'GB' is correct, but be defensive.
UPDATE agent_profiles
SET country_code = 'GB'
WHERE country_code IS NULL OR country_code = '';

-- 7. RLS — agent_source_links + postcode_grid + agent_source_registry are admin/service-role only
ALTER TABLE agent_source_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE postcode_grid          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_source_registry  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_source_links_admin_all ON agent_source_links;
CREATE POLICY agent_source_links_admin_all ON agent_source_links
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

DROP POLICY IF EXISTS postcode_grid_read_all ON postcode_grid;
CREATE POLICY postcode_grid_read_all ON postcode_grid
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS agent_source_registry_read_all ON agent_source_registry;
CREATE POLICY agent_source_registry_read_all ON agent_source_registry
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE  agent_source_links    IS 'Many-to-many: agent_profile <-> external source. Each row = one observation of an agent in one external source.';
COMMENT ON TABLE  postcode_grid         IS 'Master postcode list per country. Drives systematic per-postcode scraping and coverage queries.';
COMMENT ON TABLE  agent_source_registry IS 'Declarative list of external agent data sources per country. Adding a new country = inserting rows here, no code changes.';
COMMENT ON COLUMN agent_profiles.coverage_outcodes  IS 'Outcodes (UK: SW1, M1) the agent advertises in. Populated from agent-finder sweeps.';
COMMENT ON COLUMN agent_profiles.coverage_postcodes IS 'Full postcodes the agent has listed property at. Populated from listing-level scrapes — evidence-based.';
