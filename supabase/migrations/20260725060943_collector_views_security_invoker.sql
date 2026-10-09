-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260725060943.

-- These views bypassed the caller's RLS because they run as their (admin) creator.
-- agent_collector_runs already has an admin-only SELECT policy, so switching to
-- security_invoker enforces it: admins still see the reporting data, anon sees nothing.
ALTER VIEW public.agent_collector_country_headline SET (security_invoker = on);
ALTER VIEW public.agent_collector_source_contribution SET (security_invoker = on);
