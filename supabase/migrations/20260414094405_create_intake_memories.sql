-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260414094405.

CREATE TABLE IF NOT EXISTS public.intake_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  field TEXT NOT NULL,
  value JSONB,
  source TEXT NOT NULL CHECK (source IN ('voice', 'text', 'click')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.95,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(flow_id, user_id, field) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_intake_memories_user_flow
  ON public.intake_memories(user_id, flow_id, deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_intake_memories_flow_user
  ON public.intake_memories(flow_id, user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_intake_memories_created
  ON public.intake_memories(created_at DESC);

ALTER TABLE public.intake_memories ENABLE ROW LEVEL SECURITY;

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
