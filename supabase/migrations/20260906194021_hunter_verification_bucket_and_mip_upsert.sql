-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906194021.

-- Hunter MIP capture: storage + write path.
--
-- 1. Private bucket for hunter documents. A mortgage-in-principle is a financial
--    document; it must never live in the public listing-photos bucket. Users may
--    upload and read only under their own {user_id}/ prefix. Verification staff
--    read via service_role.
-- 2. One verification record per hunter, so the passport form can upsert.
-- 3. A single RPC that writes the MIP fields, so the form does not need a
--    user-level UPDATE policy on buyer_verifications (there is none, deliberately).

-- 1. Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hunter-verification', 'hunter-verification', false, 10485760,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "hunter_verification_upload_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'hunter-verification'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "hunter_verification_read_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'hunter-verification'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 2. One row per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_buyer_verifications_user
  ON public.buyer_verifications (user_id);

-- 3. Write path. Caller is the app's service client AFTER requireAuth(); p_user_id
--    is the authenticated user, never client-supplied. Consent is recorded with a
--    timestamp only when it flips to true, and cleared when withdrawn.
CREATE OR REPLACE FUNCTION public.save_hunter_mip(
  p_user_id          uuid,
  p_lender           text,
  p_amount_minor     integer,
  p_currency         character(3),
  p_issued_at        date,
  p_expires_at       date,
  p_document_path    text,
  p_referral_consent boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE v_id uuid; v_prev_consent boolean;
BEGIN
  IF p_document_path IS NOT NULL
     AND split_part(p_document_path, '/', 1) <> p_user_id::text THEN
    RAISE EXCEPTION 'document path must be under the user''s own prefix';
  END IF;

  SELECT referral_consent INTO v_prev_consent
  FROM public.buyer_verifications WHERE user_id = p_user_id;

  INSERT INTO public.buyer_verifications AS b
    (user_id, tier, status, currency,
     mip_lender, mip_amount, mip_currency, mip_issued_at, mip_expires_at,
     mip_document_path, referral_consent, referral_consented_at, updated_at)
  VALUES
    (p_user_id, 'basic', 'pending', coalesce(p_currency, 'GBP'),
     p_lender, p_amount_minor, coalesce(p_currency, 'GBP'), p_issued_at, p_expires_at,
     p_document_path, coalesce(p_referral_consent, false),
     CASE WHEN p_referral_consent THEN now() END, now())
  ON CONFLICT (user_id) DO UPDATE SET
    mip_lender        = EXCLUDED.mip_lender,
    mip_amount        = EXCLUDED.mip_amount,
    mip_currency      = EXCLUDED.mip_currency,
    mip_issued_at     = EXCLUDED.mip_issued_at,
    mip_expires_at    = EXCLUDED.mip_expires_at,
    mip_document_path = coalesce(EXCLUDED.mip_document_path, b.mip_document_path),
    -- a new document invalidates any previous verification
    mip_verified_at   = CASE WHEN EXCLUDED.mip_document_path IS NOT NULL
                              AND EXCLUDED.mip_document_path IS DISTINCT FROM b.mip_document_path
                             THEN NULL ELSE b.mip_verified_at END,
    referral_consent  = EXCLUDED.referral_consent,
    referral_consented_at = CASE
                              WHEN EXCLUDED.referral_consent AND NOT coalesce(v_prev_consent, false) THEN now()
                              WHEN NOT EXCLUDED.referral_consent THEN NULL
                              ELSE b.referral_consented_at END,
    updated_at        = now()
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION public.save_hunter_mip(uuid, text, integer, character, date, date, text, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_hunter_mip(uuid, text, integer, character, date, date, text, boolean)
  TO service_role;
