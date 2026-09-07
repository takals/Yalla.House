-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260417091510.

-- =============================================================================
-- Add slug + short_id to listings for shareable URLs
-- =============================================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS short_id text UNIQUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_listings_short_id ON listings(short_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);

-- Function to generate a unique short_id on insert
CREATE OR REPLACE FUNCTION generate_listing_short_id()
RETURNS trigger AS $$
DECLARE
  new_id text;
  exists_count int;
BEGIN
  IF NEW.short_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  LOOP
    new_id := 'YH-' || upper(substr(md5(random()::text), 1, 4));
    SELECT count(*) INTO exists_count FROM listings WHERE short_id = new_id;
    EXIT WHEN exists_count = 0;
  END LOOP;
  NEW.short_id := new_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listing_short_id ON listings;
CREATE TRIGGER trg_listing_short_id
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_short_id();

-- Function to generate slug from address
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
  exists_count int;
BEGIN
  -- Skip if slug already set and address hasn't changed (on UPDATE)
  IF TG_OP = 'UPDATE' AND NEW.slug IS NOT NULL 
     AND NEW.address_line1 IS NOT DISTINCT FROM OLD.address_line1 
     AND NEW.city IS NOT DISTINCT FROM OLD.city THEN
    RETURN NEW;
  END IF;

  base_slug := lower(
    regexp_replace(
      regexp_replace(
        coalesce(NEW.address_line1, '') || ' ' || coalesce(NEW.city, ''),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  LOOP
    SELECT count(*) INTO exists_count FROM listings WHERE slug = final_slug AND id != NEW.id;
    EXIT WHEN exists_count = 0;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listing_slug ON listings;
CREATE TRIGGER trg_listing_slug
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_slug();

-- =============================================================================
-- Inbound leads table
-- =============================================================================

CREATE TABLE IF NOT EXISTS inbound_leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid REFERENCES listings(id),
  channel       text NOT NULL CHECK (channel IN ('whatsapp','sms','email','phone','web')),
  source        text,
  contact_phone text,
  contact_email text,
  contact_name  text,
  raw_message   text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','identified','link_sent','viewed','booked','expired','failed'
  )),
  matched_by    text CHECK (matched_by IN ('short_id','postcode','address','manual')),
  reply_sent_at timestamptz,
  reply_channel text CHECK (reply_channel IN ('whatsapp','sms','email')),
  reply_link    text,
  link_clicked_at timestamptz,
  viewing_id      uuid REFERENCES viewings(id),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_leads_listing ON inbound_leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_status ON inbound_leads(status);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_phone ON inbound_leads(contact_phone);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_created ON inbound_leads(created_at DESC);

ALTER TABLE inbound_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see own listing leads" ON inbound_leads
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE owner_id = auth.uid())
  );

CREATE POLICY "Agents see assigned listing leads" ON inbound_leads
  FOR SELECT USING (
    listing_id IN (SELECT id FROM listings WHERE agent_id = auth.uid())
  );

CREATE POLICY "Admins see all leads" ON inbound_leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
  );

CREATE POLICY "Service can insert leads" ON inbound_leads
  FOR INSERT WITH CHECK (true);

-- Backfill existing listings with short_id and slug
UPDATE listings SET short_id = NULL WHERE short_id IS NULL;
