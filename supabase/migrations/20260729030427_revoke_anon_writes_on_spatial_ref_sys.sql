-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260729030427.

-- spatial_ref_sys is the PostGIS coordinate-system catalogue (8,500 rows), owned by
-- supabase_admin. RLS cannot be enabled on it from the postgres role, and enabling it
-- would break PostGIS internals anyway.
--
-- The real exposure is not disclosure — the contents are public EPSG reference data —
-- it is destruction: anon currently holds INSERT/UPDATE/DELETE, so anyone with the
-- public anon key could truncate it and break every geo query on the platform.
--
-- SELECT is required by PostGIS functions and is retained.

DO $$
BEGIN
  BEGIN
    REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.spatial_ref_sys FROM anon, authenticated;
    RAISE NOTICE 'Revoked write privileges on spatial_ref_sys from anon and authenticated.';
  EXCEPTION WHEN insufficient_privilege OR OTHERS THEN
    RAISE WARNING 'Could not revoke on spatial_ref_sys (owned by supabase_admin): %. Raise with Supabase support.', SQLERRM;
  END;
END $$;
