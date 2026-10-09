-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260413113425.

-- Extend owner_profiles with listing default preferences
ALTER TABLE owner_profiles
  ADD COLUMN IF NOT EXISTS default_intent         text CHECK (default_intent IN ('sale','rent','both')),
  ADD COLUMN IF NOT EXISTS default_property_type   text CHECK (default_property_type IN ('house','flat','apartment','villa','commercial','land','other')),
  ADD COLUMN IF NOT EXISTS default_currency        char(3) DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS default_price_qualifier text CHECK (default_price_qualifier IN ('offers_over','guide_price','fixed_price','poa','vb')),
  ADD COLUMN IF NOT EXISTS default_rent_period     text CHECK (default_rent_period IN ('pw','pcm','pq','pa')),
  ADD COLUMN IF NOT EXISTS default_city            text,
  ADD COLUMN IF NOT EXISTS default_postcode        text,
  ADD COLUMN IF NOT EXISTS default_region          text;
