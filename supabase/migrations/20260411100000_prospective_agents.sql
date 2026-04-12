-- =============================================================================
-- Agent Sourcing Infrastructure
-- Migration: 20260411100000
-- Adds: prospective_agents, agent_invite_log
-- Purpose: Track sourced agents for outreach and matching
-- =============================================================================

-- ─── PROSPECTIVE AGENTS ──────────────────────────────────────────────────────
-- Agents sourced from public directories but not yet registered on Yalla
-- Used for matching against listings and tracking outreach campaigns

CREATE TABLE IF NOT EXISTS public.prospective_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  agency_name TEXT NOT NULL,
  agent_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Location
  address TEXT,
  city TEXT,
  postcode TEXT,
  postcode_prefix TEXT, -- first 2-4 chars for matching (e.g., 'SW1A', 'E3')
  coverage_postcodes TEXT[], -- all postcodes they explicitly cover

  -- Source
  source TEXT NOT NULL, -- 'rightmove', 'zoopla', 'tpo', 'naea', 'manual', 'google_places'
  source_url TEXT,
  source_id TEXT, -- ID from the source system

  -- Status
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'invited', 'reminded', 'registered', 'declined', 'bounced'
  invited_at TIMESTAMPTZ,
  invited_count INTEGER NOT NULL DEFAULT 0,
  last_invited_at TIMESTAMPTZ,
  registered_user_id UUID REFERENCES public.users(id), -- links to actual user if they register

  -- Matching
  matched_listing_id UUID, -- the listing that triggered the invite
  match_score NUMERIC(5, 2),

  -- Metadata
  specialties TEXT[], -- residential, commercial, lettings, new_homes, etc.
  rating NUMERIC(3, 2), -- from source (e.g., Google rating)
  review_count INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source, source_id),
  UNIQUE (email) -- prevent duplicate invites to same email
);

-- Index for postcode-based lookups
CREATE INDEX idx_prospective_agents_postcode_prefix ON public.prospective_agents(postcode_prefix);
CREATE INDEX idx_prospective_agents_status ON public.prospective_agents(status);
CREATE INDEX idx_prospective_agents_email ON public.prospective_agents(email) WHERE email IS NOT NULL;
CREATE INDEX idx_prospective_agents_created ON public.prospective_agents(created_at DESC);

-- RLS: service role and admins only
ALTER TABLE public.prospective_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.prospective_agents FOR ALL
  USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER set_prospective_agents_updated_at
  BEFORE UPDATE ON public.prospective_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ─── AGENT INVITE LOG ───────────────────────────────────────────────────────
-- Tracks every outreach attempt, delivery, and engagement

CREATE TABLE IF NOT EXISTS public.agent_invite_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospective_agent_id UUID NOT NULL REFERENCES public.prospective_agents(id) ON DELETE CASCADE,
  listing_id UUID, -- which listing triggered this invite
  channel TEXT NOT NULL DEFAULT 'email', -- 'email', 'sms', 'whatsapp'
  template TEXT NOT NULL, -- 'owner_brief', 'hunter_search', 'cold_outreach', 'reminder'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered BOOLEAN,
  opened BOOLEAN,
  clicked BOOLEAN,
  error TEXT
);

CREATE INDEX idx_agent_invite_log_agent ON public.agent_invite_log(prospective_agent_id);
CREATE INDEX idx_agent_invite_log_listing ON public.agent_invite_log(listing_id);
CREATE INDEX idx_agent_invite_log_sent ON public.agent_invite_log(sent_at DESC);

-- RLS: service role only
ALTER TABLE public.agent_invite_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.agent_invite_log FOR ALL
  USING (true) WITH CHECK (true);

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.prospective_agents IS
  'Agents sourced from public directories. Status progression: new → invited → registered. Enables mass outreach and supplier development.';

COMMENT ON COLUMN public.prospective_agents.postcode_prefix IS
  'First 2–4 characters of postcode for quick lookup (SW1A, E3, etc.). Used for matching against listing postcodes.';

COMMENT ON COLUMN public.prospective_agents.source IS
  'Origin of agent record: public portals (rightmove, zoopla), professional directories (tpo=thepropertyombudsman, naea=estateagents), manual input, or Google Places.';

COMMENT ON COLUMN public.prospective_agents.status IS
  'Outreach lifecycle. new: discovered. invited: first contact sent. reminded: follow-up sent. registered: created Yalla account. declined/bounced: unresponsive.';

COMMENT ON TABLE public.agent_invite_log IS
  'Detailed log of every outreach: email, SMS, WhatsApp. Tracks delivery, opens, clicks for campaign analytics.';
