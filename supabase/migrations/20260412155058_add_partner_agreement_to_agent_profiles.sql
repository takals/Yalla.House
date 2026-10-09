-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260412155058.

ALTER TABLE agent_profiles
  ADD COLUMN IF NOT EXISTS partner_agreement_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS partner_agreement_version text;

COMMENT ON COLUMN agent_profiles.partner_agreement_signed_at IS 'When the agent signed the Yalla Partner Agreement';
COMMENT ON COLUMN agent_profiles.partner_agreement_version IS 'Version of the Partner Agreement signed (e.g. 1.0)';
