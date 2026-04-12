/**
 * Agent Finder
 *
 * Multi-strategy agent discovery:
 * 1. Registered agents from agent_profiles (verified, active)
 * 2. Prospective agents from prospective_agents (sourced, not yet registered)
 * 3. External scrapers (Google Places, Rightmove, Zoopla) — future
 */

import { createServiceClient } from './supabase/server';

// ────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────────────────────────────────

export interface RegisteredAgent {
  userId: string;
  agencyName: string;
  email: string;
  fullName: string | null;
  verified: boolean;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  coverageAreas: string[]; // postcode prefixes
}

export interface ProspectiveAgent {
  id: string;
  agencyName: string;
  agentName: string | null;
  email: string | null;
  postcode: string | null;
  postcodePrefix: string | null;
  source: string;
  sourceUrl: string | null;
  status: 'new' | 'invited' | 'reminded' | 'registered' | 'declined' | 'bounced';
  invitedCount: number;
  lastInvitedAt: string | null;
  rating: number | null;
  reviewCount: number | null;
}

export interface ScrapedAgent {
  agencyName: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  source: string;
  sourceUrl: string | null;
  rating: number | null;
}

export interface AgentFinderResult {
  registered: RegisteredAgent[];
  prospective: ProspectiveAgent[];
  scraped: ScrapedAgent[];
  total: number;
}

export interface FindAgentsOptions {
  maxRegistered?: number; // default 10
  maxProspective?: number; // default 20
  includeExternal?: boolean; // default false
  includeDeclined?: boolean; // default false (skip 'declined' and 'bounced')
  countryCode?: string; // 'GB' | 'DE', default 'GB'
}

// ────────────────────────────────────────────────────────────────────────────
// Postcode Parsing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extract postcode prefix from a full postcode.
 * Supports UK and German postal codes.
 * Examples (GB):
 *   "SW1A 1AA" → "SW1A"
 *   "E3 2PQ" → "E3"
 *   "M1 1AD" → "M1"
 *   "B33 8TH" → "B33"
 * Examples (DE):
 *   "10115" → "10"
 *   "80331" → "80"
 */
function extractPostcodePrefix(postcode: string, countryCode: string = 'GB'): string {
  // Remove spaces and convert to uppercase
  const normalized = postcode.replace(/\s+/g, '').toUpperCase();

  if (countryCode === 'DE') {
    // German: use first 2 digits
    return normalized.slice(0, 2);
  }

  // UK: extract outward code (all but last 3 characters)
  if (normalized.length <= 3) return normalized;
  return normalized.slice(0, -3);
}

/**
 * Check if two postcode prefixes match for sourcing purposes.
 * Matches if one prefix starts with the other, or they're equal.
 */
function postcodesPrefixMatch(prefix1: string, prefix2: string): boolean {
  const p1 = prefix1.replace(/\s+/g, '').toUpperCase();
  const p2 = prefix2.replace(/\s+/g, '').toUpperCase();

  // Exact match
  if (p1 === p2) return true;

  // One is prefix of the other (for broader area matches)
  // e.g., "SW" matches "SW1A"
  if (p1.startsWith(p2) || p2.startsWith(p1)) return true;

  return false;
}

// ────────────────────────────────────────────────────────────────────────────
// Strategy 1: Registered Agents
// ────────────────────────────────────────────────────────────────────────────

async function findRegisteredAgents(
  postcodePrefix: string,
  maxResults: number,
  supabase: ReturnType<typeof createServiceClient>
): Promise<RegisteredAgent[]> {
  try {
    const { data, error } = await (supabase
      .from('agent_profiles')
      .select('user_id, agency_name, coverage_areas, verified_at, subscription_tier')
      .eq('focus', 'both') // or could be 'sale' or 'rent'
      .is('coverage_areas', null === false)
      .limit(maxResults)) as any;

    if (error) {
      console.error('[AgentFinder] Error fetching registered agents:', error);
      return [];
    }

    if (!data) return [];

    // Filter agents by coverage area postcode match
    const matching = (data as any[])
      .filter((agent) => {
        const coverage = agent.coverage_areas as any;
        if (!Array.isArray(coverage)) return false;

        return coverage.some((area: any) => {
          const prefixes = area.postcode_prefixes as string[];
          if (!Array.isArray(prefixes)) return false;

          return prefixes.some((p) => postcodesPrefixMatch(p, postcodePrefix));
        });
      })
      .map((agent) => ({
        userId: agent.user_id,
        agencyName: agent.agency_name || 'Unknown Agency',
        email: '', // Would need to join users table
        fullName: null,
        verified: !!agent.verified_at,
        subscriptionTier: agent.subscription_tier as 'free' | 'pro' | 'enterprise',
        coverageAreas: extractCoveragePostcodes(agent.coverage_areas),
      }));

    return matching;
  } catch (err) {
    console.error('[AgentFinder] Exception in findRegisteredAgents:', err);
    return [];
  }
}

/**
 * Extract postcode prefixes from coverage_areas JSONB
 */
function extractCoveragePostcodes(coverageAreas: unknown): string[] {
  const prefixes: string[] = [];

  if (Array.isArray(coverageAreas)) {
    coverageAreas.forEach((area: any) => {
      if (area.postcode_prefixes && Array.isArray(area.postcode_prefixes)) {
        prefixes.push(...area.postcode_prefixes);
      }
    });
  }

  return prefixes;
}

// ────────────────────────────────────────────────────────────────────────────
// Strategy 2: Prospective Agents
// ────────────────────────────────────────────────────────────────────────────

async function findProspectiveAgents(
  postcodePrefix: string,
  maxResults: number,
  includeDeclined: boolean,
  supabase: ReturnType<typeof createServiceClient>
): Promise<ProspectiveAgent[]> {
  try {
    let query = (supabase
      .from('prospective_agents')
      .select(
        'id, agency_name, agent_name, email, postcode, postcode_prefix, source, source_url, status, invited_count, last_invited_at, rating, review_count'
      )
      .eq('postcode_prefix', postcodePrefix)) as any;

    // Filter by status unless includeDeclined is true
    if (!includeDeclined) {
      query = query.in('status', ['new', 'invited', 'reminded']);
    }

    const { data, error } = await query.limit(maxResults);

    if (error) {
      console.error('[AgentFinder] Error fetching prospective agents:', error);
      return [];
    }

    if (!data) return [];

    return (data as any[]).map((agent) => ({
      id: agent.id,
      agencyName: agent.agency_name,
      agentName: agent.agent_name || null,
      email: agent.email || null,
      postcode: agent.postcode || null,
      postcodePrefix: agent.postcode_prefix || null,
      source: agent.source,
      sourceUrl: agent.source_url || null,
      status: agent.status as ProspectiveAgent['status'],
      invitedCount: agent.invited_count,
      lastInvitedAt: agent.last_invited_at || null,
      rating: agent.rating || null,
      reviewCount: agent.review_count || null,
    }));
  } catch (err) {
    console.error('[AgentFinder] Exception in findProspectiveAgents:', err);
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Strategy 3: External Sources (Google Places, etc.)
// ────────────────────────────────────────────────────────────────────────────

async function findScrapedAgents(
  postcode: string,
  _options?: FindAgentsOptions
): Promise<ScrapedAgent[]> {
  // TODO: Requires GOOGLE_PLACES_API_KEY env var
  // TODO: Implement Google Places API search for estate agents near {postcode}
  // const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  // if (!apiKey) {
  //   console.warn('[AgentFinder] GOOGLE_PLACES_API_KEY not configured');
  //   return [];
  // }
  // const results = await searchGooglePlaces(postcode, apiKey);
  // return results.map(r => ({ ... }));

  console.info('[AgentFinder] External scrapers not yet implemented');
  return [];
}

// ────────────────────────────────────────────────────────────────────────────
// Main API
// ────────────────────────────────────────────────────────────────────────────

/**
 * Find agents available for a given postcode.
 *
 * @param postcode Postcode (e.g., "SW1A 1AA" for GB, "10115" for DE)
 * @param options.maxRegistered - max verified agents to return (default 10)
 * @param options.maxProspective - max sourced agents to return (default 20)
 * @param options.includeExternal - search external sources (default false)
 * @param options.includeDeclined - include declined/bounced agents (default false)
 * @param options.countryCode - 'GB' or 'DE' (default 'GB')
 *
 * @returns AgentFinderResult with all matching agents categorized
 */
export async function findAgentsForPostcode(
  postcode: string,
  options: FindAgentsOptions = {}
): Promise<AgentFinderResult> {
  const {
    maxRegistered = 10,
    maxProspective = 20,
    includeExternal = false,
    includeDeclined = false,
    countryCode = 'GB',
  } = options;

  // Normalize postcode
  const normalized = postcode.replace(/\s+/g, '').toUpperCase();
  const postcodePrefix = extractPostcodePrefix(normalized, countryCode);

  // Initialize Supabase client
  const supabase = createServiceClient();

  // Run all strategies in parallel
  const [registered, prospective, scraped] = await Promise.all([
    findRegisteredAgents(postcodePrefix, maxRegistered, supabase),
    findProspectiveAgents(postcodePrefix, maxProspective, includeDeclined, supabase),
    includeExternal ? findScrapedAgents(normalized, options) : Promise.resolve([]),
  ]);

  return {
    registered,
    prospective,
    scraped,
    total: registered.length + prospective.length + scraped.length,
  };
}

/**
 * Get all prospective agents for a postcode (used for bulk outreach campaigns).
 *
 * @param postcode - Postcode (e.g., "SW1A 1AA" for GB, "10115" for DE)
 * @param status - Filter by status (optional)
 * @param countryCode - 'GB' or 'DE' (default 'GB')
 */
export async function getProspectiveAgentsForPostcode(
  postcode: string,
  status?: ProspectiveAgent['status'][],
  countryCode: string = 'GB'
): Promise<ProspectiveAgent[]> {
  const postcodePrefix = extractPostcodePrefix(postcode, countryCode);
  const supabase = createServiceClient();

  try {
    let query = supabase
      .from('prospective_agents')
      .select('*')
      .eq('postcode_prefix', postcodePrefix);

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AgentFinder] Error in getProspectiveAgentsForPostcode:', error);
      return [];
    }

    return (data || []).map((agent: any) => ({
      id: agent.id,
      agencyName: agent.agency_name,
      agentName: agent.agent_name || null,
      email: agent.email || null,
      postcode: agent.postcode || null,
      postcodePrefix: agent.postcode_prefix || null,
      source: agent.source,
      sourceUrl: agent.source_url || null,
      status: agent.status,
      invitedCount: agent.invited_count,
      lastInvitedAt: agent.last_invited_at || null,
      rating: agent.rating || null,
      reviewCount: agent.review_count || null,
    }));
  } catch (err) {
    console.error('[AgentFinder] Exception in getProspectiveAgentsForPostcode:', err);
    return [];
  }
}

/**
 * Mark a prospective agent as invited and update status.
 */
export async function markAgentInvited(
  prospectiveAgentId: string,
  listingId?: string,
  channel: 'email' | 'sms' | 'whatsapp' = 'email',
  template: string = 'cold_outreach'
): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    // Update prospective_agents
    const { error: updateError } = await (supabase as any)
      .from('prospective_agents')
      .update({
        status: 'invited',
        invited_at: new Date().toISOString(),
        last_invited_at: new Date().toISOString(),
      })
      .eq('id', prospectiveAgentId);

    if (updateError) {
      console.error('[AgentFinder] Error updating agent status:', updateError);
      return false;
    }

    // Log the invite
    const { error: logError } = await (supabase.from('agent_invite_log').insert({
      prospective_agent_id: prospectiveAgentId,
      listing_id: listingId || null,
      channel,
      template,
      sent_at: new Date().toISOString(),
    } as any)) as any;

    if (logError) {
      console.error('[AgentFinder] Error logging invite:', logError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[AgentFinder] Exception in markAgentInvited:', err);
    return false;
  }
}

export default findAgentsForPostcode;
