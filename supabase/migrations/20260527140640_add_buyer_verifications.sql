-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260527140640.

-- Add verification_tier to hunter_profiles
-- 'none' = no verification, 'self_declared' = free passport status, 'basic' = £49, 'full' = £89
ALTER TABLE public.hunter_profiles
ADD COLUMN IF NOT EXISTS verification_tier text NOT NULL DEFAULT 'none';

-- Buyer verifications table — tracks paid verification stamps
CREATE TABLE IF NOT EXISTS public.buyer_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('basic', 'full')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'verified', 'rejected', 'expired')),
  
  -- What was verified
  mortgage_verified boolean NOT NULL DEFAULT false,
  funds_verified boolean NOT NULL DEFAULT false,
  identity_verified boolean NOT NULL DEFAULT false,
  solicitor_verified boolean NOT NULL DEFAULT false,
  
  -- Metadata
  verified_at timestamptz,
  expires_at timestamptz,
  reviewer_notes text,
  country_code char(2) NOT NULL DEFAULT 'GB',
  
  -- Payment
  stripe_payment_id text,
  amount_paid integer, -- minor units
  currency char(3) NOT NULL DEFAULT 'GBP',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_buyer_verifications_user_id ON public.buyer_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_verifications_status ON public.buyer_verifications(status);

-- RLS
ALTER TABLE public.buyer_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verifications
CREATE POLICY "Users can read own verifications"
  ON public.buyer_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "Users can create own verifications"
  ON public.buyer_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for admin review)
CREATE POLICY "Service role full access to verifications"
  ON public.buyer_verifications
  FOR ALL
  USING (auth.role() = 'service_role');
