-- Track when owner briefs are sent to agents
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS brief_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS brief_agent_count integer DEFAULT 0;

COMMENT ON COLUMN listings.brief_sent_at IS 'Timestamp when the owner brief was last sent to agents';
COMMENT ON COLUMN listings.brief_agent_count IS 'Number of agents who received the last brief';
