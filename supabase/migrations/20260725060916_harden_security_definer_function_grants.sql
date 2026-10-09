-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260725060916.

-- Security hardening: SECURITY DEFINER routines were executable by anon/authenticated
-- via /rest/v1/rpc/. Restrict admin + pipeline routines to service_role only.
-- Handles both functions and procedures (prokind 'p').

-- 1. Admin / pipeline routines: service_role only.
--    Edge functions use SUPABASE_SERVICE_ROLE_KEY, which is unaffected.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig,
           CASE WHEN p.prokind = 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END AS kind
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'bulk_insert_agents',
        'bulk_insert_agents_v2',
        'enrich_agent_profiles',
        'stage_agents',
        'process_staged_agents',
        'rls_auto_enable',
        'expire_stale_agent_matches',
        'run_enrich_loop'
      )
  LOOP
    EXECUTE format('REVOKE ALL ON %s %s FROM PUBLIC, anon, authenticated', r.kind, r.sig);
    EXECUTE format('GRANT EXECUTE ON %s %s TO service_role', r.kind, r.sig);
  END LOOP;
END $$;

-- 2. Trigger functions should never be RPC-callable.
--    Postgres does not check EXECUTE for trigger invocation, so triggers keep working.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('log_listing_status_change', 'update_provider_rating')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;

-- 3. RLS helpers: keep for authenticated (is_assigned_agent backs the
--    listings_agent_read policy), but remove anonymous access.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('has_role', 'is_assigned_agent')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.sig);
  END LOOP;
END $$;

-- 4. Pin search_path (search_path injection on SECURITY DEFINER routines).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig,
           CASE WHEN p.prokind = 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END AS kind
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'compute_profile_complete',
        'generate_listing_short_id',
        'generate_listing_slug',
        'compute_hunter_readiness',
        'update_provider_rating',
        'log_listing_status_change',
        'run_enrich_loop'
      )
  LOOP
    EXECUTE format('ALTER %s %s SET search_path = public, pg_temp', r.kind, r.sig);
  END LOOP;
END $$;
