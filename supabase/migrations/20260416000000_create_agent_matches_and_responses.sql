-- Agent Matches & Responses tables
-- Completes the Hunter→Agent matching pipeline
-- Applied to live DB on 2026-04-16

-- Enums
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

-- Agent Matches: system-generated matches between search request and agents (max 8 per search)
CREATE TABLE IF NOT EXISTS agent_matches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id uuid NOT NULL REFERENCES search_requests(id) ON DELETE CASCADE,
  agent_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_score       smallint NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  score_breakdown   jsonb DEFAULT '{}',
  status            agent_match_status NOT NULL DEFAULT 'pending',
  sent_at           timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (search_request_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_am_search  ON agent_matches(search_request_id);
CREATE INDEX IF NOT EXISTS idx_am_agent   ON agent_matches(agent_id);
CREATE INDEX IF NOT EXISTS idx_am_status  ON agent_matches(status) WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_am_expires ON agent_matches(expires_at) WHERE status = 'sent';

-- Agent Responses: agent reply to a search brief (one response per match)
CREATE TABLE IF NOT EXISTS agent_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_match_id  uuid NOT NULL REFERENCES agent_matches(id) ON DELETE CASCADE,
  message         text NOT NULL,
  properties      jsonb DEFAULT '[]',
  relevance_score smallint CHECK (relevance_score BETWEEN 0 AND 100),
  priority_tier   response_priority,
  hunter_action   hunter_action,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_match_id)
);

CREATE INDEX IF NOT EXISTS idx_ar_match     ON agent_responses(agent_match_id);
CREATE INDEX IF NOT EXISTS idx_ar_relevance ON agent_responses(relevance_score DESC NULLS LAST);

-- Blocked Agents: permanent exclusion per hunter
CREATE TABLE IF NOT EXISTS blocked_agents (
  hunter_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      text,
  blocked_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hunter_id, agent_id)
);

-- RLS
ALTER TABLE agent_matches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_agents  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "am_hunter_read" ON agent_matches
  FOR SELECT USING (
    search_request_id IN (
      SELECT id FROM search_requests WHERE hunter_id = auth.uid()
    )
  );

CREATE POLICY "am_agent_read" ON agent_matches
  FOR SELECT USING (auth.uid() = agent_id);

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

CREATE POLICY "ba_hunter_all" ON blocked_agents
  FOR ALL USING (auth.uid() = hunter_id);

-- Helper: enforce max 8 agent matches per search
CREATE OR REPLACE FUNCTION check_max_agent_matches()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM agent_matches WHERE search_request_id = NEW.search_request_id) >= 8 THEN
    RAISE EXCEPTION 'Maximum 8 agent matches per search request';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE TRIGGER enforce_max_agent_matches
  BEFORE INSERT ON agent_matches
  FOR EACH ROW EXECUTE FUNCTION check_max_agent_matches();

-- Helper: auto-expire stale matches
CREATE OR REPLACE FUNCTION expire_stale_agent_matches()
RETURNS int AS $$
DECLARE
  affected int;
BEGIN
  UPDATE public.agent_matches
  SET    status = 'expired'
  WHERE  status = 'sent'
    AND  expires_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
