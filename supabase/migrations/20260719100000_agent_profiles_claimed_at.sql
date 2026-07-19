-- Claim flow: track when a scraped directory profile is claimed by a real account
ALTER TABLE public.agent_profiles ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
COMMENT ON COLUMN public.agent_profiles.claimed_at IS 'Set when a signed-up agent claims this scraped directory row (email match). NULL = unclaimed.';
CREATE INDEX IF NOT EXISTS agent_profiles_email_lower_idx ON public.agent_profiles (lower(email)) WHERE data_source IS NOT NULL AND claimed_at IS NULL;
