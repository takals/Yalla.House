-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260725065221.

-- run_enrich_loop previously called edge functions with only a Content-Type header.
-- That is why enrich-emails / enrich-cf-emails / enrich-propertymark were deployed
-- with verify_jwt=false, which left them callable by anyone on the internet.
--
-- This version reads the service-role key from Vault and sends it as a Bearer token.
-- It degrades safely: with no secret stored it behaves exactly as before, so this
-- migration changes nothing until the secret is added. Sequence to close the hole:
--   1. this migration
--   2. select vault.create_secret('<service-role-key>', 'service_role_key');
--   3. redeploy those functions with verify_jwt = true
--
-- Also captures the pg_net request id: previously failures were silent because the
-- return value was discarded via PERFORM.

CREATE OR REPLACE PROCEDURE public.run_enrich_loop(
  IN fn text,
  IN batch_limit integer,
  IN iterations integer,
  IN wait_s integer
)
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $procedure$
DECLARE
  i         int;
  v_key     text;
  v_headers jsonb;
  v_req_id  bigint;
BEGIN
  SELECT decrypted_secret INTO v_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  v_headers := jsonb_build_object('Content-Type', 'application/json');

  IF v_key IS NOT NULL THEN
    v_headers := v_headers || jsonb_build_object('Authorization', 'Bearer ' || v_key);
  ELSE
    RAISE WARNING
      'run_enrich_loop: no service_role_key in vault, calling % unauthenticated. This only works while that function has verify_jwt=false.', fn;
  END IF;

  FOR i IN 1..iterations LOOP
    SELECT net.http_post(
      url                  := 'https://suchdotsrrlsfxrvsmvy.supabase.co/functions/v1/' || fn,
      headers              := v_headers,
      body                 := jsonb_build_object('limit', batch_limit),
      timeout_milliseconds := 60000
    ) INTO v_req_id;

    RAISE NOTICE 'run_enrich_loop: % iteration %/% queued as pg_net request %',
      fn, i, iterations, v_req_id;

    COMMIT;
    PERFORM pg_sleep(wait_s);
  END LOOP;
END
$procedure$;

REVOKE ALL ON PROCEDURE public.run_enrich_loop(text, integer, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON PROCEDURE public.run_enrich_loop(text, integer, integer, integer)
  TO service_role;
