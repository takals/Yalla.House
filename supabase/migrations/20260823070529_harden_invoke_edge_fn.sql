-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260823070529.

-- invoke_edge_fn was SECURITY DEFINER, callable by anon and authenticated via
-- /rest/v1/rpc/invoke_edge_fn. It reads the service_role key out of Vault and
-- sends it as a Bearer token to an edge function named by the caller, with the
-- name concatenated straight into the URL. Anyone holding the public anon key
-- could therefore invoke any edge function AS service_role, and the unvalidated
-- name allowed traversal beyond /functions/v1/. This defeated the entire
-- verify_jwt hardening effort — flipping that flag would not have helped,
-- because this function supplies the key.
--
-- run_enrich_loop does NOT use this helper (it builds its own http_post), so
-- nothing in the pipeline depends on the removed grants.

REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM authenticated;

-- Defence in depth: pin search_path, and allow-list the function names so a
-- restored grant or a future caller still cannot reach an arbitrary URL.
CREATE OR REPLACE FUNCTION public.invoke_edge_fn(fn text, payload jsonb DEFAULT '{}'::jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  k   text;
  rid bigint;
BEGIN
  IF fn IS NULL OR fn !~ '^[a-z0-9][a-z0-9-]{0,62}$' THEN
    RAISE EXCEPTION 'invoke_edge_fn: invalid function name %', fn;
  END IF;

  IF fn NOT IN (
    'enrich-emails',
    'enrich-cf-emails',
    'enrich-propertymark',
    'scrape-propertymark',
    'scrape-prs',
    'bulk-insert-agents'
  ) THEN
    RAISE EXCEPTION 'invoke_edge_fn: % is not an allowed edge function', fn;
  END IF;

  SELECT decrypted_secret INTO k
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  IF k IS NULL THEN
    RAISE EXCEPTION 'invoke_edge_fn: service_role_key missing from vault';
  END IF;

  SELECT net.http_post(
    url                  := 'https://suchdotsrrlsfxrvsmvy.supabase.co/functions/v1/' || fn,
    headers              := jsonb_build_object('Content-Type', 'application/json',
                                               'Authorization', 'Bearer ' || k),
    body                 := payload,
    timeout_milliseconds := 120000
  ) INTO rid;

  RETURN rid;
END
$function$;

-- CREATE OR REPLACE resets grants to the default, so revoke again.
REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_edge_fn(text, jsonb) TO service_role;
