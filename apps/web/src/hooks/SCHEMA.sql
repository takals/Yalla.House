-- Supabase Migration: Create intake_memories table
-- Required for useIntakeMemory hook

CREATE TABLE IF NOT EXISTS public.intake_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flow and user context
  flow_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Memory data
  field TEXT NOT NULL,
  value JSONB,
  source TEXT NOT NULL CHECK (source IN ('voice', 'text', 'click')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.95,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,

  -- Ensure most recent entry per field (upsert support)
  UNIQUE(flow_id, user_id, field) DEFERRABLE INITIALLY DEFERRED
);

-- Performance indexes
CREATE INDEX idx_intake_memories_user_flow
  ON public.intake_memories(user_id, flow_id, deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_intake_memories_flow_user
  ON public.intake_memories(flow_id, user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_intake_memories_created
  ON public.intake_memories(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.intake_memories ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own memories
CREATE POLICY "Users can view own memories"
  ON public.intake_memories
  FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR auth.jwt()->>'role' = 'admin'
  );

CREATE POLICY "Users can insert own memories"
  ON public.intake_memories
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own memories"
  ON public.intake_memories
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Trigger: auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_intake_memories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_intake_memories_timestamp
  BEFORE INSERT ON public.intake_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_intake_memories_timestamp();

-- View: Most recent memories per user+flow
CREATE OR REPLACE VIEW intake_memories_latest AS
  SELECT DISTINCT ON (user_id, flow_id, field)
    id,
    flow_id,
    user_id,
    field,
    value,
    source,
    confidence,
    created_at
  FROM public.intake_memories
  WHERE deleted_at IS NULL
  ORDER BY user_id, flow_id, field, created_at DESC;

-- Comment: explain the table structure
COMMENT ON TABLE public.intake_memories IS
'Stores user intake form responses with confidence scores and source tracking.
Used by useIntakeMemory hook for persistent user memory across sessions.
flow_id: intake flow identifier (owner-brief, hunter-passport, agent-profile)
user_id: user UUID or identifier
field: form field name (location, bedrooms, budget, etc.)
value: JSON-encoded field value (allows flexible types)
source: how value was entered (voice, text, click)
confidence: 0-1 confidence score (voice:0.85, text:0.95, click:1.0)';

COMMENT ON COLUMN public.intake_memories.source IS
'voice=0.85 confidence, text=0.95 confidence, click=1.0 confidence';

COMMENT ON COLUMN public.intake_memories.value IS
'JSON-encoded value. Examples:
  "E3"::jsonb for location (string)
  2::jsonb for bedrooms (integer)
  500000::jsonb for budget (integer, in pence)
  ["garden", "parking"]::jsonb for must_haves (array)';
