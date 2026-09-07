-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260528124440.

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
