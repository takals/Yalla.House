/**
 * UK Estate Agency Seed Data
 *
 * Bootstrap dataset of UK estate agency chains for initial outreach.
 * Used to populate prospective_agents table for launch postcodes.
 *
 * Includes major national chains, regional specialists, and online-first players.
 * Data sourced from NAEA/TPO records and public websites.
 */

import type { AgentSeed } from '../agent-seed-data';

export const GB_AGENT_SEEDS: AgentSeed[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // LONDON (premium & dominant)
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Foxtons',
    postal_code_prefixes: ['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC', 'E1', 'E2', 'E3'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.foxtons.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Marsh & Parsons',
    postal_code_prefixes: ['W', 'SW', 'W1', 'W2', 'SW1', 'SW3', 'SW5', 'SW7'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.marshandparsons.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Dexters',
    postal_code_prefixes: ['W', 'SW', 'N', 'E', 'SE', 'W1', 'W2', 'SW1', 'SE1', 'N1'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.dexters.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Felicity J Lord',
    postal_code_prefixes: ['E', 'N', 'NW', 'EC', 'E1', 'E2', 'N1', 'NW1'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.felicityj.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Stirling Ackroyd',
    postal_code_prefixes: ['E', 'N', 'EC', 'E1', 'E2', 'N1'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.stirlingackroyd.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Barnard Marcus',
    postal_code_prefixes: ['E', 'N', 'SE', 'W', 'SW', 'NW'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.barnardmarcus.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Chesterton International',
    postal_code_prefixes: ['W', 'SW', 'N', 'NW'],
    city: 'London',
    specialties: ['residential', 'commercial'],
    website: 'https://www.chesterton.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Jackson-Stops',
    postal_code_prefixes: ['W', 'SW', 'SE', 'N', 'NW'],
    city: 'London',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.jackson-stops.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Ludlow Thompson',
    postal_code_prefixes: ['N', 'NW', 'E', 'EC'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.ludlowthompson.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Winkworth',
    postal_code_prefixes: ['W', 'SW', 'SE', 'N'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.winkworth.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NATIONAL PREMIUM CHAINS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Savills',
    postal_code_prefixes: ['SW', 'W', 'SE', 'N', 'M', 'B', 'KT', 'TW', 'RH'],
    city: 'London',
    specialties: ['residential', 'commercial', 'country', 'new_homes'],
    website: 'https://www.savills.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Knight Frank',
    postal_code_prefixes: ['SW', 'W', 'SE', 'N', 'M', 'B', 'LS', 'CV', 'CH'],
    city: 'London',
    specialties: ['residential', 'commercial', 'country', 'development'],
    website: 'https://www.knightfrank.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Hamptons International',
    postal_code_prefixes: ['W', 'SW', 'SE', 'N', 'KT', 'TW', 'RH', 'GU'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.hamptons.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Cbre',
    postal_code_prefixes: ['W', 'E', 'EC', 'M', 'B', 'LS'],
    city: 'London',
    specialties: ['commercial', 'residential', 'industrial'],
    website: 'https://www.cbre.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'JLL',
    postal_code_prefixes: ['W', 'E', 'EC', 'M', 'B'],
    city: 'London',
    specialties: ['commercial', 'industrial', 'investment'],
    website: 'https://www.jll.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // NATIONAL CHAINS (mid-market, traditional)
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Connells',
    postal_code_prefixes: ['SW', 'N', 'M', 'B', 'LS', 'CV', 'CH', 'DN', 'S', 'BB'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.connells.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Bairstow Eves',
    postal_code_prefixes: ['M', 'LS', 'HD', 'OL', 'S', 'DN', 'DE'],
    city: 'Leeds',
    specialties: ['residential', 'lettings'],
    website: 'https://www.bairstoweves.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Countrywide',
    postal_code_prefixes: ['SW', 'W', 'E', 'M', 'B', 'LS', 'CV', 'CH', 'CF', 'BA'],
    city: 'London',
    specialties: ['residential', 'lettings', 'commercial'],
    website: 'https://www.countrywide.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Sequence',
    postal_code_prefixes: ['B', 'DY', 'WS', 'CV', 'LE', 'NG', 'DE'],
    city: 'Birmingham',
    specialties: ['residential', 'lettings'],
    website: 'https://www.sequence.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Fine & Country',
    postal_code_prefixes: ['SW', 'W', 'SE', 'KT', 'GU', 'RH', 'TW'],
    city: 'London',
    specialties: ['residential', 'country'],
    website: 'https://www.fineandcountry.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Allsop',
    postal_code_prefixes: ['W', 'E', 'EC', 'M', 'B', 'LS'],
    city: 'London',
    specialties: ['commercial', 'investment', 'residential'],
    website: 'https://www.allsop.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // ONLINE-FIRST & DISCOUNT BROKERS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Purplebricks',
    postal_code_prefixes: ['W', 'SW', 'E', 'N', 'SE', 'M', 'B', 'LS', 'CV', 'CH'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.purplebricks.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Yopa',
    postal_code_prefixes: ['W', 'SW', 'E', 'N', 'SE', 'M', 'B', 'LS', 'CV'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.yopa.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'eMoov',
    postal_code_prefixes: ['W', 'SW', 'E', 'N', 'SE', 'M', 'LS', 'CV', 'CH'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.emoov.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Zopla',
    postal_code_prefixes: ['W', 'SW', 'E', 'N', 'SE', 'M', 'LS', 'B', 'CV'],
    city: 'London',
    specialties: ['residential'],
    website: 'https://www.zopla.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // MANCHESTER & GREATER MANCHESTER
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Fine & City',
    postal_code_prefixes: ['M', 'OL', 'BL', 'SK'],
    city: 'Manchester',
    specialties: ['residential', 'lettings'],
    website: 'https://www.fineandcity.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Wayfinders',
    postal_code_prefixes: ['M', 'OL', 'BL'],
    city: 'Manchester',
    specialties: ['residential', 'lettings'],
    website: 'https://www.wayfinders.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Property Shop',
    postal_code_prefixes: ['M', 'OL', 'BL', 'SK'],
    city: 'Manchester',
    specialties: ['residential', 'lettings'],
    website: 'https://www.propertyshop.com',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // LEEDS & YORKSHIRE
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Croft',
    postal_code_prefixes: ['LS', 'HD', 'WF', 'BD', 'DN'],
    city: 'Leeds',
    specialties: ['residential', 'lettings'],
    website: 'https://www.croftonline.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Linley & Simpson',
    postal_code_prefixes: ['LS', 'HD', 'WF', 'BD'],
    city: 'Leeds',
    specialties: ['residential', 'lettings'],
    website: 'https://www.linleyandsimpson.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BIRMINGHAM & MIDLANDS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Entwisle Green',
    postal_code_prefixes: ['B', 'DY', 'WS', 'CV', 'LE', 'NG'],
    city: 'Birmingham',
    specialties: ['residential', 'lettings'],
    website: 'https://www.entwislegreen.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Wiggle Property',
    postal_code_prefixes: ['B', 'CV', 'DY', 'WS'],
    city: 'Birmingham',
    specialties: ['residential', 'lettings'],
    website: 'https://www.wiggleproperty.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BRISTOL & SOUTH WEST
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Aston Bristol',
    postal_code_prefixes: ['BS', 'BA', 'GL', 'EX', 'TQ'],
    city: 'Bristol',
    specialties: ['residential', 'lettings'],
    website: 'https://www.astonbristol.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'David Toney & Co',
    postal_code_prefixes: ['BA', 'BS', 'GL'],
    city: 'Bath',
    specialties: ['residential'],
    website: 'https://www.davidtoney.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SCOTLAND
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Savills Scotland',
    postal_code_prefixes: ['EH', 'G', 'AB', 'DD', 'PH', 'IV'],
    city: 'Edinburgh',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.savills.co.uk/scotland',
    source: 'seed_gb',
  },
  {
    agency_name: 'Edinburgh Solicitors Property Centre',
    postal_code_prefixes: ['EH'],
    city: 'Edinburgh',
    specialties: ['residential'],
    website: 'https://www.espc.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Clyde Property',
    postal_code_prefixes: ['G', 'PA'],
    city: 'Glasgow',
    specialties: ['residential', 'lettings'],
    website: 'https://www.clydeproperty.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Kennedy Reeves',
    postal_code_prefixes: ['EH', 'G', 'AB'],
    city: 'Edinburgh',
    specialties: ['residential', 'commercial'],
    website: 'https://www.kennedyreeves.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // WALES
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Savills Cardiff',
    postal_code_prefixes: ['CF', 'SA', 'NP', 'LD', 'SY'],
    city: 'Cardiff',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.savills.co.uk/wales',
    source: 'seed_gb',
  },
  {
    agency_name: 'Dawson & Co',
    postal_code_prefixes: ['CF', 'SA', 'NP'],
    city: 'Cardiff',
    specialties: ['residential', 'lettings'],
    website: 'https://www.dawson-property.com',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SOUTH COAST
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Beachlands Realty',
    postal_code_prefixes: ['BH', 'DT', 'PO'],
    city: 'Bournemouth',
    specialties: ['residential', 'lettings'],
    website: 'https://www.beachlandsrealty.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Charters Estate Agents',
    postal_code_prefixes: ['GU', 'RG', 'PO', 'SO'],
    city: 'Aldershot',
    specialties: ['residential', 'lettings'],
    website: 'https://www.chartersestateagents.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Arun & Worthing Estate Agents',
    postal_code_prefixes: ['BN', 'PO', 'SO', 'RH'],
    city: 'Worthing',
    specialties: ['residential', 'lettings'],
    website: 'https://www.awe-online.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // EAST ANGLIA
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Cheffins',
    postal_code_prefixes: ['CB', 'PE', 'NR', 'IP'],
    city: 'Cambridge',
    specialties: ['residential', 'commercial', 'country'],
    website: 'https://www.cheffins.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Aldreds Norwich',
    postal_code_prefixes: ['NR', 'PE', 'IP'],
    city: 'Norwich',
    specialties: ['residential', 'lettings'],
    website: 'https://www.aldreds.co.uk',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // CORPORATE / RELOCATION SPECIALIST
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Pickfords',
    postal_code_prefixes: ['W', 'E', 'M', 'B', 'LS', 'G'],
    city: 'London',
    specialties: ['residential', 'relocation'],
    website: 'https://www.pickfords.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Relocate Global',
    postal_code_prefixes: ['W', 'E', 'M', 'B', 'LS'],
    city: 'London',
    specialties: ['residential', 'relocation'],
    website: 'https://www.relocateglobal.com',
    source: 'seed_gb',
  },

  // ────────────────────────────────────────────────────────────────────────────
  // VOLUME INDEPENDENT / SMALL CHAINS
  // ────────────────────────────────────────────────────────────────────────────

  {
    agency_name: 'Your Move / Reeds Rains',
    postal_code_prefixes: ['W', 'E', 'SE', 'N', 'M', 'B', 'LS', 'CV', 'CH'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.yourmove.co.uk',
    source: 'seed_gb',
  },
  {
    agency_name: 'Hunters',
    postal_code_prefixes: ['W', 'E', 'SE', 'N', 'M', 'LS'],
    city: 'London',
    specialties: ['residential', 'lettings'],
    website: 'https://www.hunters.com',
    source: 'seed_gb',
  },
  {
    agency_name: 'Fox & Sons',
    postal_code_prefixes: ['E', 'CM', 'CO', 'CB'],
    city: 'Essex',
    specialties: ['residential', 'lettings'],
    website: 'https://www.foxandsons.co.uk',
    source: 'seed_gb',
  },
];
