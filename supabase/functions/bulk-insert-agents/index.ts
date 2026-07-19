import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Shadow users created for imported agents must NEVER hold the agent's real
// email: public.users.email is unique, so a real email here silently blocks
// that agent's actual signup later. Real contact emails live only on
// agent_profiles.email. Dedup happens at profile level (name + address).
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const rawBody = await req.text();
    let parsed;
    try { parsed = JSON.parse(rawBody); } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { agents } = parsed;
    if (!Array.isArray(agents)) {
      return new Response(JSON.stringify({ error: 'agents must be an array' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const agent of agents) {
      const services = agent.services ? agent.services.split('|') : ['Sales'];
      const hasLettings = services.some((s: string) => s.toLowerCase().includes('letting'));
      const hasSales = services.some((s: string) => s.toLowerCase().includes('sale'));
      let focus = 'both';
      if (hasSales && !hasLettings) focus = 'sale';
      else if (hasLettings && !hasSales) focus = 'rent';

      // Profile-level dedup: same source + name + address = same branch
      let dedupQuery = supabase
        .from('agent_profiles')
        .select('user_id')
        .eq('data_source', 'propertymark')
        .ilike('agency_name', agent.name);
      dedupQuery = agent.address
        ? dedupQuery.eq('raw_address', agent.address)
        : dedupQuery.is('raw_address', null);
      const { data: existing } = await dedupQuery.limit(1).maybeSingle();
      if (existing) { skipped++; continue; }

      // Mint shadow user with a namespaced email — never the real one
      const shadowId = crypto.randomUUID();
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: shadowId,
          email: `shadow+${shadowId}@import.yalla.house`,
          full_name: agent.name,
          country_code: 'GB',
          language: 'en',
        });
      if (userError) { errors.push(`User ${agent.name}: ${userError.message}`); continue; }

      await supabase.from('user_roles').upsert({ user_id: shadowId, role: 'agent', is_active: true }, { onConflict: 'user_id,role' });

      const { error: profileError } = await supabase.from('agent_profiles').upsert({
        user_id: shadowId, agency_name: agent.name,
        coverage_areas: { areas: agent.areas || ['UK'], postcode: agent.postcode || null },
        property_types: services, focus, verified_at: new Date().toISOString(),
        subscription_tier: 'free', languages: ['en'], data_source: 'propertymark',
        source_url: agent.profileUrl || null, postcode: agent.postcode || null,
        raw_address: agent.address || null, website: agent.website || null,
        email: agent.agentEmail || null, service_types: services,
      }, { onConflict: 'user_id' });

      if (profileError) { errors.push(`Profile ${agent.name}: ${profileError.message}`); }
      else { inserted++; }
    }

    return new Response(JSON.stringify({ inserted, skipped, errors: errors.slice(0, 20), totalErrors: errors.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
