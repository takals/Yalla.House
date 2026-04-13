import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// Temporary seed route — remove after seeding
// POST /api/seed-agents?key=yalla-seed-2026

interface AgentSeed {
  agency_name: string
  city: string
  country_code: string
  postcode_prefixes: string[]
  focus: 'sale' | 'rent' | 'both'
  property_types: string[]
  website?: string
  phone?: string
}

// ── UK AGENTS ──────────────────────────────────────────────
const UK_AGENTS: AgentSeed[] = [
  // LONDON — Major chains
  { agency_name: 'Foxtons Islington', city: 'London', country_code: 'GB', postcode_prefixes: ['N1','N5','N7','EC1'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk', phone: '020 7893 8000' },
  { agency_name: 'Foxtons Canary Wharf', city: 'London', country_code: 'GB', postcode_prefixes: ['E14','E16','SE10','SE16'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Camden', city: 'London', country_code: 'GB', postcode_prefixes: ['NW1','NW3','NW5','N6'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Kensington', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','W14','SW5','SW7'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Notting Hill', city: 'London', country_code: 'GB', postcode_prefixes: ['W11','W2','W10','W9'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Battersea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW11','SW8','SW18'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Fulham', city: 'London', country_code: 'GB', postcode_prefixes: ['SW6','SW10','W6'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },
  { agency_name: 'Foxtons Stratford', city: 'London', country_code: 'GB', postcode_prefixes: ['E15','E20','E3'], focus: 'both', property_types: ['house','flat'], website: 'foxtons.co.uk' },

  { agency_name: 'Savills Chelsea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW10','SW7'], focus: 'both', property_types: ['house','flat','villa'], website: 'savills.co.uk', phone: '020 7578 9000' },
  { agency_name: 'Savills Notting Hill', city: 'London', country_code: 'GB', postcode_prefixes: ['W11','W2','W8','W10'], focus: 'both', property_types: ['house','flat','villa'], website: 'savills.co.uk' },
  { agency_name: 'Savills Islington', city: 'London', country_code: 'GB', postcode_prefixes: ['N1','EC1','N5','N7'], focus: 'both', property_types: ['house','flat'], website: 'savills.co.uk' },
  { agency_name: 'Savills Hampstead', city: 'London', country_code: 'GB', postcode_prefixes: ['NW3','NW6','NW11','N6'], focus: 'both', property_types: ['house','flat','villa'], website: 'savills.co.uk' },
  { agency_name: 'Savills Battersea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW11','SW8','SW4','SW18'], focus: 'sale', property_types: ['house','flat'], website: 'savills.co.uk' },

  { agency_name: 'Knight Frank Chelsea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW10'], focus: 'both', property_types: ['house','flat','villa'], website: 'knightfrank.co.uk', phone: '020 7629 8171' },
  { agency_name: 'Knight Frank Mayfair', city: 'London', country_code: 'GB', postcode_prefixes: ['W1','SW1','W1K','W1J'], focus: 'sale', property_types: ['house','flat','villa'], website: 'knightfrank.co.uk' },
  { agency_name: 'Knight Frank Kensington', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','W14','SW5','SW7'], focus: 'both', property_types: ['house','flat','villa'], website: 'knightfrank.co.uk' },
  { agency_name: 'Knight Frank Hampstead', city: 'London', country_code: 'GB', postcode_prefixes: ['NW3','NW11','N6','NW6'], focus: 'sale', property_types: ['house','flat','villa'], website: 'knightfrank.co.uk' },

  { agency_name: 'Dexters Clapham', city: 'London', country_code: 'GB', postcode_prefixes: ['SW4','SW12','SW2'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk', phone: '020 7924 4900' },
  { agency_name: 'Dexters Fulham', city: 'London', country_code: 'GB', postcode_prefixes: ['SW6','SW10','W6'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk' },
  { agency_name: 'Dexters Battersea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW11','SW8','SW18'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk' },
  { agency_name: 'Dexters Pimlico', city: 'London', country_code: 'GB', postcode_prefixes: ['SW1','SW1V','SW1P'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk' },
  { agency_name: 'Dexters Brixton', city: 'London', country_code: 'GB', postcode_prefixes: ['SW2','SW9','SE5','SE24'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk' },
  { agency_name: 'Dexters Putney', city: 'London', country_code: 'GB', postcode_prefixes: ['SW15','SW18','SW19'], focus: 'both', property_types: ['house','flat'], website: 'dexters.co.uk' },

  { agency_name: 'Hamptons Chelsea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW10'], focus: 'both', property_types: ['house','flat'], website: 'hamptons.co.uk' },
  { agency_name: 'Hamptons Kensington', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','W14','SW5'], focus: 'both', property_types: ['house','flat'], website: 'hamptons.co.uk' },
  { agency_name: 'Hamptons Mayfair', city: 'London', country_code: 'GB', postcode_prefixes: ['W1','W1K','W1J','SW1'], focus: 'sale', property_types: ['house','flat','villa'], website: 'hamptons.co.uk' },

  { agency_name: 'Chestertons Kensington', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','SW7','SW5','W14'], focus: 'both', property_types: ['house','flat'], website: 'chestertons.co.uk', phone: '020 7937 7244' },
  { agency_name: 'Chestertons Notting Hill', city: 'London', country_code: 'GB', postcode_prefixes: ['W11','W2','W10'], focus: 'both', property_types: ['house','flat'], website: 'chestertons.co.uk' },
  { agency_name: 'Chestertons Chelsea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW10'], focus: 'both', property_types: ['house','flat'], website: 'chestertons.co.uk' },
  { agency_name: 'Chestertons Canary Wharf', city: 'London', country_code: 'GB', postcode_prefixes: ['E14','E16','SE10'], focus: 'both', property_types: ['house','flat','commercial'], website: 'chestertons.co.uk' },

  { agency_name: 'Winkworth Camden', city: 'London', country_code: 'GB', postcode_prefixes: ['NW1','NW3','NW5'], focus: 'both', property_types: ['house','flat'], website: 'winkworth.co.uk' },
  { agency_name: 'Winkworth Kentish Town', city: 'London', country_code: 'GB', postcode_prefixes: ['NW5','N19','N7','N6'], focus: 'both', property_types: ['house','flat'], website: 'winkworth.co.uk' },
  { agency_name: 'Winkworth Crystal Palace', city: 'London', country_code: 'GB', postcode_prefixes: ['SE19','SE20','SE26','SE25'], focus: 'both', property_types: ['house','flat'], website: 'winkworth.co.uk' },
  { agency_name: 'Winkworth Shepherds Bush', city: 'London', country_code: 'GB', postcode_prefixes: ['W12','W3','W14','W6'], focus: 'both', property_types: ['house','flat'], website: 'winkworth.co.uk' },

  // LONDON — East
  { agency_name: 'Keatons Bow', city: 'London', country_code: 'GB', postcode_prefixes: ['E3','E14','E1','E2'], focus: 'both', property_types: ['house','flat'], website: 'keatons.com' },
  { agency_name: 'City Fox', city: 'London', country_code: 'GB', postcode_prefixes: ['E1','E2','E3','E14','E15'], focus: 'both', property_types: ['house','flat'], website: 'city-fox.co.uk' },
  { agency_name: 'WJ Meade', city: 'London', country_code: 'GB', postcode_prefixes: ['E3','E2','E14','E15','E1'], focus: 'both', property_types: ['house','flat'], website: 'wjmeade.co.uk' },
  { agency_name: 'Clarke & Lloyds', city: 'London', country_code: 'GB', postcode_prefixes: ['E1','E2','E3','E14','E15'], focus: 'both', property_types: ['house','flat'], website: 'clarkeandlloyds.com' },
  { agency_name: 'Ample Properties', city: 'London', country_code: 'GB', postcode_prefixes: ['E1','E2','E3','E6','E7','E8','E9','E12','E13','E14','E15'], focus: 'rent', property_types: ['house','flat'], website: 'ampleproperties.co.uk' },
  { agency_name: 'Metropolitan & Crown', city: 'London', country_code: 'GB', postcode_prefixes: ['E1','E2','E3','E14','E15','E16'], focus: 'both', property_types: ['house','flat'], website: 'metropolitanandcrown.com' },
  { agency_name: 'Felicity J Lord Canary Wharf', city: 'London', country_code: 'GB', postcode_prefixes: ['E14','E16','SE10','SE16'], focus: 'both', property_types: ['house','flat'], website: 'fjlord.co.uk' },
  { agency_name: 'Bairstow Eves Stratford', city: 'London', country_code: 'GB', postcode_prefixes: ['E15','E20','E6','E7'], focus: 'both', property_types: ['house','flat'], website: 'bairstoweves.co.uk' },

  // LONDON — South East
  { agency_name: 'Kinleigh Folkard & Hayward Greenwich', city: 'London', country_code: 'GB', postcode_prefixes: ['SE10','SE3','SE7','SE18'], focus: 'both', property_types: ['house','flat'], website: 'kfh.co.uk' },
  { agency_name: 'KFH Dulwich', city: 'London', country_code: 'GB', postcode_prefixes: ['SE21','SE22','SE24','SE5'], focus: 'both', property_types: ['house','flat'], website: 'kfh.co.uk' },
  { agency_name: 'KFH Brixton', city: 'London', country_code: 'GB', postcode_prefixes: ['SW2','SW9','SE5','SE24'], focus: 'both', property_types: ['house','flat'], website: 'kfh.co.uk' },
  { agency_name: 'Keating Estates', city: 'London', country_code: 'GB', postcode_prefixes: ['SE1','SE11','SE17','SE15','SE16','SE5'], focus: 'both', property_types: ['house','flat'], website: 'keatingestates.com' },
  { agency_name: 'Acorn Peckham', city: 'London', country_code: 'GB', postcode_prefixes: ['SE15','SE22','SE5','SE14'], focus: 'both', property_types: ['house','flat'], website: 'acorngroup.co.uk' },
  { agency_name: 'Acorn Lewisham', city: 'London', country_code: 'GB', postcode_prefixes: ['SE13','SE12','SE6','SE4'], focus: 'both', property_types: ['house','flat'], website: 'acorngroup.co.uk' },
  { agency_name: 'Robinson Jackson Woolwich', city: 'London', country_code: 'GB', postcode_prefixes: ['SE18','SE28','SE2','DA16'], focus: 'both', property_types: ['house','flat'], website: 'robinsonjackson.com' },
  { agency_name: 'Edwards Estate Agents', city: 'London', country_code: 'GB', postcode_prefixes: ['SE1','SE11','SE17','SW8'], focus: 'both', property_types: ['house','flat'], website: 'edwardsestateagents.com' },

  // LONDON — North
  { agency_name: 'Goldschmidt & Howland Hampstead', city: 'London', country_code: 'GB', postcode_prefixes: ['NW3','NW6','NW11','NW8'], focus: 'both', property_types: ['house','flat'], website: 'g-h.co.uk' },
  { agency_name: 'RHW Estates', city: 'London', country_code: 'GB', postcode_prefixes: ['NW3','NW6','NW8','NW2'], focus: 'both', property_types: ['house','flat'], website: 'rhwestates.co.uk' },
  { agency_name: 'NW6 Property Management', city: 'London', country_code: 'GB', postcode_prefixes: ['NW6','NW2','W9','NW8','NW3','NW10'], focus: 'rent', property_types: ['house','flat'], website: 'nw6pm.co.uk' },
  { agency_name: 'Chancellors Muswell Hill', city: 'London', country_code: 'GB', postcode_prefixes: ['N10','N2','N3','N12'], focus: 'both', property_types: ['house','flat'], website: 'chancellors.co.uk' },
  { agency_name: 'Martyn Gerrard Crouch End', city: 'London', country_code: 'GB', postcode_prefixes: ['N8','N4','N19','N6'], focus: 'both', property_types: ['house','flat'], website: 'martyngerrard.co.uk' },
  { agency_name: 'Martyn Gerrard Finchley', city: 'London', country_code: 'GB', postcode_prefixes: ['N3','N12','N2','NW11'], focus: 'both', property_types: ['house','flat'], website: 'martyngerrard.co.uk' },
  { agency_name: 'Jeremy James & Company', city: 'London', country_code: 'GB', postcode_prefixes: ['N1','N5','N7','EC1'], focus: 'both', property_types: ['house','flat'], website: 'jeremyjames.co.uk' },

  // LONDON — West / Central
  { agency_name: 'Douglas & Gordon Kensington', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','SW7','SW5','W14'], focus: 'both', property_types: ['house','flat'], website: 'douglasandgordon.com' },
  { agency_name: 'Douglas & Gordon Chelsea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW10'], focus: 'both', property_types: ['house','flat'], website: 'douglasandgordon.com' },
  { agency_name: 'Douglas & Gordon Battersea', city: 'London', country_code: 'GB', postcode_prefixes: ['SW11','SW8','SW4'], focus: 'both', property_types: ['house','flat'], website: 'douglasandgordon.com' },
  { agency_name: 'Benham and Reeves Knightsbridge', city: 'London', country_code: 'GB', postcode_prefixes: ['SW1','SW3','SW7','W1'], focus: 'both', property_types: ['house','flat','villa'], website: 'benhams.com' },
  { agency_name: 'Benham and Reeves Hyde Park', city: 'London', country_code: 'GB', postcode_prefixes: ['W2','W1','W11','NW1'], focus: 'rent', property_types: ['house','flat'], website: 'benhams.com' },
  { agency_name: 'Radstock Property', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','SW7','W8','SW10'], focus: 'sale', property_types: ['house','flat','villa'], website: 'radstockproperty.com' },
  { agency_name: 'Rickman Properties', city: 'London', country_code: 'GB', postcode_prefixes: ['W8','W11','SW3','SW7'], focus: 'sale', property_types: ['house','flat','villa'], website: 'rickmanproperties.com' },
  { agency_name: 'Wilfords', city: 'London', country_code: 'GB', postcode_prefixes: ['SW3','SW1','W8','W11','SW7','SW10'], focus: 'both', property_types: ['house','flat'], website: 'wilfords.com' },
  { agency_name: 'Hudsons Property', city: 'London', country_code: 'GB', postcode_prefixes: ['WC1','WC2','W1','EC1'], focus: 'both', property_types: ['flat','house'], website: 'hudsonsproperty.com' },
  { agency_name: 'Eccord', city: 'London', country_code: 'GB', postcode_prefixes: ['SW1','SW3','W1','W8','NW8','NW3'], focus: 'sale', property_types: ['house','flat','villa'], website: 'eccord.com' },
  { agency_name: 'John D Wood Sloane Square', city: 'London', country_code: 'GB', postcode_prefixes: ['SW1','SW3','SW10'], focus: 'both', property_types: ['house','flat'], website: 'johndwood.co.uk' },
  { agency_name: 'John D Wood Richmond', city: 'London', country_code: 'GB', postcode_prefixes: ['TW9','TW10','SW14','SW13'], focus: 'both', property_types: ['house','flat'], website: 'johndwood.co.uk' },
  { agency_name: 'Marsh & Parsons Holland Park', city: 'London', country_code: 'GB', postcode_prefixes: ['W11','W14','W12','W8'], focus: 'both', property_types: ['house','flat'], website: 'marshandparsons.co.uk' },
  { agency_name: 'Marsh & Parsons Brook Green', city: 'London', country_code: 'GB', postcode_prefixes: ['W14','W6','W12','SW6'], focus: 'both', property_types: ['house','flat'], website: 'marshandparsons.co.uk' },

  // MANCHESTER
  { agency_name: 'Reeds Rains Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M2','M3','M4','M15'], focus: 'both', property_types: ['house','flat'], website: 'reedsrains.co.uk' },
  { agency_name: 'Bridgfords Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M2','M3','M4','M14','M20'], focus: 'both', property_types: ['house','flat'], website: 'bridgfords.co.uk' },
  { agency_name: 'Edward Mellor Stockport', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['SK1','SK2','SK3','SK4','SK5','SK6'], focus: 'both', property_types: ['house','flat'], website: 'edwardmellor.co.uk' },
  { agency_name: 'Purplebricks Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M2','M3','M4','M14','M20','M21'], focus: 'sale', property_types: ['house','flat'], website: 'purplebricks.co.uk' },
  { agency_name: 'Jordan Fishwick Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M20','M21','M19','M14','M13'], focus: 'both', property_types: ['house','flat'], website: 'jordanfishwick.co.uk' },
  { agency_name: 'William H Brown Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M3','M4','M15','M16'], focus: 'both', property_types: ['house','flat'], website: 'williamhbrown.co.uk' },
  { agency_name: 'Savills Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M2','M3','M15','M20','SK1'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },
  { agency_name: 'Knight Frank Manchester', city: 'Manchester', country_code: 'GB', postcode_prefixes: ['M1','M2','M3','M15','M20'], focus: 'both', property_types: ['house','flat','commercial'], website: 'knightfrank.co.uk' },

  // BIRMINGHAM
  { agency_name: 'Bairstow Eves Birmingham', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B1','B2','B3','B4','B5','B15','B16'], focus: 'both', property_types: ['house','flat'], website: 'bairstoweves.co.uk' },
  { agency_name: 'Connells Birmingham', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B1','B13','B14','B29','B30'], focus: 'both', property_types: ['house','flat'], website: 'connells.co.uk' },
  { agency_name: 'Savills Birmingham', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B1','B2','B3','B4','B15','B16'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },
  { agency_name: 'Knight Frank Birmingham', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B1','B2','B3','B15','B16'], focus: 'both', property_types: ['house','flat','commercial'], website: 'knightfrank.co.uk' },
  { agency_name: 'Robert Oulsnam', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B17','B29','B30','B31','B32'], focus: 'both', property_types: ['house','flat'], website: 'oulsnam.co.uk' },
  { agency_name: 'Shipways Solihull', city: 'Birmingham', country_code: 'GB', postcode_prefixes: ['B90','B91','B92','B93','B37'], focus: 'both', property_types: ['house','flat'], website: 'shipways.co.uk' },

  // LEEDS
  { agency_name: 'Manning Stainton Leeds', city: 'Leeds', country_code: 'GB', postcode_prefixes: ['LS1','LS2','LS6','LS7','LS8','LS16','LS17'], focus: 'both', property_types: ['house','flat'], website: 'manningstainton.co.uk' },
  { agency_name: 'Dacre Son & Hartley', city: 'Leeds', country_code: 'GB', postcode_prefixes: ['LS1','LS2','LS6','LS7','LS8'], focus: 'both', property_types: ['house','flat'], website: 'dacres.co.uk' },
  { agency_name: 'Linley & Simpson Leeds', city: 'Leeds', country_code: 'GB', postcode_prefixes: ['LS1','LS2','LS3','LS6','LS9'], focus: 'rent', property_types: ['house','flat'], website: 'linleyandsimpson.co.uk' },
  { agency_name: 'Savills Leeds', city: 'Leeds', country_code: 'GB', postcode_prefixes: ['LS1','LS2','LS6','LS7','LS16'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },

  // BRISTOL
  { agency_name: 'Ocean Estate Agents Bristol', city: 'Bristol', country_code: 'GB', postcode_prefixes: ['BS1','BS2','BS3','BS6','BS7','BS8'], focus: 'both', property_types: ['house','flat'], website: 'ocean.co.uk' },
  { agency_name: 'CJ Hole Clifton', city: 'Bristol', country_code: 'GB', postcode_prefixes: ['BS8','BS6','BS9','BS7'], focus: 'both', property_types: ['house','flat'], website: 'cjhole.co.uk' },
  { agency_name: 'Andrews Bristol', city: 'Bristol', country_code: 'GB', postcode_prefixes: ['BS1','BS2','BS3','BS5','BS6'], focus: 'both', property_types: ['house','flat'], website: 'andrewsonline.co.uk' },
  { agency_name: 'Savills Bristol', city: 'Bristol', country_code: 'GB', postcode_prefixes: ['BS1','BS2','BS6','BS8','BS9'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },

  // EDINBURGH
  { agency_name: 'ESPC Edinburgh', city: 'Edinburgh', country_code: 'GB', postcode_prefixes: ['EH1','EH2','EH3','EH4','EH5','EH6','EH7','EH8','EH9','EH10','EH11','EH12'], focus: 'sale', property_types: ['house','flat'], website: 'espc.com' },
  { agency_name: 'Savills Edinburgh', city: 'Edinburgh', country_code: 'GB', postcode_prefixes: ['EH1','EH2','EH3','EH4','EH9','EH10'], focus: 'both', property_types: ['house','flat','villa'], website: 'savills.co.uk' },
  { agency_name: 'Rettie Edinburgh', city: 'Edinburgh', country_code: 'GB', postcode_prefixes: ['EH1','EH2','EH3','EH4','EH9','EH10','EH12'], focus: 'both', property_types: ['house','flat'], website: 'rettie.co.uk' },
  { agency_name: 'Coulters Edinburgh', city: 'Edinburgh', country_code: 'GB', postcode_prefixes: ['EH1','EH3','EH4','EH9','EH10','EH12','EH14'], focus: 'both', property_types: ['house','flat'], website: 'coulters.com' },

  // LIVERPOOL
  { agency_name: 'Reeds Rains Liverpool', city: 'Liverpool', country_code: 'GB', postcode_prefixes: ['L1','L2','L3','L8','L15','L17','L18'], focus: 'both', property_types: ['house','flat'], website: 'reedsrains.co.uk' },
  { agency_name: 'Entwistle Green Liverpool', city: 'Liverpool', country_code: 'GB', postcode_prefixes: ['L1','L2','L3','L4','L5','L6','L7','L8'], focus: 'both', property_types: ['house','flat'], website: 'entwistlegreen.co.uk' },
  { agency_name: 'Savills Liverpool', city: 'Liverpool', country_code: 'GB', postcode_prefixes: ['L1','L2','L3','L17','L18','L25'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },

  // GLASGOW
  { agency_name: 'Savills Glasgow', city: 'Glasgow', country_code: 'GB', postcode_prefixes: ['G1','G2','G3','G4','G11','G12'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },
  { agency_name: 'Rettie Glasgow', city: 'Glasgow', country_code: 'GB', postcode_prefixes: ['G1','G2','G3','G11','G12','G41','G42'], focus: 'both', property_types: ['house','flat'], website: 'rettie.co.uk' },
  { agency_name: 'Slater Hogg & Howison Glasgow', city: 'Glasgow', country_code: 'GB', postcode_prefixes: ['G1','G2','G3','G4','G11','G12','G41'], focus: 'both', property_types: ['house','flat'], website: 'slaterhogg.co.uk' },

  // SHEFFIELD
  { agency_name: 'Redbrik Sheffield', city: 'Sheffield', country_code: 'GB', postcode_prefixes: ['S1','S2','S7','S8','S10','S11','S17'], focus: 'both', property_types: ['house','flat'], website: 'redbrik.co.uk' },
  { agency_name: 'Blundells Sheffield', city: 'Sheffield', country_code: 'GB', postcode_prefixes: ['S1','S2','S3','S5','S6','S7','S8','S10','S11'], focus: 'both', property_types: ['house','flat'], website: 'blundells.co.uk' },
  { agency_name: 'Saxton Mee Sheffield', city: 'Sheffield', country_code: 'GB', postcode_prefixes: ['S1','S7','S10','S11','S17'], focus: 'both', property_types: ['house','flat'], website: 'saxtonmee.co.uk' },

  // NOTTINGHAM
  { agency_name: 'FHP Living Nottingham', city: 'Nottingham', country_code: 'GB', postcode_prefixes: ['NG1','NG2','NG3','NG5','NG7','NG9'], focus: 'both', property_types: ['house','flat'], website: 'fhpliving.co.uk' },
  { agency_name: 'William H Brown Nottingham', city: 'Nottingham', country_code: 'GB', postcode_prefixes: ['NG1','NG2','NG3','NG5','NG7'], focus: 'both', property_types: ['house','flat'], website: 'williamhbrown.co.uk' },
  { agency_name: 'Savills Nottingham', city: 'Nottingham', country_code: 'GB', postcode_prefixes: ['NG1','NG2','NG7','NG9','NG11'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.co.uk' },
]

// ── DE AGENTS ──────────────────────────────────────────────
const DE_AGENTS: AgentSeed[] = [
  // BERLIN
  { agency_name: 'Engel & Völkers Berlin Mitte', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','11'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/berlin', phone: '+49 30 203 460' },
  { agency_name: 'Engel & Völkers Berlin Charlottenburg', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','14'], focus: 'both', property_types: ['house','flat','villa'], website: 'engelvoelkers.com/de/berlin' },
  { agency_name: 'Zabel Properties Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14','15'], focus: 'both', property_types: ['house','flat','commercial'], website: 'zabel-properties.de' },
  { agency_name: 'Guthmann Immobilien', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14'], focus: 'both', property_types: ['house','flat','commercial'], website: 'guthmann.estate' },
  { agency_name: 'Ricarda Huch Immobilien', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14'], focus: 'both', property_types: ['house','flat'], website: 'ricardahuch.de' },
  { agency_name: 'BEST PLACE Immobilien', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13'], focus: 'rent', property_types: ['house','flat'], website: 'bestplace-immobilien.de' },
  { agency_name: 'Immodo Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14'], focus: 'both', property_types: ['house','flat'], website: 'immodo-berlin.de' },
  { agency_name: 'David Borck Immobilien', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13'], focus: 'both', property_types: ['flat','house','commercial'], website: 'david-borck.de' },
  { agency_name: 'First Citiz Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14'], focus: 'sale', property_types: ['flat','house','commercial'], website: 'firstcitiz.com' },
  { agency_name: 'Kensington International Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','14'], focus: 'sale', property_types: ['flat','house','villa'], website: 'kensington-international.com' },
  { agency_name: 'VON POLL Berlin Grunewald', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['14','10'], focus: 'both', property_types: ['house','flat','villa'], website: 'von-poll.com' },
  { agency_name: 'Dahler Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'Homeday Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14','15'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13','14','15'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },
  { agency_name: 'PISA Immobilien Berlin', city: 'Berlin', country_code: 'DE', postcode_prefixes: ['10','12','13'], focus: 'sale', property_types: ['flat','house'], website: 'pisa-immobilien.de' },

  // MUNICH
  { agency_name: 'Aigner Immobilien München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'both', property_types: ['house','flat','commercial'], website: 'aigner-immobilien.de' },
  { agency_name: 'Engel & Völkers München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/muenchen' },
  { agency_name: 'Mr. Lodge München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'rent', property_types: ['house','flat'], website: 'mrlodge.de' },
  { agency_name: 'VON POLL München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82'], focus: 'both', property_types: ['house','flat','villa'], website: 'von-poll.com' },
  { agency_name: 'Rogers Immobilien München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82'], focus: 'both', property_types: ['house','flat'], website: 'rogers-immobilien.de' },
  { agency_name: 'Rittberg Immobilien München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'sale', property_types: ['house','flat','villa'], website: 'rittberg-immobilien.de' },
  { agency_name: 'Dahler München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'HELLER Immobilien München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'both', property_types: ['house','flat','commercial'], website: 'heller-immobilien.de' },
  { agency_name: 'Homeday München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler München', city: 'München', country_code: 'DE', postcode_prefixes: ['80','81','82','83'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },

  // HAMBURG
  { agency_name: 'Engel & Völkers Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','21','22'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/hamburg' },
  { agency_name: 'Dahler Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','22'], focus: 'both', property_types: ['house','flat'], website: 'dahler.com' },
  { agency_name: 'Grossmann & Berger Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','21','22'], focus: 'both', property_types: ['house','flat','commercial'], website: 'grossmann-berger.de' },
  { agency_name: 'VON POLL Hamburg Alster', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','22'], focus: 'both', property_types: ['house','flat','villa'], website: 'von-poll.com' },
  { agency_name: 'Homeday Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','21','22'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','21','22'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },
  { agency_name: 'Savills Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','21','22'], focus: 'both', property_types: ['house','flat','commercial'], website: 'savills.de' },
  { agency_name: 'JLL Hamburg', city: 'Hamburg', country_code: 'DE', postcode_prefixes: ['20','22'], focus: 'sale', property_types: ['commercial','flat'], website: 'jll.de' },

  // FRANKFURT
  { agency_name: 'Engel & Völkers Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/frankfurt' },
  { agency_name: 'Dahler Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'VON POLL Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'both', property_types: ['house','flat','villa'], website: 'von-poll.com' },
  { agency_name: 'Colliers Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'sale', property_types: ['commercial'], website: 'colliers.de' },
  { agency_name: 'Savills Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'both', property_types: ['commercial','house','flat'], website: 'savills.de' },
  { agency_name: 'Homeday Frankfurt', city: 'Frankfurt', country_code: 'DE', postcode_prefixes: ['60','63','65'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },

  // COLOGNE
  { agency_name: 'Engel & Völkers Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/koeln' },
  { agency_name: 'VON POLL Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'both', property_types: ['house','flat','commercial'], website: 'von-poll.com' },
  { agency_name: 'Dahler Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'Klein & Osterberg Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'sale', property_types: ['house','flat','villa'], website: 'kleinundosterberg.de' },
  { agency_name: 'Homeday Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'Rheinische Immobilien Kompetenz Köln', city: 'Köln', country_code: 'DE', postcode_prefixes: ['50','51'], focus: 'both', property_types: ['house','flat'], website: 'rheinland.immo' },

  // DÜSSELDORF
  { agency_name: 'Engel & Völkers Düsseldorf', city: 'Düsseldorf', country_code: 'DE', postcode_prefixes: ['40','41'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/duesseldorf' },
  { agency_name: 'VON POLL Düsseldorf', city: 'Düsseldorf', country_code: 'DE', postcode_prefixes: ['40','41'], focus: 'both', property_types: ['house','flat','commercial'], website: 'von-poll.com' },
  { agency_name: 'Dahler Düsseldorf', city: 'Düsseldorf', country_code: 'DE', postcode_prefixes: ['40','41'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'Homeday Düsseldorf', city: 'Düsseldorf', country_code: 'DE', postcode_prefixes: ['40','41'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler Düsseldorf', city: 'Düsseldorf', country_code: 'DE', postcode_prefixes: ['40','41'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },

  // STUTTGART
  { agency_name: 'Engel & Völkers Stuttgart', city: 'Stuttgart', country_code: 'DE', postcode_prefixes: ['70','71'], focus: 'both', property_types: ['house','flat','commercial','villa'], website: 'engelvoelkers.com/de/stuttgart' },
  { agency_name: 'VON POLL Stuttgart', city: 'Stuttgart', country_code: 'DE', postcode_prefixes: ['70','71'], focus: 'both', property_types: ['house','flat','commercial'], website: 'von-poll.com' },
  { agency_name: 'Dahler Stuttgart', city: 'Stuttgart', country_code: 'DE', postcode_prefixes: ['70','71'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
  { agency_name: 'Homeday Stuttgart', city: 'Stuttgart', country_code: 'DE', postcode_prefixes: ['70','71'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'Pell-Rich Immobilien Stuttgart', city: 'Stuttgart', country_code: 'DE', postcode_prefixes: ['70','71'], focus: 'sale', property_types: ['house','flat','villa'], website: 'pell-rich.de' },

  // LEIPZIG
  { agency_name: 'Engel & Völkers Leipzig', city: 'Leipzig', country_code: 'DE', postcode_prefixes: ['04'], focus: 'both', property_types: ['house','flat','commercial'], website: 'engelvoelkers.com/de/leipzig' },
  { agency_name: 'VON POLL Leipzig', city: 'Leipzig', country_code: 'DE', postcode_prefixes: ['04'], focus: 'both', property_types: ['house','flat'], website: 'von-poll.com' },
  { agency_name: 'Homeday Leipzig', city: 'Leipzig', country_code: 'DE', postcode_prefixes: ['04'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler Leipzig', city: 'Leipzig', country_code: 'DE', postcode_prefixes: ['04'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },

  // DRESDEN
  { agency_name: 'Engel & Völkers Dresden', city: 'Dresden', country_code: 'DE', postcode_prefixes: ['01'], focus: 'both', property_types: ['house','flat','commercial'], website: 'engelvoelkers.com/de/dresden' },
  { agency_name: 'Colliers Dresden', city: 'Dresden', country_code: 'DE', postcode_prefixes: ['01'], focus: 'sale', property_types: ['commercial','flat'], website: 'colliers.de' },
  { agency_name: 'Homeday Dresden', city: 'Dresden', country_code: 'DE', postcode_prefixes: ['01'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },
  { agency_name: 'McMakler Dresden', city: 'Dresden', country_code: 'DE', postcode_prefixes: ['01'], focus: 'both', property_types: ['house','flat'], website: 'mcmakler.de' },

  // HANNOVER
  { agency_name: 'Engel & Völkers Hannover', city: 'Hannover', country_code: 'DE', postcode_prefixes: ['30'], focus: 'both', property_types: ['house','flat','commercial'], website: 'engelvoelkers.com/de/hannover' },
  { agency_name: 'VON POLL Hannover', city: 'Hannover', country_code: 'DE', postcode_prefixes: ['30'], focus: 'both', property_types: ['house','flat'], website: 'von-poll.com' },
  { agency_name: 'Homeday Hannover', city: 'Hannover', country_code: 'DE', postcode_prefixes: ['30'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },

  // NÜRNBERG
  { agency_name: 'Engel & Völkers Nürnberg', city: 'Nürnberg', country_code: 'DE', postcode_prefixes: ['90'], focus: 'both', property_types: ['house','flat','commercial'], website: 'engelvoelkers.com/de/nuernberg' },
  { agency_name: 'VON POLL Nürnberg', city: 'Nürnberg', country_code: 'DE', postcode_prefixes: ['90'], focus: 'both', property_types: ['house','flat'], website: 'von-poll.com' },
  { agency_name: 'Homeday Nürnberg', city: 'Nürnberg', country_code: 'DE', postcode_prefixes: ['90'], focus: 'both', property_types: ['house','flat'], website: 'homeday.de' },

  // BREMEN
  { agency_name: 'Engel & Völkers Bremen', city: 'Bremen', country_code: 'DE', postcode_prefixes: ['28'], focus: 'both', property_types: ['house','flat','commercial'], website: 'engelvoelkers.com/de/bremen' },
  { agency_name: 'VON POLL Bremen', city: 'Bremen', country_code: 'DE', postcode_prefixes: ['28'], focus: 'both', property_types: ['house','flat'], website: 'von-poll.com' },
  { agency_name: 'Dahler Bremen', city: 'Bremen', country_code: 'DE', postcode_prefixes: ['28'], focus: 'both', property_types: ['house','flat','commercial'], website: 'dahler.com' },
]

const ALL_AGENTS = [...UK_AGENTS, ...DE_AGENTS]

export async function POST(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get('key') !== 'yalla-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Insert agents
  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  for (const agent of ALL_AGENTS) {
    const userId = randomUUID()
    const email = `${agent.agency_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}.${agent.city.toLowerCase()}@agents.yalla.house`

    // Insert user
    const { error: userError } = await (supabase as any)
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: agent.agency_name,
        country_code: agent.country_code,
        language: agent.country_code === 'DE' ? 'de' : 'en',
      })

    if (userError) {
      if (userError.code === '23505') { skipped++; continue } // duplicate
      errors.push(`User ${agent.agency_name}: ${userError.message}`)
      continue
    }

    // Insert role
    await (supabase as any)
      .from('user_roles')
      .insert({ user_id: userId, role: 'agent', is_active: true })

    // Insert agent profile
    const coverageAreas = [{
      country_code: agent.country_code,
      region: agent.city,
      postcode_prefixes: agent.postcode_prefixes,
    }]

    const { error: profileError } = await (supabase as any)
      .from('agent_profiles')
      .insert({
        user_id: userId,
        agency_name: agent.agency_name,
        coverage_areas: coverageAreas,
        property_types: agent.property_types,
        focus: agent.focus,
        verified_at: new Date().toISOString(),
        subscription_tier: 'free',
        languages: agent.country_code === 'DE' ? ['de', 'en'] : ['en'],
      })

    if (profileError) {
      errors.push(`Profile ${agent.agency_name}: ${profileError.message}`)
      continue
    }

    inserted++
  }

  return NextResponse.json({
    total: ALL_AGENTS.length,
    inserted,
    skipped,
    errors: errors.slice(0, 20), // cap errors in response
    uk_count: UK_AGENTS.length,
    de_count: DE_AGENTS.length,
  })
}
