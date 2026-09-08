-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260812052152.

-- OTP codes are stored in plaintext. A backup leak or any read access to
-- agent_email_otps exposes live codes.
--
-- Backward compatible by design: code_hash is nullable, and verify_agent_otp checks
-- the hash when present and falls back to the plaintext column when it is not.
-- Nothing breaks if the app keeps issuing plaintext; adoption can happen later.

ALTER TABLE public.agent_email_otps
  ADD COLUMN IF NOT EXISTS code_hash text;

-- Issue a code: stores only the hash, returns the plaintext ONCE for emailing.
-- Randomness comes from gen_random_uuid() (cryptographically strong, built in)
-- rather than random(), which is seeded and predictable — a fatal flaw for an OTP.
CREATE OR REPLACE FUNCTION public.issue_agent_otp(
  p_user_id      uuid,
  p_email        text,
  p_ttl_minutes  integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_code text;
  v_id   uuid;
BEGIN
  -- Invalidate any outstanding codes so only one is ever live per user.
  UPDATE public.agent_email_otps
     SET consumed_at = now()
   WHERE user_id = p_user_id AND consumed_at IS NULL;

  v_code := lpad(
    ((('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))::bit(32)::bigint)
      % 1000000)::text, 6, '0');

  INSERT INTO public.agent_email_otps (user_id, email, code, code_hash, expires_at)
  VALUES (
    p_user_id, p_email,
    '',  -- plaintext column deliberately left empty for newly issued codes
    encode(sha256(convert_to(v_code, 'UTF8')), 'hex'),
    now() + make_interval(mins => p_ttl_minutes)
  )
  RETURNING id INTO v_id;

  -- Caller must email this immediately; it is not recoverable afterwards.
  RETURN jsonb_build_object('id', v_id, 'code', v_code,
                            'expires_at', now() + make_interval(mins => p_ttl_minutes));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_agent_otp(
  p_user_id      uuid,
  p_code         text,
  p_max_attempts integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  r          public.agent_email_otps%ROWTYPE;
  v_attempts integer;
  v_match    boolean;
BEGIN
  SELECT * INTO r
  FROM public.agent_email_otps
  WHERE user_id = p_user_id
    AND consumed_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;   -- serialises concurrent attempts; defeats parallel brute force

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  IF r.attempts >= p_max_attempts THEN
    UPDATE public.agent_email_otps SET consumed_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('ok', false, 'reason', 'locked');
  END IF;

  -- Hash when available, plaintext fallback for codes issued by the old path.
  v_match := CASE
               WHEN r.code_hash IS NOT NULL
                 THEN r.code_hash = encode(sha256(convert_to(p_code, 'UTF8')), 'hex')
               ELSE r.code = p_code AND r.code <> ''
             END;

  IF v_match THEN
    UPDATE public.agent_email_otps SET consumed_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('ok', true);
  END IF;

  v_attempts := r.attempts + 1;

  UPDATE public.agent_email_otps
     SET attempts    = v_attempts,
         consumed_at = CASE WHEN v_attempts >= p_max_attempts THEN now() ELSE NULL END
   WHERE id = r.id;

  RETURN jsonb_build_object(
    'ok', false,
    'reason', CASE WHEN v_attempts >= p_max_attempts THEN 'locked' ELSE 'invalid' END,
    'attempts_remaining', greatest(0, p_max_attempts - v_attempts)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.issue_agent_otp(uuid, text, integer)  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_agent_otp(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_agent_otp(uuid, text, integer)  TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_agent_otp(uuid, text, integer) TO service_role;
