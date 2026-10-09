-- Exported from supabase_migrations.schema_migrations on 2026-09-07.
-- Applied to production via the Supabase MCP on version timestamp 20260413182229.

CREATE OR REPLACE FUNCTION public.bulk_insert_agents(agents jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
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
    new_id := gen_random_uuid();
    services_text := COALESCE(agent->>'services', 'Sales');
    
    -- Determine focus based on services
    -- If services contains 'Sales', set to 'sale'
    -- If services contains 'Lettings', set to 'rent'
    -- If both, set to 'both'
    focus_value := 'sale'; -- default
    IF services_text LIKE '%Lettings%' AND service_text LIKE '%Sales%' THEN
      focus_value := 'both';
    ELSIF services_text LIKE '%Lettings%' THEN
      focus_value := 'rent';
    END IF;
    
    -- Insert user
    INSERT INTO users (id, email, full_name, country_code, language, created_at, updated_at)
    VALUES (
      new_id,
      COALESCE(agent->>'email', lower(regexp_replace(agent->>'name', '[^a-zA-Z0-9]+', '.', 'g')) || '@propertymark.seed'),
      agent->>'name',
      'GB',
      'en',
      now(),
      now()
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Check if user was actually inserted
    IF EXISTS (SELECT 1 FROM users WHERE id = new_id) THEN
      -- Insert role
      INSERT INTO user_roles (user_id, role, is_active)
      VALUES (new_id, 'agent', true);
      
      -- Insert agent profile
      INSERT INTO agent_profiles (
        user_id, agency_name, coverage_areas, property_types, focus,
        verified_at, subscription_tier, languages, data_source, source_url,
        postcode, raw_address, website, email, service_types
      ) VALUES (
        new_id,
        agent->>'name',
        jsonb_build_object('areas', COALESCE(agent->'areas', '["London"]'::jsonb), 'postcode', agent->>'postcode'),
        string_to_array(COALESCE(agent->>'services', 'Sales'), '|'),
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
        string_to_array(COALESCE(agent->>'services', 'Sales'), '|')
      );
      
      cnt := cnt + 1;
    END IF;
  END LOOP;
  
  RETURN cnt;
END;
$function$
