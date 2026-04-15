-- =============================================================================
-- PROPERTY TAG TAXONOMY
-- Normalised tag system for hunter preferences and listing features.
-- Tags live in a reference table; hunters pick them as want/need/dealbreaker;
-- listings get them via scraping, manual entry, or inference.
-- =============================================================================

-- 1. Reference table — canonical vocabulary
CREATE TABLE IF NOT EXISTS property_tags (
  id            serial PRIMARY KEY,
  slug          text UNIQUE NOT NULL,                    -- e.g. 'wheelchair_accessible'
  category      text NOT NULL CHECK (category IN (
    'accessibility','outdoor','community','building',
    'pets','lifestyle','parking','energy','safety','rental'
  )),
  label_en      text NOT NULL,
  label_de      text NOT NULL,
  icon          text,                                    -- optional lucide icon name
  country_codes text[] DEFAULT '{}',                     -- empty = all countries
  intent_filter text CHECK (intent_filter IN ('buy','rent',NULL)),  -- null = both
  sort_order    smallint DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_property_tags_category ON property_tags(category);
CREATE INDEX idx_property_tags_country  ON property_tags USING gin(country_codes);

-- 2. Hunter ↔ Tag junction (preferences)
CREATE TABLE IF NOT EXISTS hunter_preference_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id      int  NOT NULL REFERENCES property_tags(id) ON DELETE CASCADE,
  sentiment   text NOT NULL CHECK (sentiment IN ('want','need','dealbreaker')),
  source      text NOT NULL CHECK (source IN ('manual','intake','inferred')) DEFAULT 'intake',
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, tag_id)
);

CREATE INDEX idx_hpt_user     ON hunter_preference_tags(user_id);
CREATE INDEX idx_hpt_tag      ON hunter_preference_tags(tag_id);
CREATE INDEX idx_hpt_sentiment ON hunter_preference_tags(sentiment);

ALTER TABLE hunter_preference_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hpt_own" ON hunter_preference_tags
  FOR ALL USING (auth.uid() = user_id);

-- 3. Listing ↔ Tag junction (features)
CREATE TABLE IF NOT EXISTS listing_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tag_id      int  NOT NULL REFERENCES property_tags(id) ON DELETE CASCADE,
  source      text NOT NULL CHECK (source IN ('manual','scraped','inferred')) DEFAULT 'manual',
  confidence  numeric(3,2) DEFAULT 1.00,   -- 0.00–1.00 for scraped/inferred
  created_at  timestamptz DEFAULT now(),
  UNIQUE (listing_id, tag_id)
);

CREATE INDEX idx_lt_listing    ON listing_tags(listing_id);
CREATE INDEX idx_lt_tag        ON listing_tags(tag_id);
CREATE INDEX idx_lt_source     ON listing_tags(source);

ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;
-- Public can read tags for active listings; owners manage their own
CREATE POLICY "lt_public_read" ON listing_tags
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE status = 'active')
  );
CREATE POLICY "lt_owner_all" ON listing_tags
  FOR ALL USING (
    listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
  );

-- =============================================================================
-- SEED DATA — ~50 tags across 10 categories
-- =============================================================================

INSERT INTO property_tags (slug, category, label_en, label_de, icon, country_codes, intent_filter, sort_order) VALUES
-- ── Accessibility ──
('wheelchair_accessible',  'accessibility', 'Wheelchair Accessible',     'Rollstuhlgerecht',          'accessibility', '{}', NULL, 1),
('step_free_access',       'accessibility', 'Step-Free Access',          'Stufenloser Zugang',        'accessibility', '{}', NULL, 2),
('ground_floor',           'accessibility', 'Ground Floor',              'Erdgeschoss',               'accessibility', '{}', NULL, 3),
('wide_doorways',          'accessibility', 'Wide Doorways',             'Breite Türrahmen',          'accessibility', '{}', NULL, 4),
('walk_in_shower',         'accessibility', 'Walk-In Shower',            'Ebenerdige Dusche',         'accessibility', '{}', NULL, 5),
('lift_access',            'accessibility', 'Lift Access',               'Aufzug vorhanden',          'accessibility', '{}', NULL, 6),

-- ── Outdoor ──
('private_garden',         'outdoor',       'Private Garden',            'Eigener Garten',            'trees',         '{}', NULL, 1),
('shared_garden',          'outdoor',       'Shared Garden',             'Gemeinschaftsgarten',       'trees',         '{}', NULL, 2),
('balcony',                'outdoor',       'Balcony',                   'Balkon',                    'sun',           '{}', NULL, 3),
('terrace',                'outdoor',       'Terrace / Patio',           'Terrasse',                  'sun',           '{}', NULL, 4),
('roof_terrace',           'outdoor',       'Roof Terrace',              'Dachterrasse',              'sun',           '{}', NULL, 5),
('allotment',              'outdoor',       'Allotment / Plot',          'Schrebergarten',            'shovel',        '{DE}', NULL, 6),

-- ── Community ──
('community_garden',       'community',     'Community Garden',          'Gemeinschaftsgarten',       'flower-2',      '{}', NULL, 1),
('communal_lounge',        'community',     'Communal Lounge',           'Gemeinschaftsraum',         'sofa',          '{}', NULL, 2),
('concierge',              'community',     'Concierge / Doorman',       'Concierge / Pförtner',      'bell',          '{}', NULL, 3),
('gym_on_site',            'community',     'On-Site Gym',               'Hauseigenes Fitnessstudio', 'dumbbell',      '{}', NULL, 4),
('co_working_space',       'community',     'Co-Working Space',          'Co-Working-Bereich',        'laptop',        '{}', NULL, 5),
('play_area',              'community',     'Children''s Play Area',     'Kinderspielplatz',          'baby',          '{}', NULL, 6),
('bike_storage',           'community',     'Bike Storage',              'Fahrradstellplatz',         'bike',          '{}', NULL, 7),

-- ── Building ──
('new_build',              'building',      'New Build',                 'Neubau',                    'building',      '{}', NULL, 1),
('period_features',        'building',      'Period Features',           'Altbau-Charme',             'landmark',      '{}', NULL, 2),
('open_plan',              'building',      'Open Plan Living',          'Offener Grundriss',         'layout-grid',   '{}', NULL, 3),
('high_ceilings',          'building',      'High Ceilings',             'Hohe Decken',               'arrow-up',      '{}', NULL, 4),
('storage_room',           'building',      'Storage Room / Cellar',     'Abstellraum / Keller',      'box',           '{}', NULL, 5),
('guest_wc',               'building',      'Guest WC',                  'Gäste-WC',                  'bath',          '{}', NULL, 6),
('ensuite',                'building',      'En-Suite Bathroom',         'Eigenes Bad (en suite)',     'bath',          '{}', NULL, 7),
('utility_room',           'building',      'Utility Room',              'Hauswirtschaftsraum',       'washing-machine','{}', NULL, 8),
('double_glazing',         'building',      'Double Glazing',            'Doppelverglasung',          'layers',        '{GB}', NULL, 9),

-- ── Pets ──
('pets_allowed',           'pets',          'Pets Allowed',              'Haustiere erlaubt',         'paw-print',     '{}', 'rent', 1),
('dogs_allowed',           'pets',          'Dogs Allowed',              'Hunde erlaubt',             'paw-print',     '{}', 'rent', 2),
('cats_allowed',           'pets',          'Cats Allowed',              'Katzen erlaubt',            'paw-print',     '{}', 'rent', 3),
('no_pets',                'pets',          'No Pets Allowed',           'Keine Haustiere',           'ban',           '{}', 'rent', 4),

-- ── Lifestyle ──
('near_station',           'lifestyle',     'Near Train / Tube Station', 'Nahe U-/S-Bahn',           'train-front',   '{}', NULL, 1),
('quiet_street',           'lifestyle',     'Quiet Street',              'Ruhige Straße',             'volume-x',      '{}', NULL, 2),
('near_schools',           'lifestyle',     'Near Good Schools',         'Nahe guter Schulen',        'graduation-cap','{}', NULL, 3),
('near_parks',             'lifestyle',     'Near Parks / Green Spaces', 'Nahe Parks / Grünflächen',  'tree-pine',     '{}', NULL, 4),
('shops_nearby',           'lifestyle',     'Shops & Amenities Nearby',  'Geschäfte in der Nähe',     'shopping-bag',  '{}', NULL, 5),
('work_from_home',         'lifestyle',     'Suitable for WFH',          'Geeignet für Homeoffice',   'home',          '{}', NULL, 6),

-- ── Parking ──
('off_street_parking',     'parking',       'Off-Street Parking',        'Eigener Stellplatz',        'car',           '{}', NULL, 1),
('garage',                 'parking',       'Garage',                    'Garage',                    'car',           '{}', NULL, 2),
('ev_charging',            'parking',       'EV Charging Point',         'E-Ladestation',             'zap',           '{}', NULL, 3),
('permit_parking',         'parking',       'Residents'' Permit Parking','Bewohnerparkausweis',       'car',           '{GB}', NULL, 4),

-- ── Energy ──
('solar_panels',           'energy',        'Solar Panels',              'Solaranlage',               'sun',           '{}', NULL, 1),
('heat_pump',              'energy',        'Heat Pump',                 'Wärmepumpe',                'thermometer',   '{}', NULL, 2),
('epc_a_b',                'energy',        'EPC Rating A–B',            'Energieeffizienz A–B',      'leaf',          '{GB}', NULL, 3),
('kfw_efficient',          'energy',        'KfW Efficiency Standard',   'KfW-Effizienzhaus',         'leaf',          '{DE}', NULL, 4),
('gas_central_heating',    'energy',        'Gas Central Heating',       'Gas-Zentralheizung',        'flame',         '{}', NULL, 5),

-- ── Safety ──
('gated_community',        'safety',        'Gated / Secure Entry',     'Gesicherte Anlage',         'lock',          '{}', NULL, 1),
('cctv',                   'safety',        'CCTV / Security Cameras',  'Videoüberwachung',          'camera',        '{}', NULL, 2),
('alarm_system',           'safety',        'Alarm System',              'Alarmanlage',               'siren',         '{}', NULL, 3),
('fire_alarm',             'safety',        'Fire / Smoke Alarms',      'Rauchmelder',               'siren',         '{}', NULL, 4),

-- ── Rental-specific ──
('furnished',              'rental',        'Furnished',                 'Möbliert',                  'armchair',      '{}', 'rent', 1),
('part_furnished',         'rental',        'Part Furnished',            'Teilmöbliert',              'armchair',      '{}', 'rent', 2),
('unfurnished',            'rental',        'Unfurnished',               'Unmöbliert',                'armchair',      '{}', 'rent', 3),
('bills_included',         'rental',        'Bills Included',            'Nebenkosten inklusive',     'receipt',       '{}', 'rent', 4),
('dss_accepted',           'rental',        'DSS / Housing Benefit OK',  'Wohngeld akzeptiert',       'hand-heart',   '{GB}', 'rent', 5),
('short_let_ok',           'rental',        'Short Let Available',       'Kurzzeitmiete möglich',     'calendar',      '{}', 'rent', 6),
('students_welcome',       'rental',        'Students Welcome',          'Studenten willkommen',      'graduation-cap','{}', 'rent', 7),
('sharers_ok',             'rental',        'Sharers Accepted',          'WG-geeignet',               'users',         '{}', 'rent', 8)

ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- MATCHING FUNCTION — scores a listing's tags against a hunter's preference tags
-- Returns a 0–100 score.
-- =============================================================================

CREATE OR REPLACE FUNCTION score_tag_match(
  p_hunter_id uuid,
  p_listing_id uuid
) RETURNS int AS $$
DECLARE
  need_count    int := 0;
  need_matched  int := 0;
  want_count    int := 0;
  want_matched  int := 0;
  has_breaker   boolean := false;
  score         int := 0;
BEGIN
  -- Check dealbreakers first (hard filter)
  SELECT EXISTS (
    SELECT 1
    FROM hunter_preference_tags hp
    JOIN listing_tags lt ON lt.tag_id = hp.tag_id
    WHERE hp.user_id = p_hunter_id
      AND lt.listing_id = p_listing_id
      AND hp.sentiment = 'dealbreaker'
  ) INTO has_breaker;

  IF has_breaker THEN RETURN 0; END IF;

  -- Count needs
  SELECT COUNT(*) INTO need_count
  FROM hunter_preference_tags
  WHERE user_id = p_hunter_id AND sentiment = 'need';

  SELECT COUNT(*) INTO need_matched
  FROM hunter_preference_tags hp
  JOIN listing_tags lt ON lt.tag_id = hp.tag_id AND lt.listing_id = p_listing_id
  WHERE hp.user_id = p_hunter_id AND hp.sentiment = 'need';

  -- Count wants
  SELECT COUNT(*) INTO want_count
  FROM hunter_preference_tags
  WHERE user_id = p_hunter_id AND sentiment = 'want';

  SELECT COUNT(*) INTO want_matched
  FROM hunter_preference_tags hp
  JOIN listing_tags lt ON lt.tag_id = hp.tag_id AND lt.listing_id = p_listing_id
  WHERE hp.user_id = p_hunter_id AND hp.sentiment = 'want';

  -- Score: needs weighted 70%, wants weighted 30%
  IF need_count > 0 THEN
    score := score + ((need_matched * 100 / need_count) * 70 / 100);
  ELSE
    score := score + 70;  -- no needs = full marks for needs dimension
  END IF;

  IF want_count > 0 THEN
    score := score + ((want_matched * 100 / want_count) * 30 / 100);
  ELSE
    score := score + 30;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;
