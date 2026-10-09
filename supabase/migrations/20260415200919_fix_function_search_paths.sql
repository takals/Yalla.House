-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260415200919.

-- Fix mutable search_path on all flagged functions
ALTER FUNCTION public.bulk_insert_agents SET search_path = public;
ALTER FUNCTION public.prevent_self_referral SET search_path = public;
ALTER FUNCTION public.generate_place_id SET search_path = public;
ALTER FUNCTION public.enrich_agent_profiles SET search_path = public;
ALTER FUNCTION public.update_updated_at SET search_path = public;
ALTER FUNCTION public.stage_agents SET search_path = public;
ALTER FUNCTION public.score_tag_match SET search_path = public;
ALTER FUNCTION public.compute_profile_complete SET search_path = public;
ALTER FUNCTION public.bulk_insert_agents_v2 SET search_path = public;
ALTER FUNCTION public.process_staged_agents SET search_path = public;
