-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260413115316.

-- Allow public read of agent_profiles (agents are publicly discoverable)
CREATE POLICY "agent_profiles_public_read" ON agent_profiles
  FOR SELECT USING (true);

-- Allow agent to update their own profile
CREATE POLICY "agent_profiles_own_update" ON agent_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow reading user records that have agent profiles (for agent search/display)
-- This extends the existing users_own_profile policy
CREATE POLICY "users_agents_public_read" ON users
  FOR SELECT USING (
    id IN (SELECT user_id FROM agent_profiles)
  );
