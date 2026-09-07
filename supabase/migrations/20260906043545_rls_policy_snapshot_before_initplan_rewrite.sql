-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906043545.

-- Rollback path for the auth_rls_initplan rewrite that follows.
-- Every policy in public, captured as an executable CREATE POLICY statement.
-- To restore one:  DO $$ BEGIN EXECUTE (SELECT drop_sql || create_sql FROM public._rls_policy_snapshot WHERE ...); END $$;
-- Table is service_role only and can be dropped once the rewrite has been live for a while.

CREATE TABLE IF NOT EXISTS public._rls_policy_snapshot (
  snapshot_at   timestamptz NOT NULL DEFAULT now(),
  table_name    text NOT NULL,
  policy_name   text NOT NULL,
  cmd           text NOT NULL,
  permissive    boolean NOT NULL,
  roles         text[] NOT NULL,
  using_expr    text,
  check_expr    text,
  drop_sql      text NOT NULL,
  create_sql    text NOT NULL,
  PRIMARY KEY (table_name, policy_name)
);

ALTER TABLE public._rls_policy_snapshot ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public._rls_policy_snapshot FROM anon, authenticated;

INSERT INTO public._rls_policy_snapshot
  (table_name, policy_name, cmd, permissive, roles, using_expr, check_expr, drop_sql, create_sql)
SELECT
  c.relname,
  pol.polname,
  CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE'
                  WHEN 'd' THEN 'DELETE' ELSE 'ALL' END,
  pol.polpermissive,
  CASE WHEN pol.polroles = '{0}'::oid[] THEN ARRAY['public']
       ELSE (SELECT array_agg(r.rolname::text ORDER BY r.rolname) FROM pg_roles r WHERE r.oid = ANY(pol.polroles)) END,
  pg_get_expr(pol.polqual, pol.polrelid),
  pg_get_expr(pol.polwithcheck, pol.polrelid),
  format('DROP POLICY IF EXISTS %I ON public.%I; ', pol.polname, c.relname),
  format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s%s%s;',
    pol.polname, c.relname,
    CASE WHEN pol.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
    CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE'
                    WHEN 'd' THEN 'DELETE' ELSE 'ALL' END,
    CASE WHEN pol.polroles = '{0}'::oid[] THEN 'public'
         ELSE (SELECT string_agg(quote_ident(r.rolname), ', ' ORDER BY r.rolname) FROM pg_roles r WHERE r.oid = ANY(pol.polroles)) END,
    CASE WHEN pol.polqual IS NOT NULL THEN ' USING (' || pg_get_expr(pol.polqual, pol.polrelid) || ')' ELSE '' END,
    CASE WHEN pol.polwithcheck IS NOT NULL THEN ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid) || ')' ELSE '' END
  )
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
ON CONFLICT (table_name, policy_name) DO NOTHING;
