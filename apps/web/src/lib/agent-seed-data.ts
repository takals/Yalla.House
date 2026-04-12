/**
 * Agent Seed Data - Orchestrator
 *
 * Central hub for all country-keyed estate agency seed datasets.
 * Provides unified interface for querying agents by country and postal code.
 */

import { GB_AGENT_SEEDS } from './seeds/gb';
import { DE_AGENT_SEEDS } from './seeds/de';

// ────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────────────────────────────────

export interface AgentSeed {
  agency_name: string;
  postal_code_prefixes: string[];
  city: string;
  specialties: string[];
  website?: string;
  source: string;
}

// Country code type guard
export type CountryCode = 'GB' | 'DE';

const VALID_COUNTRY_CODES = new Set<CountryCode>(['GB', 'DE']);

export function isValidCountryCode(code: unknown): code is CountryCode {
  return typeof code === 'string' && VALID_COUNTRY_CODES.has(code as CountryCode);
}

// ────────────────────────────────────────────────────────────────────────────
// Seed Data Registry
// ────────────────────────────────────────────────────────────────────────────

export const ALL_SEEDS: Record<CountryCode, AgentSeed[]> = {
  GB: GB_AGENT_SEEDS,
  DE: DE_AGENT_SEEDS,
};

// Country-specific prefix extraction lengths
const POSTAL_CODE_PREFIX_LENGTHS: Record<CountryCode, number> = {
  GB: 3, // UK: extract up to 3 chars before inward code (e.g., "SW1" from "SW1A 1AA")
  DE: 2, // Germany: use first 2 digits of PLZ (e.g., "10" from "10115")
};

// ────────────────────────────────────────────────────────────────────────────
// Core Functions
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extract postal code prefix based on country.
 *
 * @param postalCode - Full postal code (e.g., "SW1A 1AA" or "10115")
 * @param countryCode - Country code: 'GB' or 'DE'
 * @returns Postal code prefix for matching
 */
export function extractPostalCodePrefix(postalCode: string, countryCode: CountryCode): string {
  // Normalize: remove spaces, uppercase
  const normalized = postalCode.replace(/\s+/g, '').toUpperCase();

  if (countryCode === 'GB') {
    // UK: Extract outward code (all but last 3 characters)
    if (normalized.length <= 3) return normalized;
    return normalized.slice(0, -3);
  }

  if (countryCode === 'DE') {
    // Germany: Use first 2 digits (PLZ prefix)
    // German postcodes are always 5 digits, but we use first 2 for regional matching
    return normalized.slice(0, POSTAL_CODE_PREFIX_LENGTHS.DE);
  }

  // Fallback
  return normalized;
}

/**
 * Check if a postal code prefix matches a seed prefix.
 * Matches if one prefix starts with the other, or they're equal.
 */
function prefixMatches(seedPrefix: string, userPrefix: string): boolean {
  const normalizedSeed = seedPrefix.replace(/\s+/g, '').toUpperCase();
  const normalizedUser = userPrefix.replace(/\s+/g, '').toUpperCase();

  // Exact match
  if (normalizedSeed === normalizedUser) return true;

  // One is prefix of the other (for broader area matches)
  // e.g., "SW" matches "SW1"
  if (normalizedSeed.startsWith(normalizedUser) || normalizedUser.startsWith(normalizedSeed)) {
    return true;
  }

  return false;
}

/**
 * Get all agents for a specific country.
 *
 * @param countryCode - 'GB' or 'DE'
 * @returns Array of AgentSeed entries for that country
 */
export function getAgentSeedsByCountry(countryCode: CountryCode): AgentSeed[] {
  if (!isValidCountryCode(countryCode)) {
    console.warn(`[AgentSeedData] Invalid country code: ${countryCode}`);
    return [];
  }

  return ALL_SEEDS[countryCode] || [];
}

/**
 * Get agents matching a postal code for a specific country.
 *
 * @param postalCode - Full postal code (e.g., "SW1A 1AA", "10115")
 * @param countryCode - 'GB' or 'DE'
 * @returns Matching AgentSeed entries
 */
export function getAgentSeedsForPostalCode(
  postalCode: string,
  countryCode: CountryCode
): AgentSeed[] {
  if (!isValidCountryCode(countryCode)) {
    console.warn(`[AgentSeedData] Invalid country code: ${countryCode}`);
    return [];
  }

  const seeds = ALL_SEEDS[countryCode];
  if (!seeds) return [];

  const userPrefix = extractPostalCodePrefix(postalCode, countryCode);

  return seeds.filter((agent) =>
    agent.postal_code_prefixes.some((seedPrefix) => prefixMatches(seedPrefix, userPrefix))
  );
}

/**
 * Get agents by specialty for a specific country.
 *
 * @param specialty - e.g., 'residential', 'commercial', 'lettings'
 * @param countryCode - 'GB' or 'DE'
 * @returns Matching AgentSeed entries
 */
export function getAgentSeedsBySpecialty(
  specialty: string,
  countryCode: CountryCode
): AgentSeed[] {
  if (!isValidCountryCode(countryCode)) {
    console.warn(`[AgentSeedData] Invalid country code: ${countryCode}`);
    return [];
  }

  const seeds = ALL_SEEDS[countryCode];
  if (!seeds) return [];

  return seeds.filter((agent) => agent.specialties.includes(specialty));
}

// ────────────────────────────────────────────────────────────────────────────
// Convenience Exports (backward compatibility)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get all UK seeds (convenience function for existing code).
 */
export function getUKAgentSeeds(): AgentSeed[] {
  return getAgentSeedsByCountry('GB');
}

/**
 * Get all German seeds (convenience function).
 */
export function getGermanAgentSeeds(): AgentSeed[] {
  return getAgentSeedsByCountry('DE');
}

export default ALL_SEEDS;
