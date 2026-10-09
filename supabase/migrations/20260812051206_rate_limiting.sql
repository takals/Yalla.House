-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260812051206.

-- Rate limiting. Fixed-window counters, one row per (scope, key), atomic via upsert.
-- Follows CLAUDE.md conventions: RLS on with no policies, service_role only,
-- search_path pinned, anon/authenticated GRANTs revoked.
--
-- Privacy: keys are IPs and email addresses — personal data. We store only a SHA-256
-- of the key, never the raw value, and rows are purged once the window lapses.
-- Hashing is not anonymisation (an IP is guessable), but it stops the table becoming
-- a second, casually-readable store of user emails.

CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  scope         text        NOT NULL,
  key_hash      text        NOT NULL,
  window_start  timestamptz NOT NULL DEFAULT now(),
  count         integer     NOT NULL DEFAULT 0,
  breach_count  integer     NOT NULL DEFAULT 0,
  last_breach   timestamptz,
  PRIMARY KEY (scope, key_hash)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON public.security_rate_limits (window_start);

ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service_role only.

REVOKE ALL ON TABLE public.security_rate_limits FROM anon, authenticated;

-- Atomic check-and-increment. Returns whether the caller may proceed.
-- Single statement, so concurrent requests cannot race past the limit.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_scope          text,
  p_key            text,
  p_limit          integer,
  p_window_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash    text := encode(sha256(convert_to(p_key, 'UTF8')), 'hex');
  v_window  interval := make_interval(secs => p_window_seconds);
  v_count   integer;
  v_start   timestamptz;
  v_breach  integer;
BEGIN
  INSERT INTO public.security_rate_limits AS r (scope, key_hash, window_start, count)
  VALUES (p_scope, v_hash, now(), 1)
  ON CONFLICT (scope, key_hash) DO UPDATE
    SET count = CASE
                  WHEN r.window_start < now() - v_window THEN 1
                  ELSE r.count + 1
                END,
        window_start = CASE
                  WHEN r.window_start < now() - v_window THEN now()
                  ELSE r.window_start
                END,
        breach_count = CASE
                  WHEN r.window_start < now() - v_window THEN r.breach_count
                  WHEN r.count + 1 > p_limit THEN r.breach_count + 1
                  ELSE r.breach_count
                END,
        last_breach = CASE
                  WHEN r.window_start >= now() - v_window AND r.count + 1 > p_limit
                  THEN now() ELSE r.last_breach
                END
  RETURNING r.count, r.window_start, r.breach_count
  INTO v_count, v_start, v_breach;

  RETURN jsonb_build_object(
    'allowed',      v_count <= p_limit,
    'count',        v_count,
    'limit',        p_limit,
    'remaining',    greatest(0, p_limit - v_count),
    'reset_at',     v_start + v_window,
    'retry_after',  greatest(0, ceil(extract(epoch FROM (v_start + v_window - now()))))::int,
    'breach_count', v_breach
  );
END;
$$;

-- Escalate a persistently abusive IP into the existing blocklist.
-- Deliberately separate from check_rate_limit: being rate limited is normal and
-- self-correcting, being blocked is not. The caller decides when to escalate.
CREATE OR REPLACE FUNCTION public.escalate_ip_block(
  p_ip     inet,
  p_reason text,
  p_hours  integer DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE v_expires timestamptz := now() + make_interval(hours => p_hours);
BEGIN
  IF EXISTS (SELECT 1 FROM public.security_ip_allowlist WHERE ip = p_ip) THEN
    RETURN jsonb_build_object('blocked', false, 'reason', 'allowlisted');
  END IF;

  INSERT INTO public.security_blocked_ips AS b (ip, reason, expires_at, notes)
  VALUES (p_ip, p_reason, v_expires, 'rate-limit escalation')
  ON CONFLICT (ip) DO UPDATE
    SET last_seen     = now(),
        hit_count     = b.hit_count + 1,
        offence_count = b.offence_count + 1,
        reason        = p_reason,
        expires_at    = greatest(coalesce(b.expires_at, now()), v_expires),
        released_at   = NULL;

  RETURN jsonb_build_object('blocked', true, 'expires_at', v_expires);
END;
$$;

-- Extend retention purge to cover rate-limit rows.
CREATE OR REPLACE FUNCTION public.purge_security_logs()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE v_hits int; v_blocks int; v_limits int;
BEGIN
  DELETE FROM public.security_honeypot_hits WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_hits = ROW_COUNT;

  DELETE FROM public.security_blocked_ips
   WHERE expires_at IS NOT NULL AND expires_at < now() - interval '30 days';
  GET DIAGNOSTICS v_blocks = ROW_COUNT;

  -- Stale counters serve no purpose and hold hashed personal data.
  DELETE FROM public.security_rate_limits WHERE window_start < now() - interval '7 days';
  GET DIAGNOSTICS v_limits = ROW_COUNT;

  RETURN jsonb_build_object(
    'hits_purged', v_hits,
    'expired_blocks_purged', v_blocks,
    'rate_limit_rows_purged', v_limits
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.escalate_ip_block(inet, text, integer)          FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.escalate_ip_block(inet, text, integer)          TO service_role;
