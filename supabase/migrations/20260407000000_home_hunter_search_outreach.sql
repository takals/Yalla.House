-- =============================================================================
-- Home-Hunter Search + Agent Outreach System
-- Migration: 20260407000000
-- Adds: search_requests, contact_consent, agent_matches, agent_responses
-- =============================================================================

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE search_intent AS ENUM ('buy', 'rent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE search_timeline AS ENUM ('immediate', '1_3_months', '3_6_months', 'flexible');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE search_status AS ENUM ('active', 'paused', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_match_status AS ENUM ('pending', 'sent', 'responded', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE response_priority AS ENUM ('top_match', 'other', 'low_relevance', 'spam');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE hunter_action AS ENUM ('promoted', 'dismissed', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─── SEARCH REQUESTS ────────────────────────────────────────────────────────
-- One hunter can have multiple search requests (e.g. buy in London + rent in Berlin)

CREATE TABLE IF NOT EXISTS search_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intent         search_intent NOT NULL,
  areas          jsonb NOT NULL DEFAULT '[]',         -- [{name, lat, lng, postcode}]
  radius_km      numeric(5,1) NOT NULL DEFAULT 5.0,
  budget_min     int,                                  -- minor units (cents/pence)
  budget_max     int,
  currency       char(3) NOT NULL DEFAULT 'GBP',
  property_types text[] NOT NULL DEFAULT '{}',         -- apartment, house, villa, land, commercial
  bedrooms_min   smallint,
  bedrooms_max   smallint,
  timeline       search_timeline NOT NULL DEFAULT 'flexible',
  notes          text,                                 -- free-text preferences
  languages      text[] DEFAULT ARRAY['en'],           -- communication languages
  status         search_status NOT NULL DEFAULT 'active',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sr_hunter     ON search_requests(hunter_id);
CREATE INDEX idx_sr_status     ON search_requests(status) WHERE status = 'active';
CREATE INDEX idx_sr_areas      ON search_requests USING gin(areas);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_requests_updated_at
  BEFORE UPDATE ON search_requests
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- ─── CONTACT CONSENT ─────────────────────────────────────────────────────────
-- One consent record per search request. Controls agent outreach.

CREATE TABLE IF NOT EXISTS contact_consent (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id uuid NOT NULL REFERENCES search_requests(id) ON DELETE CASCADE,
  agent_outreach    boolean NOT NULL DEFAULT false,    -- allow Yalla to contact agents
  phone_allowed     boolean NOT NULL DEFAULT false,    -- allow agents to call
  consented_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at        timestamptz,                       -- null = still active
  UNIQUE (search_request_id)
);


-- ─── AGENT MATCHES ───────────────────────────────────────────────────────────
-- System-generated matches between a search request and agents.
-- Max 8 per search request at MVP.

CREATE TABLE IF NOT EXISTS agent_matches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id uuid NOT NULL REFERENCES search_requests(id) ON DELETE CASCADE,
  agent_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score       smallint NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  score_breakdown   jsonb DEFAULT '{}',                -- {area: 85, intent: 100, budget: 70, ...}
  status            agent_match_status NOT NULL DEFAULT 'pending',
  sent_at           timestamptz,                       -- when brief was delivered
  expires_at        timestamptz,                       -- sent_at + 7 days
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (search_request_id, agent_id)
);

CREATE INDEX idx_am_search   ON agent_matches(search_request_id);
CREATE INDEX idx_am_agent    ON agent_matches(agent_id);
CREATE INDEX idx_am_status   ON agent_matches(status) WHERE status IN ('pending', 'sent');
CREATE INDEX idx_am_expires  ON agent_matches(expires_at) WHERE status = 'sent';


-- ─── AGENT RESPONSES ─────────────────────────────────────────────────────────
-- An agent's reply to a search brief. One response per match.

CREATE TABLE IF NOT EXISTS agent_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_match_id  uuid NOT NULL REFERENCES agent_matches(id) ON DELETE CASCADE,
  message         text NOT NULL,                       -- agent's free-text reply
  properties      jsonb DEFAULT '[]',                  -- [{title, price, url, beds, area, lat, lng}]
  relevance_score smallint CHECK (relevance_score BETWEEN 0 AND 100),
  priority_tier   response_priority,
  hunter_action   hunter_action,                       -- null = no action yet
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_match_id)                              -- one reply per match
);

CREATE INDEX idx_ar_match     ON agent_responses(agent_match_id);
CREATE INDEX idx_ar_relevance ON agent_responses(relevance_score DESC NULLS LAST);


-- ─── BLOCKED AGENTS (per hunter) ─────────────────────────────────────────────
-- Permanently excludes an agent from future matches for this hunter.

CREATE TABLE IF NOT EXISTS blocked_agents (
  hunter_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      text,
  blocked_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hunter_id, agent_id)
);


-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_matches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_agents  ENABLE ROW LEVEL SECURITY;

-- Search requests: hunter owns their searches
CREATE POLICY "sr_hunter_all" ON search_requests
  FOR ALL USING (auth.uid() = hunter_id);

-- Contact consent: hunter owns consent for their searches
CREATE POLICY "cc_hunter_all" ON contact_consent
  FOR ALL USING (
    search_request_id IN (
      SELECT id FROM search_requests WHERE hunter_id = auth.uid()
    )
  );

-- Agent matches: hunters can read matches for their searches; agents can read their own matches
CREATE POLICY "am_hunter_read" ON agent_matches
  FOR SELECT USING (
    search_request_id IN (
      SELECT id FROM search_requests WHERE hunter_id = auth.uid()
    )
  );

CREATE POLICY "am_agent_read" ON agent_matches
  FOR SELECT USING (auth.uid() = agent_id);

-- Agent responses: hunters can read + update action; agents can insert their own
CREATE POLICY "ar_hunter_read" ON agent_responses
  FOR SELECT USING (
    agent_match_id IN (
      SELECT am.id FROM agent_matches am
      JOIN search_requests sr ON sr.id = am.search_request_id
      WHERE sr.hunter_id = auth.uid()
    )
  );

CREATE POLICY "ar_hunter_action" ON agent_responses
  FOR UPDATE USING (
    agent_match_id IN (
      SELECT am.id FROM agent_matches am
      JOIN search_requests sr ON sr.id = am.search_request_id
      WHERE sr.hunter_id = auth.uid()
    )
  )
  WITH CHECK (
    agent_match_id IN (
      SELECT am.id FROM agent_matches am
      JOIN search_requests sr ON sr.id = am.search_request_id
      WHERE sr.hunter_id = auth.uid()
    )
  );

CREATE POLICY "ar_agent_insert" ON agent_responses
  FOR INSERT WITH CHECK (
    agent_match_id IN (
      SELECT id FROM agent_matches WHERE agent_id = auth.uid()
    )
  );

CREATE POLICY "ar_agent_read" ON agent_responses
  FOR SELECT USING (
    agent_match_id IN (
      SELECT id FROM agent_matches WHERE agent_id = auth.uid()
    )
  );

-- Blocked agents: hunter manages their block list
CREATE POLICY "ba_hunter_all" ON blocked_agents
  FOR ALL USING (auth.uid() = hunter_id);


-- ─── HELPER: enforce max 8 agent matches per search ─────────────────────────

CREATE OR REPLACE FUNCTION check_max_agent_matches()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM agent_matches WHERE search_request_id = NEW.search_request_id) >= 8 THEN
    RAISE EXCEPTION 'Maximum 8 agent matches per search request';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_agent_matches
  BEFORE INSERT ON agent_matches
  FOR EACH ROW EXECUTE FUNCTION check_max_agent_matches();


-- ─── HELPER: auto-expire stale matches ───────────────────────────────────────
-- Call via pg_cron or Inngest scheduled job

CREATE OR REPLACE FUNCTION expire_stale_agent_matches()
RETURNS int AS $$
DECLARE
  affected int;
BEGIN
  UPDATE agent_matches
  SET    status = 'expired'
  WHERE  status = 'sent'
    AND  expires_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
