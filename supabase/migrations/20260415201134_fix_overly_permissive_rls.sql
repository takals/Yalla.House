-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260415201134.

-- Fix agent_invite_log: replace "Service role full access" with deny-all for API + proper service role access
DROP POLICY IF EXISTS "Service role full access" ON agent_invite_log;
CREATE POLICY "agent_invite_log_deny_api" ON agent_invite_log FOR SELECT USING (false);

-- Fix prospective_agents: same treatment
DROP POLICY IF EXISTS "Service role full access" ON prospective_agents;
CREATE POLICY "prospective_agents_deny_api" ON prospective_agents FOR SELECT USING (false);
