-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260414125757.

CREATE TABLE IF NOT EXISTS public.search_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunter_id UUID NOT NULL REFERENCES auth.users(id),
  intent TEXT NOT NULL CHECK (intent IN ('buy', 'rent')),
  areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  radius_km INTEGER DEFAULT 5,
  budget_min BIGINT,
  budget_max BIGINT,
  currency TEXT DEFAULT 'GBP',
  property_types TEXT[] DEFAULT '{}',
  bedrooms_min INTEGER,
  bedrooms_max INTEGER,
  timeline TEXT DEFAULT 'flexible',
  notes TEXT,
  languages TEXT[] DEFAULT '{en}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_request_id UUID NOT NULL REFERENCES public.search_requests(id),
  agent_outreach BOOLEAN DEFAULT false,
  phone_allowed BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_requests_hunter ON public.search_requests(hunter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_consent_search ON public.contact_consent(search_request_id);

ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own searches" ON public.search_requests FOR ALL USING (auth.uid() = hunter_id);
CREATE POLICY "Users can manage own consent" ON public.contact_consent FOR ALL USING (
  search_request_id IN (SELECT id FROM public.search_requests WHERE hunter_id = auth.uid())
);
