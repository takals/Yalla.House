-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260812050616.

-- Honeypot + IP auto-block.
-- Follows the conventions in CLAUDE.md: RLS on, no policies (service_role only),
-- search_path pinned, EXECUTE revoked from anon/authenticated.
--
-- Design notes:
--  * Blocks are TIME-LIMITED and escalate. A permanent block on a first offence is
--    how you accidentally ban a whole mobile carrier's NAT range forever.
--  * Allowlist is checked first and can never be blocked (our own IPs, monitoring).
--  * IP addresses are personal data under UK GDPR. Retention is built in, not bolted on.

CREATE TABLE IF NOT EXISTS public.security_ip_allowlist (
  ip          inet PRIMARY KEY,
  label       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_honeypot_hits (
  id          bigserial PRIMARY KEY,
  ip          inet NOT NULL,
  path        text NOT NULL,
  method      text,
  user_agent  text,
  referer     text,
  country     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_honeypot_hits_ip_created
  ON public.security_honeypot_hits (ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_honeypot_hits_created
  ON public.security_honeypot_hits (created_at DESC);

CREATE TABLE IF NOT EXISTS public.security_blocked_ips (
  ip            inet PRIMARY KEY,
  reason        text NOT NULL,
  first_seen    timestamptz NOT NULL DEFAULT now(),
  last_seen     timestamptz NOT NULL DEFAULT now(),
  hit_count     integer NOT NULL DEFAULT 1,
  offence_count integer NOT NULL DEFAULT 1,
  expires_at    timestamptz,          -- NULL = indefinite (only reached after repeat offences)
  released_at   timestamptz,          -- manual unblock, wins over everything
  notes         text
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_active
  ON public.security_blocked_ips (ip)
  WHERE released_at IS NULL;

ALTER TABLE public.security_ip_allowlist   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_honeypot_hits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_blocked_ips    ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service_role only. Do not "fix" this.

-- Is this IP currently blocked? Cheap, single index hit.
CREATE OR REPLACE FUNCTION public.is_ip_blocked(p_ip inet)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.security_blocked_ips b
    WHERE b.ip = p_ip
      AND b.released_at IS NULL
      AND (b.expires_at IS NULL OR b.expires_at > now())
  );
$$;

-- Record a honeypot hit and apply an escalating block.
-- Returns what happened so the caller can log it.
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
  v_ttl      interval;
  v_expires  timestamptz;
BEGIN
  INSERT INTO public.security_honeypot_hits (ip, path, method, user_agent, referer, country)
  VALUES (p_ip, p_path, p_method, p_user_agent, p_referer, p_country);

  -- Allowlisted IPs are recorded but never blocked.
  IF EXISTS (SELECT 1 FROM public.security_ip_allowlist WHERE ip = p_ip) THEN
    RETURN jsonb_build_object('blocked', false, 'reason', 'allowlisted');
  END IF;

  SELECT coalesce(offence_count, 0) INTO v_offences
  FROM public.security_blocked_ips WHERE ip = p_ip;
  v_offences := coalesce(v_offences, 0) + 1;

  -- Escalate: a single hit could be a scanner passing through; repetition is intent.
  v_ttl := CASE
             WHEN v_offences = 1 THEN interval '24 hours'
             WHEN v_offences = 2 THEN interval '7 days'
             ELSE interval '90 days'
           END;
  v_expires := now() + v_ttl;

  INSERT INTO public.security_blocked_ips AS b (ip, reason, expires_at, notes)
  VALUES (p_ip, 'honeypot:' || p_path, v_expires, 'auto')
  ON CONFLICT (ip) DO UPDATE
    SET last_seen     = now(),
        hit_count     = b.hit_count + 1,
        offence_count = b.offence_count + 1,
        reason        = 'honeypot:' || p_path,
        expires_at    = v_expires,
        released_at   = NULL;

  RETURN jsonb_build_object(
    'blocked', true,
    'offence_count', v_offences,
    'expires_at', v_expires
  );
END;
$$;

-- Retention. IP addresses are personal data; do not keep them indefinitely.
CREATE OR REPLACE FUNCTION public.purge_security_logs()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE v_hits int; v_blocks int;
BEGIN
  DELETE FROM public.security_honeypot_hits WHERE created_at < now() - interval '90 days';
  GET DIAGNOSTICS v_hits = ROW_COUNT;

  DELETE FROM public.security_blocked_ips
   WHERE expires_at IS NOT NULL
     AND expires_at < now() - interval '30 days';
  GET DIAGNOSTICS v_blocks = ROW_COUNT;

  RETURN jsonb_build_object('hits_purged', v_hits, 'expired_blocks_purged', v_blocks);
END;
$$;

REVOKE ALL ON FUNCTION public.is_ip_blocked(inet)                                   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_honeypot_hit(inet, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_security_logs()                                  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_ip_blocked(inet)                                   TO service_role;
GRANT EXECUTE ON FUNCTION public.record_honeypot_hit(inet, text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_security_logs()                                  TO service_role;
