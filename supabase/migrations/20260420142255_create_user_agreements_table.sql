-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260420142255.

-- Centralized agreement tracking with full audit trail
CREATE TABLE public.user_agreements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_type text NOT NULL CHECK (agreement_type IN ('agent_partner', 'owner_tos', 'hunter_tos', 'provider_agreement')),
  version text NOT NULL DEFAULT '1.0',
  signatory_name text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  country_code text NOT NULL DEFAULT 'DE',
  locale text NOT NULL DEFAULT 'de',
  revoked_at timestamptz,
  
  UNIQUE(user_id, agreement_type, version)
);

-- Index for fast lookup: "has this user signed this agreement?"
CREATE INDEX idx_user_agreements_lookup ON public.user_agreements(user_id, agreement_type) WHERE revoked_at IS NULL;

-- RLS: users can read their own agreements, insert their own
ALTER TABLE public.user_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agreements"
  ON public.user_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can sign agreements"
  ON public.user_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin/service role can read all (for compliance)
CREATE POLICY "Service role can read all agreements"
  ON public.user_agreements FOR SELECT
  USING (auth.role() = 'service_role');

-- Migrate existing agent agreement data
INSERT INTO public.user_agreements (user_id, agreement_type, version, signed_at, country_code)
SELECT 
  user_id,
  'agent_partner',
  COALESCE(partner_agreement_version, '1.0'),
  partner_agreement_signed_at,
  'DE'
FROM public.agent_profiles
WHERE partner_agreement_signed_at IS NOT NULL
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.user_agreements IS 'Tracks all platform agreement acceptances with audit trail — timestamp, IP, user agent, version, locale';
