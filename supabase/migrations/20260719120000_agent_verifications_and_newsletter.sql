-- AI-powered agent verification: agents upload licence/membership proof,
-- Claude reads it, verified_at is set automatically on approval. Audit trail here.
-- Applied to prod 19 Jul 2026 via MCP; kept here for history.
CREATE TABLE IF NOT EXISTS public.agent_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  licence_number text,
  doc_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_review')),
  ai_verdict jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz
);
CREATE INDEX IF NOT EXISTS agent_verifications_user_idx ON public.agent_verifications (user_id, created_at DESC);
ALTER TABLE public.agent_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own verifications readable" ON public.agent_verifications;
CREATE POLICY "own verifications readable" ON public.agent_verifications FOR SELECT USING (auth.uid() = user_id);
-- writes go through the service role only (API route)

-- Newsletter opt-in lives on the user, not the agent profile
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS newsletter_opt_in boolean NOT NULL DEFAULT false;

-- Private bucket for verification documents (service-role access only)
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-verification', 'agent-verification', false)
ON CONFLICT (id) DO NOTHING;
