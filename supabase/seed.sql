-- =============================================================================
-- Yalla.House — Seed Data
-- Market: Germany (DE) first, UK configured but inactive
-- =============================================================================

-- ---------------------------------------------------------------------------
-- COUNTRY CONFIG
-- ---------------------------------------------------------------------------

INSERT INTO country_config (code, name, name_local, currency, default_units, legal_tenure_models, required_listing_fields, legal_notes, is_active) VALUES
(
  'DE',
  'Germany',
  'Deutschland',
  'EUR',
  'sqm',
  ARRAY['freehold','leasehold'],
  ARRAY['energy_class','size_sqm','property_type'],
  'Maklergesetz (MaBV) applies. Courtage disclosure required. Energy certificate mandatory for listings. DSGVO applies to all personal data.',
  true  -- ACTIVE: first market
),
(
  'GB',
  'United Kingdom',
  'United Kingdom',
  'GBP',
  'sqft',
  ARRAY['freehold','leasehold','commonhold','share_of_freehold'],
  ARRAY['epc_rating','tenure','property_type'],
  'Estate Agents Act 1979 applies. EPC required before marketing. GDPR applies.',
  false  -- INACTIVE: not yet launched
),
(
  'AT',
  'Austria',
  'Österreich',
  'EUR',
  'sqm',
  ARRAY['freehold','leasehold'],
  ARRAY['energy_class','size_sqm'],
  'MaklerG (Maklergesetz) applies.',
  false
),
(
  'CH',
  'Switzerland',
  'Schweiz',
  'CHF',
  'sqm',
  ARRAY['freehold','leasehold'],
  ARRAY['size_sqm'],
  'Cantonal rules apply.',
  false
);

-- ---------------------------------------------------------------------------
-- PORTAL CONFIG — Germany
-- ---------------------------------------------------------------------------

INSERT INTO portal_config (country_code, slug, display_name, website_url, feed_format, auth_type, cost_per_listing, currency, min_photos, max_photos, is_active, notes) VALUES
(
  'DE',
  'immoscout24',
  'ImmobilienScout24',
  'https://www.immobilienscout24.de',
  'api',
  'oauth2',
  4990,   -- 49.90 EUR in cents
  'EUR',
  3,
  50,
  true,
  'Primary DE portal. REST API with OAuth2. Requires IS24 partner account. Sandbox available at sandbox.immobilienscout24.de'
),
(
  'DE',
  'immowelt',
  'Immowelt',
  'https://www.immowelt.de',
  'api',
  'api_key',
  2990,   -- 29.90 EUR in cents
  'EUR',
  3,
  30,
  true,
  'Secondary DE portal. REST API with API key. Also covers immonet.de (same company). Sandbox available.'
),
(
  'DE',
  'ebay_kleinanzeigen',
  'eBay Kleinanzeigen (Kleinanzeigen.de)',
  'https://www.kleinanzeigen.de',
  'api',
  'oauth2',
  0,      -- free basic listings
  'EUR',
  1,
  20,
  false,  -- lower priority, add Phase 1.5
  'Free classified listings. Good for reach but lower intent buyers. OAuth2 via eBay API.'
),
(
  'DE',
  'immonet',
  'Immonet',
  'https://www.immonet.de',
  'api',
  'api_key',
  0,      -- included with Immowelt
  'EUR',
  3,
  30,
  false,  -- auto-synced via immowelt partnership
  'Owned by Axel Springer (same as Immowelt group). Listings auto-syndicated via Immowelt.'
);

-- Portal config for UK (inactive until Phase 1.5)
INSERT INTO portal_config (country_code, slug, display_name, website_url, feed_format, auth_type, cost_per_listing, currency, min_photos, max_photos, is_active, notes) VALUES
(
  'GB',
  'rightmove',
  'Rightmove',
  'https://www.rightmove.co.uk',
  'xml',
  'basic',
  NULL,   -- negotiated per contract
  'GBP',
  1,
  50,
  false,
  'Rightmove RTDF (Real Time Data Feed). XML format. Requires NAEA/ARLA membership or direct Rightmove contract. Apply early — long approval process.'
),
(
  'GB',
  'zoopla',
  'Zoopla',
  'https://www.zoopla.co.uk',
  'xml',
  'api_key',
  NULL,
  'GBP',
  1,
  50,
  false,
  'Zoopla Data Feed. XML or API. Requires partnership agreement with Zoopla.'
);

-- ---------------------------------------------------------------------------
-- PORTAL FIELD MAPPINGS — ImmobilienScout24
-- ---------------------------------------------------------------------------

INSERT INTO portal_field_mappings (portal_id, internal_field, portal_field, transform, is_required)
SELECT
  pc.id,
  m.internal_field,
  m.portal_field,
  m.transform::jsonb,
  m.is_required
FROM portal_config pc
CROSS JOIN (VALUES
  ('property_type', 'realty_type',     '{"house":"HOUSE","flat":"APARTMENT","apartment":"APARTMENT","villa":"HOUSE","commercial":"OFFICE","land":"LIVING_SITE","other":"GARAGE"}', true),
  ('intent',        'object_type',     '{"sale":"IS24_OBJECT_TYPE_SELL","rent":"IS24_OBJECT_TYPE_RENT"}', true),
  ('bedrooms',      'number_of_rooms', NULL, false),
  ('bathrooms',     'number_of_bathrooms', NULL, false),
  ('size_sqm',      'living_space',    NULL, true),
  ('sale_price',    'price',           NULL, false),
  ('rent_price',    'base_rent',       NULL, false),
  ('postcode',      'postal_code',     NULL, true),
  ('city',          'city',            NULL, true),
  ('description_de','description',     NULL, false),
  ('title_de',      'headline',        NULL, false)
) AS m(internal_field, portal_field, transform, is_required)
WHERE pc.slug = 'immoscout24';

-- ---------------------------------------------------------------------------
-- PORTAL FIELD MAPPINGS — Immowelt
-- ---------------------------------------------------------------------------

INSERT INTO portal_field_mappings (portal_id, internal_field, portal_field, transform, is_required)
SELECT
  pc.id,
  m.internal_field,
  m.portal_field,
  m.transform::jsonb,
  m.is_required
FROM portal_config pc
CROSS JOIN (VALUES
  ('property_type', 'type',            '{"house":"EINFAMILIENHAUS","flat":"ETAGE","apartment":"WOHNUNG","villa":"VILLA","commercial":"BUERO","land":"GRUNDSTUECK"}', true),
  ('intent',        'offer_type',      '{"sale":"KAUF","rent":"MIETE"}', true),
  ('bedrooms',      'rooms',           NULL, false),
  ('size_sqm',      'area',            NULL, true),
  ('sale_price',    'price',           NULL, false),
  ('rent_price',    'cold_rent',       NULL, false),
  ('nebenkosten',   'additional_costs',NULL, false),
  ('kaution',       'deposit',         NULL, false),
  ('postcode',      'zip_code',        NULL, true),
  ('city',          'city',            NULL, true),
  ('description_de','description',     NULL, false),
  ('title_de',      'title',           NULL, false)
) AS m(internal_field, portal_field, transform, is_required)
WHERE pc.slug = 'immowelt';

-- ---------------------------------------------------------------------------
-- SUBSCRIPTION PLANS — Germany
-- ---------------------------------------------------------------------------

INSERT INTO subscription_plans (name, name_de, target_role, country_code, amount, currency, period, features) VALUES
(
  'Basis',
  'Basis',
  'owner',
  'DE',
  19900,   -- 199 EUR in cents
  'EUR',
  'one_off',
  '[
    "Listing on ImmobilienScout24 & Immowelt",
    "Owner dashboard",
    "Viewing calendar",
    "Offer management",
    "Weekly progress reports",
    "Yalla.House public property page",
    "QR code + shareable link"
  ]'::jsonb
),
(
  'Professional',
  'Professional',
  'owner',
  'DE',
  49900,   -- 499 EUR in cents
  'EUR',
  'one_off',
  '[
    "Everything in Basis",
    "Professional photography (Berlin/Hamburg/Munich/Frankfurt)",
    "Floorplan creation",
    "For-Sale board (Verkaufsschild)",
    "Enhanced portal listing (premium position)",
    "Energy certificate coordination"
  ]'::jsonb
),
(
  'Komplett',
  'Komplett',
  'owner',
  'DE',
  89900,   -- 899 EUR in cents
  'EUR',
  'one_off',
  '[
    "Everything in Professional",
    "360° Virtual Tour",
    "Dedicated advisor",
    "Legal support (Notar coordination)",
    "Negotiation assistance",
    "Full transaction management"
  ]'::jsonb
),
-- Agent subscription plans
(
  'Agent Free',
  'Agent Kostenlos',
  'agent',
  'DE',
  0,
  'EUR',
  'monthly',
  '["Up to 5 active leads","Basic inbox","Coverage profile"]'::jsonb
),
(
  'Agent Pro',
  'Agent Pro',
  'agent',
  'DE',
  4900,   -- 49 EUR/month
  'EUR',
  'monthly',
  '["Unlimited leads","Priority inbox","Analytics","ImmobilienScout24 feed access","Verified badge"]'::jsonb
);

-- ---------------------------------------------------------------------------
-- REFERRAL CONFIG (milestone payout values — EUR)
-- These are applied when referral_events are created
-- ---------------------------------------------------------------------------

-- Note: actual referral_event values set via application code
-- These comments define the intended payout table for Germany:
--
-- SIGNUP:             0.00 EUR  (no payout for just signing up)
-- LISTING_DRAFT:      0.00 EUR  (no payout for draft)
-- LISTING_PUBLISHED:  25.00 EUR (listing goes live — 30-day hold)
-- FIRST_BOOKING:      15.00 EUR (first viewing booked by referred owner's hunter)
-- PAID_PLAN:          50.00 EUR (owner purchases any paid plan)
-- AGENT_ACTIVATED:    30.00 EUR (referred agent completes onboarding + first lead claim)
