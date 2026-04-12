/**
 * German Estate Agency Seed Data
 *
 * Bootstrap dataset of German estate agency chains and independent agencies
 * for initial outreach. Used to populate prospective_agents table for German markets.
 *
 * Includes national chains, major city specialists, and PropTech platforms.
 * Data sourced from public property websites and industry databases.
 */

import type { AgentSeed } from '../agent-seed-data';

export const DE_AGENT_SEEDS: AgentSeed[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // NATIONAL PREMIUM CHAINS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Engel & Völkers',
    postal_code_prefixes: ['10', '20', '40', '50', '60', '70', '80', '90'],
    city: 'Nationwide',
    specialties: ['residential', 'commercial', 'luxury'],
    website: 'https://www.engelvoelkers.com/de',
    source: 'seed_de',
  },
  {
    agency_name: 'VON POLL IMMOBILIEN',
    postal_code_prefixes: ['10', '20', '30', '40', '50', '60', '70', '80'],
    city: 'Nationwide',
    specialties: ['residential', 'commercial', 'investment'],
    website: 'https://www.vonpoll.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler',
    postal_code_prefixes: ['10', '20', '40', '50', '60', '70', '80', '81', '85'],
    city: 'Nationwide',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.dahler.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Savills Germany',
    postal_code_prefixes: ['10', '20', '30', '50', '60', '70', '80', '81'],
    city: 'Nationwide',
    specialties: ['commercial', 'residential', 'investment'],
    website: 'https://www.savills.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // PROPTECH & ONLINE PLATFORMS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'McMakler',
    postal_code_prefixes: ['10', '20', '40', '50', '60', '70', '80'],
    city: 'Nationwide',
    specialties: ['residential', 'online', 'discount'],
    website: 'https://www.mcmakler.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Homeday',
    postal_code_prefixes: ['10', '20', '30', '40', '50', '60', '70', '80'],
    city: 'Nationwide',
    specialties: ['residential', 'online', 'discount'],
    website: 'https://www.homeday.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Maklaro',
    postal_code_prefixes: ['10', '20', '40', '50', '60', '70', '80'],
    city: 'Nationwide',
    specialties: ['residential', 'online'],
    website: 'https://www.maklaro.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BERLIN
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Zabel Properties',
    postal_code_prefixes: ['10', '12', '13', '14', '15', '16', '17', '18', '19'],
    city: 'Berlin',
    specialties: ['residential', 'commercial', 'development'],
    website: 'https://www.zabel-properties.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Ricarda Huch Immobilien',
    postal_code_prefixes: ['10', '12', '13', '14'],
    city: 'Berlin',
    specialties: ['residential', 'investment'],
    website: 'https://www.ricarda-huch-immobilien.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Guthmann Immobilien',
    postal_code_prefixes: ['10', '11', '12', '13'],
    city: 'Berlin',
    specialties: ['residential', 'commercial'],
    website: 'https://www.guthmann-immobilien.de',
    source: 'seed_de',
  },
  {
    agency_name: 'BEST PLACE Immobilien',
    postal_code_prefixes: ['10', '12', '14', '15'],
    city: 'Berlin',
    specialties: ['residential', 'lettings'],
    website: 'https://www.bestplace-immobilien.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MUNICH (Bayern)
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Mr. Lodge',
    postal_code_prefixes: ['80', '81', '82', '83', '84', '85'],
    city: 'Munich',
    specialties: ['residential', 'lettings', 'luxury'],
    website: 'https://www.mrlodge.de',
    source: 'seed_de',
  },
  {
    agency_name: 'HELLER Immobilien',
    postal_code_prefixes: ['80', '81', '82', '85'],
    city: 'Munich',
    specialties: ['residential', 'commercial', 'investment'],
    website: 'https://www.heller-immobilien.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Engel & Völkers München',
    postal_code_prefixes: ['80', '81', '82', '83', '85'],
    city: 'Munich',
    specialties: ['residential', 'luxury', 'commercial'],
    website: 'https://www.engelvoelkers.com/de/muenchen',
    source: 'seed_de',
  },
  {
    agency_name: 'Aigner Immobilien',
    postal_code_prefixes: ['80', '81', '82', '84'],
    city: 'Munich',
    specialties: ['residential', 'commercial'],
    website: 'https://www.aigner.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // HAMBURG
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Grossmann & Berger',
    postal_code_prefixes: ['20', '21', '22', '23', '24', '25'],
    city: 'Hamburg',
    specialties: ['residential', 'commercial'],
    website: 'https://www.grossmannberger.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Hamburg',
    postal_code_prefixes: ['20', '21', '22', '23'],
    city: 'Hamburg',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.dahler-hamburg.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Engel & Völkers Hamburg',
    postal_code_prefixes: ['20', '21', '22', '24'],
    city: 'Hamburg',
    specialties: ['residential', 'commercial', 'luxury'],
    website: 'https://www.engelvoelkers.com/de/hamburg',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // FRANKFURT AM MAIN
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Savills Frankfurt',
    postal_code_prefixes: ['60', '61', '63', '65', '69'],
    city: 'Frankfurt',
    specialties: ['commercial', 'residential', 'investment'],
    website: 'https://www.savills.de/frankfurt',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Frankfurt',
    postal_code_prefixes: ['60', '61', '63'],
    city: 'Frankfurt',
    specialties: ['residential', 'commercial'],
    website: 'https://www.dahler-frankfurt.de',
    source: 'seed_de',
  },
  {
    agency_name: 'Colliers Frankfurt',
    postal_code_prefixes: ['60', '61', '65'],
    city: 'Frankfurt',
    specialties: ['commercial', 'investment'],
    website: 'https://www.colliers.com/de-de/markets/frankfurt',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // COLOGNE (Köln)
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'VON POLL Köln',
    postal_code_prefixes: ['50', '51', '53', '54'],
    city: 'Cologne',
    specialties: ['residential', 'commercial'],
    website: 'https://www.vonpoll.de/koeln',
    source: 'seed_de',
  },
  {
    agency_name: 'Engel & Völkers Köln',
    postal_code_prefixes: ['50', '51', '53'],
    city: 'Cologne',
    specialties: ['residential', 'luxury', 'commercial'],
    website: 'https://www.engelvoelkers.com/de/koeln',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Köln',
    postal_code_prefixes: ['50', '51', '53'],
    city: 'Cologne',
    specialties: ['residential', 'commercial'],
    website: 'https://www.dahler-koeln.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // DÜSSELDORF
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Engel & Völkers Düsseldorf',
    postal_code_prefixes: ['40', '41', '42', '47'],
    city: 'Düsseldorf',
    specialties: ['residential', 'commercial', 'luxury'],
    website: 'https://www.engelvoelkers.com/de/duesseldorf',
    source: 'seed_de',
  },
  {
    agency_name: 'VON POLL Düsseldorf',
    postal_code_prefixes: ['40', '41', '42'],
    city: 'Düsseldorf',
    specialties: ['residential', 'commercial'],
    website: 'https://www.vonpoll.de/duesseldorf',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Düsseldorf',
    postal_code_prefixes: ['40', '41', '42'],
    city: 'Düsseldorf',
    specialties: ['residential', 'commercial'],
    website: 'https://www.dahler-duesseldorf.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // STUTTGART
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Engel & Völkers Stuttgart',
    postal_code_prefixes: ['70', '71', '73', '74', '75'],
    city: 'Stuttgart',
    specialties: ['residential', 'commercial', 'luxury'],
    website: 'https://www.engelvoelkers.com/de/stuttgart',
    source: 'seed_de',
  },
  {
    agency_name: 'VON POLL Stuttgart',
    postal_code_prefixes: ['70', '71', '73'],
    city: 'Stuttgart',
    specialties: ['residential', 'commercial'],
    website: 'https://www.vonpoll.de/stuttgart',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Stuttgart',
    postal_code_prefixes: ['70', '71', '73'],
    city: 'Stuttgart',
    specialties: ['residential', 'commercial'],
    website: 'https://www.dahler-stuttgart.de',
    source: 'seed_de',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ADDITIONAL MAJOR CITIES & REGIONS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Engel & Völkers Hannover',
    postal_code_prefixes: ['30', '31', '32', '33'],
    city: 'Hanover',
    specialties: ['residential', 'commercial'],
    website: 'https://www.engelvoelkers.com/de/hannover',
    source: 'seed_de',
  },
  {
    agency_name: 'Dahler Leipzig',
    postal_code_prefixes: ['04', '06', '07'],
    city: 'Leipzig',
    specialties: ['residential', 'commercial'],
    website: 'https://www.dahler-leipzig.de',
    source: 'seed_de',
  },
  {
    agency_name: 'VON POLL Dresden',
    postal_code_prefixes: ['01', '02', '03'],
    city: 'Dresden',
    specialties: ['residential', 'commercial'],
    website: 'https://www.vonpoll.de/dresden',
    source: 'seed_de',
  },
];
