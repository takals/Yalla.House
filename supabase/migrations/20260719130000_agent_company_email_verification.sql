-- Company-email verification: prove control of a business-domain inbox.
-- Short-lived OTP codes, service-role only (RLS denies all client access).
-- Applied to prod 19 Jul 2026 via MCP; kept here for history.
CREATE TABLE IF NOT EXISTS public.agent_email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agent_email_otps_user_idx ON public.agent_email_otps (user_id, created_at DESC);
ALTER TABLE public.agent_email_otps ENABLE ROW LEVEL SECURITY;
-- no policies => clients denied; only the service role (API routes) can read/write

-- Unify verification audit: document path OR company-email path
ALTER TABLE public.agent_verifications ALTER COLUMN doc_path DROP NOT NULL;
ALTER TABLE public.agent_verifications ADD COLUMN IF NOT EXISTS method text;
ALTER TABLE public.agent_verifications ADD COLUMN IF NOT EXISTS verified_email text;

-- Record how a profile was verified (for display + audit)
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS verified_method text;
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS verified_email text;
