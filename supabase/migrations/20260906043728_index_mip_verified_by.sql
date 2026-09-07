-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906043728.

-- Covering index for the FK added in contact_aliases_and_mip_capture. Own omission.
CREATE INDEX IF NOT EXISTS idx_buyer_verifications_mip_verified_by
  ON public.buyer_verifications (mip_verified_by);
