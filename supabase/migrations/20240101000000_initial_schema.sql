-- =============================================================================
-- Yalla.House — PostgreSQL Schema
-- Version: 1.0 | Market: DE-first
-- Run via: supabase db push
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- location-based search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy text search

-- =============================================================================
-- IDENTITY & ROLES
-- =============================================================================

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  phone         text,
  full_name     text,
  avatar_url    text,
  country_code  char(2) DEFAULT 'DE',
  language           char(5) DEFAULT 'de-DE',
  referrer_id        uuid,  -- FK added after referrers table
  stripe_customer_id text UNIQUE,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

-- One user can hold multiple roles (owner can also be a referrer, etc.)
CREATE TABLE user_roles (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','hunter','agent','partner','referrer','admin')),
  is_active    bool DEFAULT true,
  onboarded_at timestamptz,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE owner_profiles (
  user_id      uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  tax_id       text,  -- Steuernummer (DE requirement)
  verified_at  timestamptz
);

CREATE TABLE hunter_profiles (
  user_id                    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  budget_min                 int,       -- minor currency units (cents)
  budget_max                 int,
  currency                   char(3) DEFAULT 'EUR',
  target_areas               jsonb,     -- [{city, postcode_prefix, radius_km}]
  property_types             text[],    -- ['house','flat','apartment']
  intent                     text CHECK (intent IN ('buy','rent','both')),
  timeline                   text CHECK (timeline IN ('asap','3m','6m','1y','flexible')),
  agent_assistance_consented bool DEFAULT false
);

CREATE TABLE agent_profiles (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  agency_name       text,
  license_number    text,   -- Maklernummer (DE)
  coverage_areas    jsonb,  -- [{country_code, region, postcode_prefixes[]}]
  property_types    text[],
  price_bands       jsonb,  -- [{min, max, currency}]
  languages         text[] DEFAULT ARRAY['de'],
  focus             text CHECK (focus IN ('sale','rent','both')) DEFAULT 'both',
  verified_at       timestamptz,
  subscription_tier text CHECK (subscription_tier IN ('free','pro','enterprise')) DEFAULT 'free'
);

CREATE TABLE partner_profiles (
  user_id        uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  service_types  text[],  -- 'photography','survey','energy_cert','floorplan','cleaning'
  coverage_areas jsonb,
  verified_at    timestamptz
);

-- =============================================================================
-- COUNTRY & PORTAL CONFIGURATION
-- =============================================================================

CREATE TABLE country_config (
  code                    char(2) PRIMARY KEY,
  name                    text NOT NULL,
  name_local              text NOT NULL,   -- "Deutschland" for DE
  currency                char(3) NOT NULL,
  default_units           text CHECK (default_units IN ('sqm','sqft')) DEFAULT 'sqm',
  legal_tenure_models     text[],
  required_listing_fields text[],          -- validated at publish time
  legal_notes             text,
  is_active               bool DEFAULT false,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE portal_config (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code     char(2) NOT NULL REFERENCES country_config(code),
  slug             text UNIQUE NOT NULL,   -- 'immoscout24', 'immowelt', 'rightmove'
  display_name     text NOT NULL,
  website_url      text,
  feed_format      text CHECK (feed_format IN ('xml','json','csv','api')),
  auth_type        text CHECK (auth_type IN ('basic','oauth2','api_key','none')),
  cost_per_listing numeric(8,2),
  currency         char(3),
  min_photos       int DEFAULT 3,
  max_photos       int DEFAULT 50,
  is_active        bool DEFAULT false,
  notes            text
);

CREATE TABLE portal_credentials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id   uuid NOT NULL REFERENCES portal_config(id),
  key_name    text NOT NULL,
  key_value   text NOT NULL,  -- encrypted at rest via Supabase vault
  environment text CHECK (environment IN ('production','sandbox')) DEFAULT 'sandbox',
  created_at  timestamptz DEFAULT now()
);

-- Per-listing portal submission state
CREATE TABLE listing_portal_status (
  listing_id         uuid NOT NULL,  -- FK added after listings table
  portal_id          uuid NOT NULL REFERENCES portal_config(id),
  status             text CHECK (status IN ('pending','queued','published','failed','paused','withdrawn')) DEFAULT 'pending',
  external_id        text,           -- portal's own ID for the listing
  last_sync_at       timestamptz,
  submitted_at       timestamptz,    -- when first submitted to the portal (for TTL calculation)
  live_at            timestamptz,    -- when portal confirmed listing is live (for TTL = live_at - submitted_at)
  error_message      text,
  validation_errors  jsonb DEFAULT '[]',  -- structured errors from connector.validateListing()
  retry_count        int DEFAULT 0,
  PRIMARY KEY (listing_id, portal_id)
);

-- Field transformation map: internal field → portal-specific field + value transform
CREATE TABLE portal_field_mappings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id      uuid NOT NULL REFERENCES portal_config(id),
  internal_field text NOT NULL,  -- 'property_type'
  portal_field   text NOT NULL,  -- 'objekttyp'
  transform      jsonb,          -- {"house":"EINFAMILIENHAUS","flat":"ETAGE","apartment":"WOHNUNG"}
  is_required    bool DEFAULT false
);

-- =============================================================================
-- LISTINGS
-- =============================================================================

CREATE TABLE listings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id         text UNIQUE NOT NULL,  -- stable public ID, e.g. 'yh_de_abc123' — never changes
  owner_id         uuid NOT NULL REFERENCES users(id),
  agent_id         uuid REFERENCES users(id),  -- optional assigned agent
  country_code     char(2) NOT NULL REFERENCES country_config(code),

  -- Status lifecycle
  status           text NOT NULL CHECK (status IN (
    'draft','preview','active','paused','under_offer','sold','let','archived'
  )) DEFAULT 'draft',
  intent           text NOT NULL CHECK (intent IN ('sale','rent','both')),

  -- Location
  address_line1    text NOT NULL,
  address_line2    text,
  city             text NOT NULL,
  region           text,               -- Bundesland for DE
  postcode         text NOT NULL,
  lat              numeric(10,7),
  lng              numeric(10,7),

  -- Property
  property_type    text NOT NULL CHECK (property_type IN (
    'house','flat','apartment','villa','commercial','land','other'
  )),
  bedrooms         smallint,
  bathrooms        smallint,
  size_sqm         numeric(8,1),
  floor            smallint,           -- Etage (common in DE)
  total_floors     smallint,
  construction_year smallint,
  tenure           text CHECK (tenure IN (
    'freehold','leasehold','commonhold','share_of_freehold','other'
  )),

  -- Pricing — ALWAYS stored in minor currency units (cents/pence)
  sale_price       int,
  rent_price       int,
  rent_period      text CHECK (rent_period IN ('pw','pcm','pq','pa')),
  nebenkosten      int,               -- German: Betriebskosten/service charges
  kaution          int,               -- German: deposit (usually 3× Kaltmiete)
  currency         char(3) NOT NULL DEFAULT 'EUR',
  price_qualifier  text CHECK (price_qualifier IN (
    'offers_over','guide_price','fixed_price','poa','vb'  -- 'vb' = Verhandlungsbasis (DE)
  )),

  -- Content
  title            text,
  title_de         text,              -- German title
  description      text,
  description_de   text,              -- German description
  key_features     text[],
  key_features_de  text[],
  seller_situation text,
  preferred_completion text,

  -- Germany-specific fields (stored as JSONB for flexibility across countries)
  -- DE: energy_class, grundbuch_ref, wohnlage, heizungsart, courtage, etc.
  country_fields   jsonb DEFAULT '{}',

  -- Portal aggregator state
  portal_status    jsonb DEFAULT '{}', -- {"immoscout24":"active","immowelt":"pending"}
  last_feed_at     timestamptz,

  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  published_at     timestamptz
);

-- Indexes
CREATE INDEX idx_listings_owner      ON listings(owner_id);
CREATE INDEX idx_listings_status     ON listings(status);
CREATE INDEX idx_listings_country    ON listings(country_code);
CREATE INDEX idx_listings_place_id   ON listings(place_id);
CREATE INDEX idx_listings_postcode   ON listings(postcode);
CREATE INDEX idx_listings_city       ON listings(city);
-- Geospatial index for proximity search
CREATE INDEX idx_listings_location   ON listings USING gist(st_point(lng, lat));
-- Full-text search index (German + English)
CREATE INDEX idx_listings_fts ON listings USING gin(
  to_tsvector('german', coalesce(title_de,'') || ' ' || coalesce(description_de,'') || ' ' || coalesce(city,'') || ' ' || coalesce(postcode,''))
);

-- Add FK to listing_portal_status
ALTER TABLE listing_portal_status
  ADD CONSTRAINT fk_lps_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

CREATE TABLE listing_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('photo','floorplan','energy_cert','video','document','360_tour')),
  url         text NOT NULL,
  thumb_url   text,
  caption     text,
  caption_de  text,
  sort_order  int DEFAULT 0,
  is_primary  bool DEFAULT false,
  width_px    int,
  height_px   int,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE listing_features (
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  feature_key text NOT NULL,  -- 'garden','parking','garage','lift','balcony','cellar','pets_allowed','district_heating'
  value       text,
  PRIMARY KEY (listing_id, feature_key)
);

-- =============================================================================
-- AVAILABILITY & VIEWINGS
-- =============================================================================

CREATE TABLE availability_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  owner_id    uuid NOT NULL REFERENCES users(id),
  starts_at   timestamptz NOT NULL,
  ends_at     timestamptz NOT NULL,
  timezone    text NOT NULL DEFAULT 'Europe/Berlin',
  is_booked   bool DEFAULT false,
  viewing_id  uuid,  -- FK added after viewings
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT valid_slot CHECK (ends_at > starts_at)
);

CREATE INDEX idx_slots_listing_time ON availability_slots(listing_id, starts_at)
  WHERE is_booked = false;

CREATE TABLE viewings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES listings(id),
  hunter_id     uuid NOT NULL REFERENCES users(id),
  agent_id      uuid REFERENCES users(id),
  slot_id       uuid REFERENCES availability_slots(id),
  scheduled_at  timestamptz,
  timezone      text NOT NULL DEFAULT 'Europe/Berlin',
  duration_min  int DEFAULT 30,
  status        text NOT NULL CHECK (status IN (
    'pending','confirmed','cancelled','completed','no_show'
  )) DEFAULT 'pending',
  type          text NOT NULL CHECK (type IN ('in_person','virtual')) DEFAULT 'in_person',
  hunter_notes  text,
  owner_notes   text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Add FK from availability_slots back to viewings
ALTER TABLE availability_slots
  ADD CONSTRAINT fk_slot_viewing FOREIGN KEY (viewing_id) REFERENCES viewings(id);

-- =============================================================================
-- OFFERS & APPLICATIONS
-- =============================================================================

CREATE TABLE offers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   uuid NOT NULL REFERENCES listings(id),
  hunter_id    uuid NOT NULL REFERENCES users(id),
  agent_id     uuid REFERENCES users(id),
  type         text NOT NULL CHECK (type IN ('sale_offer','rental_application')),
  amount       int NOT NULL,          -- minor units (cents)
  currency     char(3) NOT NULL DEFAULT 'EUR',
  status       text NOT NULL CHECK (status IN (
    'submitted','under_review','accepted','declined','withdrawn','expired'
  )) DEFAULT 'submitted',
  -- Sale offer fields
  conditions      text,
  finance_status  text CHECK (finance_status IN ('cash','mortgage_approved','mortgage_pending','not_specified')),
  -- Rental application fields
  move_in_date    date,
  employment_type text CHECK (employment_type IN ('employed','self_employed','student','retired','other')),
  message         text,
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_hunter  ON offers(hunter_id);

-- =============================================================================
-- MESSAGING
-- =============================================================================

CREATE TABLE message_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid REFERENCES listings(id),
  viewing_id      uuid REFERENCES viewings(id),
  offer_id        uuid REFERENCES offers(id),
  subject         text,
  last_message_at timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE thread_participants (
  thread_id    uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at    timestamptz DEFAULT now(),
  last_read_at timestamptz,
  PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid NOT NULL REFERENCES message_threads(id),
  sender_id   uuid NOT NULL REFERENCES users(id),
  body        text NOT NULL,
  attachments jsonb DEFAULT '[]',
  channel     text NOT NULL CHECK (channel IN ('in_app','whatsapp','email','sms')) DEFAULT 'in_app',
  sent_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_thread ON messages(thread_id, sent_at DESC);

-- =============================================================================
-- REFERRAL ENGINE
-- =============================================================================

CREATE TABLE referrers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE REFERENCES users(id),
  referrer_code     text UNIQUE NOT NULL,
  type              text NOT NULL CHECK (type IN ('street_team','organic','agent','partner')),
  country_code      char(2) DEFAULT 'DE',
  payout_method     text CHECK (payout_method IN ('stripe_connect','bank_transfer','sepa')),
  stripe_connect_id text,
  iban              text,  -- for SEPA bank transfers (DE default)
  total_earned      numeric(10,2) DEFAULT 0,
  status            text NOT NULL CHECK (status IN ('active','suspended','closed')) DEFAULT 'active',
  created_at        timestamptz DEFAULT now()
);

-- Add FK from users to referrers (deferred due to creation order)
ALTER TABLE users ADD CONSTRAINT fk_user_referrer
  FOREIGN KEY (referrer_id) REFERENCES referrers(id);

CREATE TABLE referrals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id      uuid NOT NULL REFERENCES referrers(id),
  referred_user_id uuid NOT NULL REFERENCES users(id),
  referred_role    text NOT NULL CHECK (referred_role IN ('owner','hunter','agent','partner')),
  utm_source       text,
  device_fp        text,   -- hashed device fingerprint (anti-fraud)
  ip_address       inet,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (referrer_id, referred_user_id)  -- first referrer wins; 2nd INSERT silently fails
);

CREATE TABLE referral_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id),
  milestone   text NOT NULL CHECK (milestone IN (
    'SIGNUP',
    'LISTING_DRAFT',
    'LISTING_PUBLISHED',
    'FIRST_BOOKING',
    'PAID_PLAN',
    'AGENT_ACTIVATED'
  )),
  value       numeric(8,2) NOT NULL DEFAULT 0,
  currency    char(3) NOT NULL DEFAULT 'EUR',
  status      text NOT NULL CHECK (status IN ('pending','approved','paid','rejected')) DEFAULT 'pending',
  approved_at timestamptz,
  paid_at     timestamptz,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (referral_id, milestone)  -- one event per milestone
);

CREATE TABLE payouts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id        uuid NOT NULL REFERENCES referrers(id),
  amount             numeric(10,2) NOT NULL,
  currency           char(3) NOT NULL DEFAULT 'EUR',
  period_start       date NOT NULL,
  period_end         date NOT NULL,
  status             text NOT NULL CHECK (status IN ('pending','processing','paid','failed')) DEFAULT 'pending',
  stripe_transfer_id text,
  sepa_reference     text,
  created_at         timestamptz DEFAULT now()
);

-- =============================================================================
-- BILLING
-- =============================================================================

CREATE TABLE subscription_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,        -- 'Basis', 'Professional', 'Komplett'
  name_de         text,
  target_role     text CHECK (target_role IN ('owner','agent','partner')),
  country_code    char(2) REFERENCES country_config(code),
  amount          int NOT NULL,         -- minor units (cents)
  currency        char(3) NOT NULL DEFAULT 'EUR',
  period          text NOT NULL CHECK (period IN ('monthly','annual','one_off')),
  features        jsonb DEFAULT '[]',
  stripe_price_id text,
  is_active       bool DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE billing_records (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES users(id),
  plan_id                  uuid REFERENCES subscription_plans(id),
  amount                   int NOT NULL,
  currency                 char(3) NOT NULL DEFAULT 'EUR',
  type                     text NOT NULL CHECK (type IN ('subscription','listing_package','service','addon')),
  status                   text NOT NULL CHECK (status IN ('pending','paid','failed','refunded')) DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_subscription_id   text,
  description              text,
  created_at               timestamptz DEFAULT now()
);

-- =============================================================================
-- ROW-LEVEL SECURITY
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Listings: public can read active listings, owners can manage theirs
CREATE POLICY "listings_public_read" ON listings
  FOR SELECT USING (status IN ('active','under_offer'));

CREATE POLICY "listings_owner_all" ON listings
  FOR ALL USING (auth.uid() = owner_id);

-- Offers: hunter sees own offers, owner sees offers on their listings
CREATE POLICY "offers_hunter_own" ON offers
  FOR SELECT USING (auth.uid() = hunter_id);

CREATE POLICY "offers_owner_listings" ON offers
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM listings WHERE id = offers.listing_id)
  );

-- Messages: thread participants only
CREATE POLICY "messages_participants" ON messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM thread_participants WHERE thread_id = messages.thread_id
    )
  );

-- Billing: own records only
CREATE POLICY "billing_own_records" ON billing_records
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals: referrer can see their own referrals
CREATE POLICY "referrals_own" ON referrals
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM referrers WHERE id = referrals.referrer_id)
  );

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_viewings_updated_at
  BEFORE UPDATE ON viewings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Block self-referrals
CREATE OR REPLACE FUNCTION prevent_self_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_user_id IN (SELECT user_id FROM referrers WHERE id = NEW.referrer_id) THEN
    RAISE EXCEPTION 'Self-referrals are not permitted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_self_referral
  BEFORE INSERT ON referrals FOR EACH ROW EXECUTE FUNCTION prevent_self_referral();

-- Generate stable place_id for new listings
CREATE OR REPLACE FUNCTION generate_place_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.place_id IS NULL OR NEW.place_id = '' THEN
    NEW.place_id := 'yh_' || lower(NEW.country_code) || '_' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_place_id
  BEFORE INSERT ON listings FOR EACH ROW EXECUTE FUNCTION generate_place_id();

-- =============================================================================
-- TWILIO COMMS TRACKING
-- =============================================================================

-- Add portal_url to listing_portal_status for URL-based SMS matching
ALTER TABLE listing_portal_status
  ADD COLUMN portal_url text;  -- e.g. https://www.immobilienscout24.de/expose/123456789

-- All inbound voice/SMS/WhatsApp events
CREATE TABLE comms_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel      text NOT NULL CHECK (channel IN ('voice','sms','whatsapp')),
  from_number  text NOT NULL,
  to_number    text NOT NULL,
  message_body text,
  match_type   text CHECK (match_type IN ('refcode','portal_url','address','none')),
  listing_id   uuid REFERENCES listings(id),
  event_type   text NOT NULL,  -- VOICE_CALL_STARTED | SMS_RECEIVED | COMMS_PROPERTY_MATCHED | etc.
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_comms_events_from    ON comms_events(from_number, created_at DESC);
CREATE INDEX idx_comms_events_listing ON comms_events(listing_id) WHERE listing_id IS NOT NULL;

-- SMS session state — persists disambiguation candidates between messages
CREATE TABLE sms_sessions (
  from_number  text PRIMARY KEY,
  state        text NOT NULL CHECK (state IN ('awaiting_input','awaiting_disambiguation','matched')) DEFAULT 'awaiting_input',
  candidates   jsonb DEFAULT '[]',  -- array of {listing_id, label} when address has multiple matches
  listing_id   uuid REFERENCES listings(id),
  expires_at   timestamptz NOT NULL,
  updated_at   timestamptz DEFAULT now()
);

-- Fuzzy address match for SMS inbound Case S3
-- Uses pg_trgm similarity on address_line1 + city
CREATE OR REPLACE FUNCTION fuzzy_match_listings(
  query_text  text,
  country     char(2) DEFAULT 'DE',
  threshold   float   DEFAULT 0.25,
  max_results int     DEFAULT 5
)
RETURNS TABLE (
  id            uuid,
  place_id      text,
  address_line1 text,
  city          text,
  score         float
)
LANGUAGE sql STABLE AS $$
  SELECT
    l.id,
    l.place_id,
    l.address_line1,
    l.city,
    similarity(l.address_line1 || ' ' || l.city, query_text) AS score
  FROM listings l
  WHERE l.status = 'active'
    AND l.country_code = country
    AND similarity(l.address_line1 || ' ' || l.city, query_text) >= threshold
  ORDER BY score DESC
  LIMIT max_results;
$$;

-- =============================================================================
-- HOMEHUNTER HUB
-- =============================================================================

-- Extend hunter_profiles with Buyer Brief fields
ALTER TABLE hunter_profiles
  ADD COLUMN IF NOT EXISTS min_bedrooms     smallint,
  ADD COLUMN IF NOT EXISTS must_haves       text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dealbreakers     text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS finance_status   text CHECK (finance_status IN
    ('cash','mortgage_approved','mortgage_pending','not_specified')),
  ADD COLUMN IF NOT EXISTS brief_updated_at timestamptz;

-- Hunter ↔ Agent relationship management
CREATE TABLE IF NOT EXISTS agent_hunter_assignments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       text NOT NULL CHECK (status IN
    ('invited','active','paused','ignored','disconnected')) DEFAULT 'invited',
  data_scope   text NOT NULL CHECK (data_scope IN
    ('brief_only','brief_and_contact')) DEFAULT 'brief_only',
  initiated_by text NOT NULL CHECK (initiated_by IN ('hunter','agent')) DEFAULT 'hunter',
  connected_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (hunter_id, agent_id)
);
CREATE INDEX IF NOT EXISTS idx_aha_hunter ON agent_hunter_assignments(hunter_id);
ALTER TABLE agent_hunter_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aha_own" ON agent_hunter_assignments
  FOR ALL USING (auth.uid() = hunter_id);

-- Agent newsletter alias addresses connected to a hunter
CREATE TABLE IF NOT EXISTS agent_inbox_sources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_name      text NOT NULL,
  alias_email      text NOT NULL,
  status           text NOT NULL CHECK (status IN ('active','muted')) DEFAULT 'active',
  last_received_at timestamptz,
  listings_count   int DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE agent_inbox_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ais_own" ON agent_inbox_sources
  FOR ALL USING (auth.uid() = hunter_id);

-- Properties extracted from agent newsletters, scored against hunter brief
CREATE TABLE IF NOT EXISTS property_matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_id       uuid NOT NULL REFERENCES agent_inbox_sources(id) ON DELETE CASCADE,
  address         text NOT NULL,
  price           int,
  currency        char(3) DEFAULT 'EUR',
  bedrooms        smallint,
  bathrooms       smallint,
  tenure          text,
  description     text,
  match_score     smallint NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  match_breakdown jsonb DEFAULT '{}',
  status          text NOT NULL CHECK (status IN
    ('new','saved','dismissed','archived')) DEFAULT 'new',
  received_at     timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pm_hunter_score ON property_matches(hunter_id, match_score DESC);
ALTER TABLE property_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_own" ON property_matches
  FOR ALL USING (auth.uid() = hunter_id);

-- GDPR consent audit log for hunter data sharing
CREATE TABLE IF NOT EXISTS hunter_consent_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id   uuid REFERENCES users(id),
  event_type text NOT NULL CHECK (event_type IN (
    'brief_shared','contact_shared','data_paused','data_resumed',
    'agent_disconnected','data_deleted')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hcl_hunter ON hunter_consent_log(hunter_id, created_at DESC);
ALTER TABLE hunter_consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hcl_own" ON hunter_consent_log
  FOR ALL USING (auth.uid() = hunter_id);
