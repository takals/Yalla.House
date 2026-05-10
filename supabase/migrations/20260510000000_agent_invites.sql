-- Agent Invites — outreach from owners to agents found via search
-- These agents are from agent_profiles (scraped/imported) and may not have
-- Yalla accounts yet. This table tracks the invite lifecycle independently
-- from listing_agent_assignments (which is for registered platform agents).

CREATE TYPE agent_invite_status AS ENUM (
  'draft',       -- owner selected but hasn't sent yet
  'sent',        -- invite email/message dispatched
  'opened',      -- agent clicked the invite link
  'responded',   -- agent accepted or declined
  'declined',    -- agent explicitly declined
  'expired',     -- invite expired without response
  'bounced'      -- email bounced / undeliverable
);

CREATE TABLE agent_invites (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id          uuid REFERENCES listings(id) ON DELETE SET NULL,
  owner_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_profile_id    uuid NOT NULL REFERENCES agent_profiles(user_id) ON DELETE CASCADE,

  -- invite details
  tier                text NOT NULL DEFAULT 'advisory'
                      CHECK (tier IN ('advisory', 'assisted', 'managed')),
  notes               text,
  invite_token        text UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),

  -- status lifecycle
  status              agent_invite_status NOT NULL DEFAULT 'draft',
  created_at          timestamptz NOT NULL DEFAULT now(),
  sent_at             timestamptz,
  opened_at           timestamptz,
  responded_at        timestamptz,
  expires_at          timestamptz DEFAULT (now() + interval '30 days'),

  -- if the agent signs up, link to their assignment
  converted_assignment_id uuid REFERENCES listing_agent_assignments(id),

  -- prevent duplicate invites per listing+agent
  UNIQUE(listing_id, agent_profile_id)
);

CREATE INDEX idx_agent_invites_owner    ON agent_invites(owner_id);
CREATE INDEX idx_agent_invites_listing  ON agent_invites(listing_id);
CREATE INDEX idx_agent_invites_agent    ON agent_invites(agent_profile_id);
CREATE INDEX idx_agent_invites_status   ON agent_invites(status);
CREATE INDEX idx_agent_invites_token    ON agent_invites(invite_token);

-- RLS
ALTER TABLE agent_invites ENABLE ROW LEVEL SECURITY;

-- Owners can see their own invites
CREATE POLICY agent_invites_owner_select ON agent_invites
  FOR SELECT USING (auth.uid() = owner_id);

-- Owners can insert invites
CREATE POLICY agent_invites_owner_insert ON agent_invites
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own invites (e.g. change status to sent)
CREATE POLICY agent_invites_owner_update ON agent_invites
  FOR UPDATE USING (auth.uid() = owner_id);

-- Service role bypass (for Inngest functions, webhooks)
CREATE POLICY agent_invites_service ON agent_invites
  FOR ALL USING (auth.role() = 'service_role');
