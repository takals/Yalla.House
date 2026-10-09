-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260603112134.

ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS pm_enriched_at timestamptz,
  ADD COLUMN IF NOT EXISTS cf_checked_at timestamptz;

-- Backfill: mark already-complete propertymark rows so we skip them.
-- "Complete" for field enrichment = has postcode, phone AND website.
UPDATE agent_profiles SET pm_enriched_at = now()
  WHERE data_source = 'propertymark'
    AND pm_enriched_at IS NULL
    AND postcode IS NOT NULL AND phone IS NOT NULL AND website IS NOT NULL;

-- Backfill: mark rows that already have an email so the cf pass skips them.
UPDATE agent_profiles SET cf_checked_at = now()
  WHERE data_source = 'propertymark'
    AND cf_checked_at IS NULL
    AND email IS NOT NULL AND email <> '';

-- Partial indexes for fast backlog scans
CREATE INDEX IF NOT EXISTS idx_pm_enrich_backlog ON agent_profiles (user_id)
  WHERE data_source = 'propertymark' AND pm_enriched_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cf_email_backlog ON agent_profiles (user_id)
  WHERE data_source = 'propertymark' AND email IS NULL AND cf_checked_at IS NULL;
