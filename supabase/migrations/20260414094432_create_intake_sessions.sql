-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260414094432.

CREATE TABLE IF NOT EXISTS public.intake_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  flow_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  voice_used BOOLEAN DEFAULT false,
  fields_from_memory INTEGER DEFAULT 0,
  fields_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_intake_sessions_user
  ON public.intake_sessions(user_id, flow_id, created_at DESC);

ALTER TABLE public.intake_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.intake_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.intake_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.intake_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
