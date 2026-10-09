-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906040112.

-- Stage 1 scaffolding for two Red Thread items.
--
-- 1. CONTACT ALIASES — implements the non-negotiable "all contact routes through
--    Yalla.House". One alias per (listing, portal). The inbound address itself
--    identifies the source, so every enquiry is attributed without the portal
--    telling us anything. This is what makes "every enquiry from every portal, in
--    one inbox" true.
--
-- 2. MORTGAGE-IN-PRINCIPLE CAPTURE — structured fields on buyer_verifications.
--    A boolean cannot drive a referral; lender, amount and expiry can.
--
-- Conventions: RLS on, no policies (service_role only), anon/authenticated GRANTs
-- revoked, search_path pinned.

-- ---------------------------------------------------------------------------
-- 1. Contact aliases
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.contact_aliases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  portal_id       uuid REFERENCES public.portal_config(id) ON DELETE SET NULL,
                  -- NULL = Yalla.House direct (the listing page itself)
  target_user_id  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                  -- owner or partner agent who receives the enquiry
  alias_email     text UNIQUE,
  alias_phone     text UNIQUE,     -- assigned by the telephony layer; nullable until then
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at      timestamptz,
  CHECK (alias_email IS NOT NULL OR alias_phone IS NOT NULL)
);

-- One live alias per listing per portal.
CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_aliases_listing_portal_active
  ON public.contact_aliases (listing_id, coalesce(portal_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_contact_aliases_listing ON public.contact_aliases (listing_id);
CREATE INDEX IF NOT EXISTS idx_contact_aliases_target  ON public.contact_aliases (target_user_id);
CREATE INDEX IF NOT EXISTS idx_contact_aliases_portal  ON public.contact_aliases (portal_id);

ALTER TABLE public.contact_aliases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.contact_aliases FROM anon, authenticated;

-- Issue an alias for a listing on a portal. Idempotent: returns the existing
-- active alias if there is one.
CREATE OR REPLACE FUNCTION public.issue_contact_alias(
  p_listing_id     uuid,
  p_target_user_id uuid,
  p_portal_id      uuid DEFAULT NULL,
  p_domain         text DEFAULT 'in.yalla.house'
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing  public.contact_aliases%ROWTYPE;
  v_slug      text;
  v_portal    text;
  v_email     text;
  v_id        uuid;
  v_try       int := 0;
BEGIN
  SELECT * INTO v_existing
  FROM public.contact_aliases
  WHERE listing_id = p_listing_id
    AND coalesce(portal_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(p_portal_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND is_active;

  IF FOUND THEN
    RETURN jsonb_build_object('id', v_existing.id, 'alias_email', v_existing.alias_email,
                              'alias_phone', v_existing.alias_phone, 'existing', true);
  END IF;

  SELECT coalesce(slug, 'direct') INTO v_portal
  FROM public.portal_config WHERE id = p_portal_id;
  v_portal := coalesce(v_portal, 'direct');

  -- Short, unguessable local part. Loop guards the (negligible) collision case.
  LOOP
    v_slug  := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
    v_email := 'l-' || v_slug || '-' || v_portal || '@' || p_domain;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.contact_aliases WHERE alias_email = v_email);
    v_try := v_try + 1;
    IF v_try > 5 THEN RAISE EXCEPTION 'alias generation failed after 5 attempts'; END IF;
  END LOOP;

  INSERT INTO public.contact_aliases (listing_id, portal_id, target_user_id, alias_email)
  VALUES (p_listing_id, p_portal_id, p_target_user_id, v_email)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id, 'alias_email', v_email, 'alias_phone', NULL, 'existing', false);
END;
$$;

-- Resolve an inbound address to its listing, source and recipient.
-- Called by the inbound email/SMS webhook. Returns NULL fields for unknown aliases.
CREATE OR REPLACE FUNCTION public.resolve_contact_alias(p_alias text)
RETURNS TABLE (alias_id uuid, listing_id uuid, portal_id uuid, portal_slug text, target_user_id uuid)
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT a.id, a.listing_id, a.portal_id, p.slug, a.target_user_id
  FROM public.contact_aliases a
  LEFT JOIN public.portal_config p ON p.id = a.portal_id
  WHERE a.is_active
    AND (a.alias_email = lower(p_alias) OR a.alias_phone = p_alias)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.revoke_contact_alias(p_alias_id uuid)
RETURNS boolean
LANGUAGE sql
SET search_path = public, pg_temp
AS $$
  UPDATE public.contact_aliases
     SET is_active = false, revoked_at = now()
   WHERE id = p_alias_id AND is_active
  RETURNING true;
$$;

REVOKE ALL ON FUNCTION public.issue_contact_alias(uuid, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_contact_alias(text)                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_contact_alias(uuid)                  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_contact_alias(uuid, uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_contact_alias(text)                 TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_contact_alias(uuid)                  TO service_role;

-- Attribution on inbound leads: which alias, therefore which portal, brought it in.
ALTER TABLE public.inbound_leads
  ADD COLUMN IF NOT EXISTS alias_id  uuid REFERENCES public.contact_aliases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS portal_id uuid REFERENCES public.portal_config(id)   ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inbound_leads_alias  ON public.inbound_leads (alias_id);
CREATE INDEX IF NOT EXISTS idx_inbound_leads_portal ON public.inbound_leads (portal_id);

-- ---------------------------------------------------------------------------
-- 2. Mortgage-in-principle capture
-- ---------------------------------------------------------------------------

ALTER TABLE public.buyer_verifications
  ADD COLUMN IF NOT EXISTS mip_lender        text,
  ADD COLUMN IF NOT EXISTS mip_amount        integer,          -- minor units, matches amount_paid
  ADD COLUMN IF NOT EXISTS mip_currency      character(3),
  ADD COLUMN IF NOT EXISTS mip_issued_at     date,
  ADD COLUMN IF NOT EXISTS mip_expires_at    date,
  ADD COLUMN IF NOT EXISTS mip_document_path text,             -- storage path, never a public URL
  ADD COLUMN IF NOT EXISTS mip_verified_at   timestamptz,
  ADD COLUMN IF NOT EXISTS mip_verified_by   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_consent  boolean NOT NULL DEFAULT false,
                          -- explicit opt-in to be introduced to a mortgage partner. GDPR: consent, not
                          -- legitimate interest, because it is a marketing introduction to a third party.
  ADD COLUMN IF NOT EXISTS referral_consented_at timestamptz;

-- A MIP is only useful while it is in date. Partial index for the referral query.
CREATE INDEX IF NOT EXISTS idx_buyer_verifications_live_mip
  ON public.buyer_verifications (user_id, mip_expires_at)
  WHERE mip_verified_at IS NOT NULL AND referral_consent;
