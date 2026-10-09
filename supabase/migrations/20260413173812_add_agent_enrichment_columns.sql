-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260413173812.

ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS postcode text,
  ADD COLUMN IF NOT EXISTS raw_address text,
  ADD COLUMN IF NOT EXISTS service_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS data_source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS branch_manager text,
  ADD COLUMN IF NOT EXISTS portal_presence text[] DEFAULT '{}';
