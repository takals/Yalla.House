-- =============================================================================
-- Conversational Intake System
-- Migration: 20260411000000
-- Adds: intake_memories, intake_sessions, intake_patterns
-- Enables multi-step conversational flows for owner/hunter/agent onboarding
-- =============================================================================

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE intake_flow_type AS ENUM ('owner-brief', 'hunter-passport', 'agent-profile');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intake_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intake_source_type AS ENUM ('voice', 'text', 'click');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intake_pattern_type AS ENUM ('common_value', 'common_sequence', 'drop_off_point', 'voice_correction');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── INTAKE MEMORIES ────────────────────────────────────────────────────────
-- Per-user memory for returning users
-- Each flow can remember field values to pre-populate on subsequent visits

CREATE TABLE IF NOT EXISTS intake_memories (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flow_id           text NOT NULL,                     -- 'owner-brief', 'hunter-passport', 'agent-profile'
  field             text NOT NULL,                     -- e.g. 'property_type', 'budget', 'location'
  value             jsonb NOT NULL,                    -- flexible: string, number, array, object
  source            intake_source_type NOT NULL DEFAULT 'text', -- 'voice', 'text', 'click'
  confidence        numeric(3,2) NOT NULL DEFAULT 0.95, -- 0.00–1.00
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,                       -- soft delete for GDPR
  UNIQUE (user_id, flow_id, field)
);

CREATE INDEX idx_intake_memories_user_flow ON intake_memories(user_id, flow_id);
CREATE INDEX idx_intake_memories_user_flow_field ON intake_memories(user_id, flow_id, field);
CREATE INDEX idx_intake_memories_deleted ON intake_memories(deleted_at) WHERE deleted_at IS NOT NULL;

-- Trigger: auto-update updated_at on intake_memories
CREATE OR REPLACE FUNCTION trg_intake_memories_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER intake_memories_updated_at
  BEFORE UPDATE ON intake_memories
  FOR EACH ROW EXECUTE FUNCTION trg_intake_memories_updated_at();


-- ─── INTAKE SESSIONS ────────────────────────────────────────────────────────
-- Tracks each conversational intake session (one per flow attempt)

CREATE TABLE IF NOT EXISTS intake_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flow_id           text NOT NULL,                     -- matches intake_flow_type values
  status            intake_session_status NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  data              jsonb NOT NULL DEFAULT '{}',       -- collected form data {field: value}
  messages          jsonb NOT NULL DEFAULT '[]',       -- chat history [{role, content, timestamp}]
  voice_used        boolean NOT NULL DEFAULT false,    -- whether voice input was used in this session
  fields_from_memory integer NOT NULL DEFAULT 0,       -- count of fields pre-filled from memories
  fields_total      integer NOT NULL DEFAULT 0,        -- total required fields for this flow
  started_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,                       -- null until status='completed'
  duration_seconds  integer,                           -- computed on completion
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intake_sessions_user_flow ON intake_sessions(user_id, flow_id);
CREATE INDEX idx_intake_sessions_user_flow_status ON intake_sessions(user_id, flow_id, status);
CREATE INDEX idx_intake_sessions_status ON intake_sessions(status) WHERE status IN ('in_progress', 'completed');


-- ─── INTAKE PATTERNS ────────────────────────────────────────────────────────
-- Aggregated learning data (Phase 3: ML insights)
-- Computed from intake_memories and intake_sessions
-- Write-only via service role; read-only for authenticated users

CREATE TABLE IF NOT EXISTS intake_patterns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id           text NOT NULL,                     -- 'owner-brief', etc.
  field             text NOT NULL,                     -- which field exhibits the pattern
  pattern_type      intake_pattern_type NOT NULL,      -- 'common_value', 'common_sequence', 'drop_off_point', 'voice_correction'
  pattern_data      jsonb NOT NULL,                    -- {value, frequency} or {sequence} or {drop_off_field} or {from, to, correction_rate}
  occurrence_count  integer NOT NULL DEFAULT 1,        -- how many times this pattern was seen
  last_seen_at      timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intake_patterns_flow_field ON intake_patterns(flow_id, field);
CREATE INDEX idx_intake_patterns_flow_field_type ON intake_patterns(flow_id, field, pattern_type);


-- ─── RLS POLICIES ───────────────────────────────────────────────────────────

-- intake_memories: users can CRUD their own, service role can CRUD all
ALTER TABLE intake_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_memories_user_select"
  ON intake_memories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "intake_memories_user_insert"
  ON intake_memories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "intake_memories_user_update"
  ON intake_memories FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "intake_memories_user_delete"
  ON intake_memories FOR DELETE
  USING (user_id = auth.uid());


-- intake_sessions: users can CRUD their own, service role can CRUD all
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_sessions_user_select"
  ON intake_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "intake_sessions_user_insert"
  ON intake_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "intake_sessions_user_update"
  ON intake_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "intake_sessions_user_delete"
  ON intake_sessions FOR DELETE
  USING (user_id = auth.uid());


-- intake_patterns: authenticated users can SELECT, service role can CRUD all
ALTER TABLE intake_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intake_patterns_authenticated_select"
  ON intake_patterns FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role writes are handled via service_role client (no explicit policy needed for INSERT/UPDATE/DELETE)


COMMENT ON TABLE intake_memories IS 'Per-user memory for intake fields. Soft-deletable via deleted_at. Updated automatically on change.';
COMMENT ON TABLE intake_sessions IS 'Conversational intake session tracking. Records all user data, messages, and completion status.';
COMMENT ON TABLE intake_patterns IS 'Aggregated insights for ML/analytics. Computed from sessions and memories.';
