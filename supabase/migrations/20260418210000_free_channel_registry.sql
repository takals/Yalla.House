-- Free channel registry — available free advertising platforms by country
CREATE TABLE IF NOT EXISTS free_channel_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code char(2) NOT NULL,
  slug text NOT NULL,
  display_name text NOT NULL,
  logo_url text,
  base_url text,
  max_active smallint NOT NULL DEFAULT 1,
  listing_duration_days smallint NOT NULL DEFAULT 30,
  repost_interval_days smallint NOT NULL DEFAULT 30,
  cooldown_days smallint NOT NULL DEFAULT 0,
  requires_unique_content boolean NOT NULL DEFAULT false,
  is_default_selected boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  config_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_code, slug)
);

-- Per-listing channel connections
CREATE TABLE IF NOT EXISTS listing_free_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES free_channel_registry(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'not_posted' CHECK (status IN ('not_posted','pending','active','expired','error')),
  external_url text,
  posted_at timestamptz,
  expires_at timestamptz,
  next_repost_at timestamptz,
  repost_count smallint NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, channel_id)
);

-- Analytics per channel per listing per day
CREATE TABLE IF NOT EXISTS free_channel_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES free_channel_registry(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0,
  enquiries int NOT NULL DEFAULT 0,
  UNIQUE(listing_id, channel_id, date)
);

-- Push action log
CREATE TABLE IF NOT EXISTS free_channel_push_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES free_channel_registry(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('post','repost','remove')),
  status text NOT NULL CHECK (status IN ('success','failed','pending')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_free_channel_registry_country ON free_channel_registry(country_code, is_active);
CREATE INDEX idx_listing_free_channels_listing ON listing_free_channels(listing_id);
CREATE INDEX idx_free_channel_analytics_listing ON free_channel_analytics(listing_id, date);

-- RLS
ALTER TABLE free_channel_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_free_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_channel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_channel_push_log ENABLE ROW LEVEL SECURITY;

-- Registry is readable by everyone
CREATE POLICY "Anyone can read channel registry" ON free_channel_registry FOR SELECT USING (true);

-- Listing channels readable/writable by listing owner
CREATE POLICY "Owners can manage their listing channels" ON listing_free_channels
  FOR ALL USING (
    listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can read their channel analytics" ON free_channel_analytics
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can read their push logs" ON free_channel_push_log
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
  );

-- Seed DE channels
INSERT INTO free_channel_registry (country_code, slug, display_name, base_url, max_active, listing_duration_days, repost_interval_days, is_default_selected) VALUES
  ('DE', 'kleinanzeigen', 'Kleinanzeigen', 'https://www.kleinanzeigen.de', 2, 60, 60, true),
  ('DE', 'immoscout24-free', 'ImmoScout24 (Free)', 'https://www.immobilienscout24.de', 2, 365, 365, true),
  ('DE', 'immowelt-free', 'Immowelt (Free)', 'https://www.immowelt.de', 1, 90, 90, true),
  ('DE', 'clever-immobilien', 'Clever-Immobilien.de', 'https://www.clever-immobilien.de', 99, 9999, 30, true),
  ('DE', 'wohnglueck', 'Wohnglück.de', 'https://www.wohnglueck.de', 99, 9999, 30, false),
  ('DE', 'meinestadt', 'meinestadt.de', 'https://www.meinestadt.de', 99, 30, 30, false);

-- Seed GB channels
INSERT INTO free_channel_registry (country_code, slug, display_name, base_url, max_active, listing_duration_days, repost_interval_days, is_default_selected) VALUES
  ('GB', 'gumtree', 'Gumtree', 'https://www.gumtree.com', 99, 30, 30, true),
  ('GB', 'openrent-free', 'OpenRent (Free)', 'https://www.openrent.com', 99, 30, 30, true),
  ('GB', 'spareroom', 'SpareRoom', 'https://www.spareroom.co.uk', 1, 28, 28, true),
  ('GB', 'facebook-marketplace', 'Facebook Marketplace', 'https://www.facebook.com/marketplace', 99, 7, 7, true),
  ('GB', 'thehouseshop', 'TheHouseShop', 'https://www.thehouseshop.com', 99, 30, 30, true),
  ('GB', 'noagent', 'NoAgent Properties', 'https://www.noagentproperties.co.uk', 99, 30, 30, false);
