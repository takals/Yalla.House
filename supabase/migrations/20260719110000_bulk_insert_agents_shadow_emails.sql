-- Shadow users created by agent imports must NEVER hold real agent emails:
-- users_email_key would block that agent's real signup (silent auth-callback
-- failure). Emails belong on agent_profiles.email only. Dedup moves from
-- users.email conflicts (broken since shadow emails were namespaced) to
-- profile-level matching on (data_source, agency_name, raw_address).
-- Applied to prod 19 Jul 2026 via MCP; kept here for history.

CREATE OR REPLACE FUNCTION public.bulk_insert_agents(agents jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  agent jsonb;
  new_id uuid;
  cnt integer := 0;
  services_text text;
  focus_value text;
BEGIN
  FOR agent IN SELECT * FROM jsonb_array_elements(agents)
  LOOP
    services_text := COALESCE(agent->>'services', 'Sales');
    focus_value := 'sale';
    IF services_text LIKE '%Lettings%' AND services_text LIKE '%Sales%' THEN
      focus_value := 'both';
    ELSIF services_text LIKE '%Lettings%' THEN
      focus_value := 'rent';
    END IF;

    -- Dedup at profile level (name + address within the source)
    IF EXISTS (
      SELECT 1 FROM agent_profiles
      WHERE data_source = 'propertymark'
        AND lower(agency_name) = lower(agent->>'name')
        AND coalesce(raw_address, '') = coalesce(NULLIF(agent->>'address', ''), '')
    ) THEN
      CONTINUE;
    END IF;

    new_id := gen_random_uuid();

    -- Shadow user with namespaced email — never the agent's real address
    INSERT INTO users (id, email, full_name, country_code, language, created_at, updated_at)
    VALUES (new_id, 'shadow+' || new_id || '@import.yalla.house', agent->>'name', 'GB', 'en', now(), now());

    INSERT INTO user_roles (user_id, role, is_active)
    VALUES (new_id, 'agent', true);

    INSERT INTO agent_profiles (
      user_id, agency_name, coverage_areas, property_types, focus,
      verified_at, subscription_tier, languages, data_source, source_url,
      postcode, raw_address, website, email, service_types
    ) VALUES (
      new_id,
      agent->>'name',
      jsonb_build_object('areas', COALESCE(agent->'areas', '[]'::jsonb), 'postcode', agent->>'postcode'),
      string_to_array(services_text, '|'),
      focus_value,
      now(),
      'free',
      '{en}',
      'propertymark',
      agent->>'profileUrl',
      NULLIF(agent->>'postcode', ''),
      NULLIF(agent->>'address', ''),
      NULLIF(agent->>'website', ''),
      NULLIF(agent->>'agentEmail', ''),
      string_to_array(services_text, '|')
    );

    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$function$;

-- v2 gets the identical fixed body (kept for existing callers, e.g. scrape-propertymark)
CREATE OR REPLACE FUNCTION public.bulk_insert_agents_v2(agents jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.bulk_insert_agents(agents);
END;
$function$;
