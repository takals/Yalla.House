-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906043626.

-- auth_rls_initplan: auth.uid() / auth.jwt() / auth.role() called bare inside a policy
-- are re-evaluated for EVERY ROW. Wrapping them as (select auth.uid()) makes Postgres
-- evaluate once per query as an InitPlan. Semantically identical; the plan changes.
--
-- Mechanical transformation of 96 policies. Rollback: public._rls_policy_snapshot.
-- Runs in one transaction — either all policies are rewritten or none are.

DO $$
DECLARE
  r          record;
  v_using    text;
  v_check    text;
  v_roles    text;
  v_count    int := 0;
BEGIN
  FOR r IN
    SELECT s.table_name, s.policy_name, s.cmd, s.permissive, s.roles, s.using_expr, s.check_expr
    FROM public._rls_policy_snapshot s
    WHERE (s.using_expr ~ 'auth\.(uid|jwt|role)\(\)' OR s.check_expr ~ 'auth\.(uid|jwt|role)\(\)')
      AND coalesce(s.using_expr,'') !~ 'SELECT auth\.'
      AND coalesce(s.check_expr,'') !~ 'SELECT auth\.'
    ORDER BY s.table_name, s.policy_name
  LOOP
    v_using := regexp_replace(r.using_expr, 'auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'g');
    v_check := regexp_replace(r.check_expr, 'auth\.(uid|jwt|role)\(\)', '(select auth.\1())', 'g');

    v_roles := (SELECT string_agg(CASE WHEN x = 'public' THEN 'public' ELSE quote_ident(x) END, ', ')
                FROM unnest(r.roles) AS x);

    EXECUTE format('DROP POLICY %I ON public.%I', r.policy_name, r.table_name);

    EXECUTE format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s%s%s',
      r.policy_name, r.table_name,
      CASE WHEN r.permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END,
      r.cmd,
      v_roles,
      CASE WHEN v_using IS NOT NULL THEN ' USING (' || v_using || ')' ELSE '' END,
      CASE WHEN v_check IS NOT NULL THEN ' WITH CHECK (' || v_check || ')' ELSE '' END
    );

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Rewrote % policies.', v_count;
END $$;
