-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260812050644.

-- Supabase grants anon/authenticated table privileges by default on new public tables.
-- RLS with no policies already returns zero rows, but leaving the GRANT in place means
-- the tables are still exposed on the PostgREST surface and probe-able. Belt and braces:
-- an attacker should not be able to ask whether they are on the blocklist.

REVOKE ALL ON TABLE public.security_blocked_ips   FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_honeypot_hits FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_ip_allowlist  FROM anon, authenticated;

REVOKE ALL ON SEQUENCE public.security_honeypot_hits_id_seq FROM anon, authenticated;

-- Remove simulation data used to verify escalation behaviour.
DELETE FROM public.security_blocked_ips   WHERE ip << '203.0.113.0/24'::inet;
DELETE FROM public.security_honeypot_hits WHERE ip << '203.0.113.0/24'::inet;
DELETE FROM public.security_ip_allowlist  WHERE label = 'TEST-allowlisted';
