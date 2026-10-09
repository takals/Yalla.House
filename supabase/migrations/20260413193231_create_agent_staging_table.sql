-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260413193231.

CREATE TABLE IF NOT EXISTS public.agent_staging (
  id serial PRIMARY KEY,
  name text NOT NULL,
  location text DEFAULT '',
  profile_url text DEFAULT '',
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
