-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260906084031.

-- BUG found in live testing: record_honeypot_hit read offence_count, then upserted.
-- Under concurrent hits (middleware fires them via waitUntil, so a scanner probing
-- four paths lands four calls at once) every call read 0, computed a 24h TTL, and
-- the upsert's atomic increment left offence_count=4 with a first-offence expiry.
--
-- Fix: derive the TTL INSIDE the upsert from the post-increment count, so the
-- escalation is as atomic as the counter. No separate read.

CREATE OR REPLACE FUNCTION public.record_honeypot_hit(
  p_ip         inet,
  p_path       text,
  p_method     text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referer    text DEFAULT NULL,
  p_country    text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_offences int;
  v_expires  timestamptz;
BEGIN
  INSERT INTO public.security_honeypot_hits (ip, path, method, user_agent, referer, country)
  VALUES (p_ip, p_path, p_method, p_user_agent, p_referer, p_country);

  IF EXISTS (SELECT 1 FROM public.security_ip_allowlist WHERE ip = p_ip) THEN
    RETURN jsonb_build_object('blocked', false, 'reason', 'allowlisted');
  END IF;

  INSERT INTO public.security_blocked_ips AS b (ip, reason, offence_count, expires_at, notes)
  VALUES (p_ip, 'honeypot:' || p_path, 1, now() + interval '24 hours', 'auto')
  ON CONFLICT (ip) DO UPDATE
    SET last_seen     = now(),
        hit_count     = b.hit_count + 1,
        offence_count = b.offence_count + 1,
        reason        = 'honeypot:' || p_path,
        released_at   = NULL,
        -- escalation computed from the incremented value, atomically
        expires_at    = now() + CASE
                          WHEN b.offence_count + 1 = 1 THEN interval '24 hours'
                          WHEN b.offence_count + 1 = 2 THEN interval '7 days'
                          ELSE interval '90 days'
                        END
  RETURNING b.offence_count, b.expires_at INTO v_offences, v_expires;

  RETURN jsonb_build_object('blocked', true, 'offence_count', v_offences, 'expires_at', v_expires);
END;
$$;
