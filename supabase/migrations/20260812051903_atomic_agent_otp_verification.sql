-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260812051903.

-- Closes the OTP brute-force path.
--
-- agent_email_otps already has an `attempts` column defaulting to 0, but nothing in
-- the database enforces a ceiling. A 6-digit code is 1,000,000 combinations — without
-- a limit an attacker walks it and takes over any agent account.
--
-- Putting verification in the database rather than the app matters for one specific
-- reason: SELECT ... FOR UPDATE. An app that reads the row, compares, then writes
-- attempts+1 is racy — fire 500 parallel requests and every one of them reads
-- attempts=0. The row lock serialises them, so parallel brute force is defeated too.

CREATE INDEX IF NOT EXISTS idx_agent_email_otps_lookup
  ON public.agent_email_otps (user_id, expires_at DESC)
  WHERE consumed_at IS NULL;

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
BEGIN
  -- Most recent live code for this user. FOR UPDATE serialises concurrent attempts.
  SELECT * INTO r
  FROM public.agent_email_otps
  WHERE user_id = p_user_id
    AND consumed_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  -- No live code. Deliberately indistinguishable from a wrong code so this cannot
  -- be used to probe whether an account or a pending OTP exists.
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;

  -- Already at the ceiling: burn the code rather than merely refusing, otherwise the
  -- attacker waits out any time window and resumes against a still-valid code.
  IF r.attempts >= p_max_attempts THEN
    UPDATE public.agent_email_otps SET consumed_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('ok', false, 'reason', 'locked');
  END IF;

  IF r.code = p_code THEN
    UPDATE public.agent_email_otps SET consumed_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('ok', true);
  END IF;

  v_attempts := r.attempts + 1;

  UPDATE public.agent_email_otps
     SET attempts = v_attempts,
         -- Final strike invalidates the code outright.
         consumed_at = CASE WHEN v_attempts >= p_max_attempts THEN now() ELSE NULL END
   WHERE id = r.id;

  RETURN jsonb_build_object(
    'ok', false,
    'reason', CASE WHEN v_attempts >= p_max_attempts THEN 'locked' ELSE 'invalid' END,
    'attempts_remaining', greatest(0, p_max_attempts - v_attempts)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_agent_otp(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_agent_otp(uuid, text, integer) TO service_role;
