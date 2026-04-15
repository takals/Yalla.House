/**
 * Property tag taxonomy — client-side config.
 *
 * Mirrors the property_tags DB table. Used by:
 *   - Passport intake flow (categorised chip steps)
 *   - Passport card (display selected tags)
 *   - Smart parser (tag extraction from descriptions)
 *   - Match scoring (tag overlap dimension)
 *
 * Tags are grouped by category. Each tag has:
 *   slug          — DB primary key / value stored in hunter_preference_tags
 *   label_en/de   — display labels
 *   icon          — lucide icon name
 *   countries     — empty = all countries; ['GB'] = GB-only
 *   intentFilter  — null = both; 'rent' = only shown for renters
 */

export interface PropertyTag {
  slug: string
  label_en: string
  label_de: string
  icon: string
  countries: string[]       // empty = universal
  intentFilter: 'buy' | 'rent' | null
}

export interface TagCategory {
  id: string
  label_en: string
  label_de: string
  icon: string
  tags: PropertyTag[]
}

export type TagSentiment = 'want' | 'need' | 'dealbreaker'

export interface HunterTagPreference {
  slug: string
  sentiment: TagSentiment
}

// ─────────────────────────────────────────────────────────────────────
// Full taxonomy
// ─────────────────────────────────────────────────────────────────────

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'accessibility',
    label_en: 'Accessibility',
    label_de: 'Barrierefreiheit',
    icon: 'accessibility',
    tags: [
      { slug: 'wheelchair_accessible', label_en: 'Wheelchair Accessible',  label_de: 'Rollstuhlgerecht',    icon: 'accessibility', countries: [], intentFilter: null },
      { slug: 'step_free_access',      label_en: 'Step-Free Access',       label_de: 'Stufenloser Zugang',  icon: 'accessibility', countries: [], intentFilter: null },
      { slug: 'ground_floor',          label_en: 'Ground Floor',           label_de: 'Erdgeschoss',         icon: 'accessibility', countries: [], intentFilter: null },
      { slug: 'wide_doorways',         label_en: 'Wide Doorways',          label_de: 'Breite Türrahmen',    icon: 'accessibility', countries: [], intentFilter: null },
      { slug: 'walk_in_shower',        label_en: 'Walk-In Shower',         label_de: 'Ebenerdige Dusche',   icon: 'accessibility', countries: [], intentFilter: null },
      { slug: 'lift_access',           label_en: 'Lift Access',            label_de: 'Aufzug vorhanden',    icon: 'accessibility', countries: [], intentFilter: null },
    ],
  },
  {
    id: 'outdoor',
    label_en: 'Outdoor Space',
    label_de: 'Außenbereich',
    icon: 'trees',
    tags: [
      { slug: 'private_garden',  label_en: 'Private Garden',    label_de: 'Eigener Garten',        icon: 'trees',  countries: [], intentFilter: null },
      { slug: 'shared_garden',   label_en: 'Shared Garden',     label_de: 'Gemeinschaftsgarten',   icon: 'trees',  countries: [], intentFilter: null },
      { slug: 'balcony',         label_en: 'Balcony',           label_de: 'Balkon',                icon: 'sun',    countries: [], intentFilter: null },
      { slug: 'terrace',         label_en: 'Terrace / Patio',   label_de: 'Terrasse',              icon: 'sun',    countries: [], intentFilter: null },
      { slug: 'roof_terrace',    label_en: 'Roof Terrace',      label_de: 'Dachterrasse',          icon: 'sun',    countries: [], intentFilter: null },
      { slug: 'allotment',       label_en: 'Allotment / Plot',  label_de: 'Schrebergarten',        icon: 'shovel', countries: ['DE'], intentFilter: null },
    ],
  },
  {
    id: 'community',
    label_en: 'Community & Amenities',
    label_de: 'Gemeinschaft & Ausstattung',
    icon: 'users',
    tags: [
      { slug: 'community_garden', label_en: 'Community Garden',        label_de: 'Gemeinschaftsgarten',        icon: 'flower-2',  countries: [], intentFilter: null },
      { slug: 'communal_lounge',  label_en: 'Communal Lounge',         label_de: 'Gemeinschaftsraum',          icon: 'sofa',      countries: [], intentFilter: null },
      { slug: 'concierge',        label_en: 'Concierge / Doorman',     label_de: 'Concierge / Pförtner',       icon: 'bell',      countries: [], intentFilter: null },
      { slug: 'gym_on_site',      label_en: 'On-Site Gym',             label_de: 'Hauseigenes Fitnessstudio',  icon: 'dumbbell',  countries: [], intentFilter: null },
      { slug: 'co_working_space', label_en: 'Co-Working Space',        label_de: 'Co-Working-Bereich',         icon: 'laptop',    countries: [], intentFilter: null },
      { slug: 'play_area',        label_en: 'Children\'s Play Area',   label_de: 'Kinderspielplatz',           icon: 'baby',      countries: [], intentFilter: null },
      { slug: 'bike_storage',     label_en: 'Bike Storage',            label_de: 'Fahrradstellplatz',          icon: 'bike',      countries: [], intentFilter: null },
    ],
  },
  {
    id: 'building',
    label_en: 'Building Features',
    label_de: 'Gebäudemerkmale',
    icon: 'building',
    tags: [
      { slug: 'new_build',        label_en: 'New Build',             label_de: 'Neubau',                  icon: 'building',        countries: [], intentFilter: null },
      { slug: 'period_features',   label_en: 'Period Features',       label_de: 'Altbau-Charme',           icon: 'landmark',        countries: [], intentFilter: null },
      { slug: 'open_plan',         label_en: 'Open Plan Living',      label_de: 'Offener Grundriss',       icon: 'layout-grid',     countries: [], intentFilter: null },
      { slug: 'high_ceilings',     label_en: 'High Ceilings',         label_de: 'Hohe Decken',             icon: 'arrow-up',        countries: [], intentFilter: null },
      { slug: 'storage_room',      label_en: 'Storage Room / Cellar', label_de: 'Abstellraum / Keller',    icon: 'box',             countries: [], intentFilter: null },
      { slug: 'guest_wc',          label_en: 'Guest WC',              label_de: 'Gäste-WC',                icon: 'bath',            countries: [], intentFilter: null },
      { slug: 'ensuite',           label_en: 'En-Suite Bathroom',     label_de: 'Eigenes Bad (en suite)',   icon: 'bath',            countries: [], intentFilter: null },
      { slug: 'utility_room',      label_en: 'Utility Room',          label_de: 'Hauswirtschaftsraum',     icon: 'washing-machine', countries: [], intentFilter: null },
      { slug: 'double_glazing',    label_en: 'Double Glazing',        label_de: 'Doppelverglasung',         icon: 'layers',          countries: ['GB'], intentFilter: null },
    ],
  },
  {
    id: 'pets',
    label_en: 'Pets',
    label_de: 'Haustiere',
    icon: 'paw-print',
    tags: [
      { slug: 'pets_allowed', label_en: 'Pets Allowed',     label_de: 'Haustiere erlaubt', icon: 'paw-print', countries: [], intentFilter: 'rent' },
      { slug: 'dogs_allowed', label_en: 'Dogs Allowed',     label_de: 'Hunde erlaubt',     icon: 'paw-print', countries: [], intentFilter: 'rent' },
      { slug: 'cats_allowed', label_en: 'Cats Allowed',     label_de: 'Katzen erlaubt',    icon: 'paw-print', countries: [], intentFilter: 'rent' },
      { slug: 'no_pets',      label_en: 'No Pets Allowed',  label_de: 'Keine Haustiere',   icon: 'ban',       countries: [], intentFilter: 'rent' },
    ],
  },
  {
    id: 'lifestyle',
    label_en: 'Lifestyle & Location',
    label_de: 'Lebensstil & Lage',
    icon: 'map-pin',
    tags: [
      { slug: 'near_station',    label_en: 'Near Train / Tube Station', label_de: 'Nahe U-/S-Bahn',           icon: 'train-front',  countries: [], intentFilter: null },
      { slug: 'quiet_street',    label_en: 'Quiet Street',              label_de: 'Ruhige Straße',            icon: 'volume-x',     countries: [], intentFilter: null },
      { slug: 'near_schools',    label_en: 'Near Good Schools',         label_de: 'Nahe guter Schulen',       icon: 'graduation-cap', countries: [], intentFilter: null },
      { slug: 'near_parks',      label_en: 'Near Parks / Green Spaces', label_de: 'Nahe Parks / Grünflächen', icon: 'tree-pine',    countries: [], intentFilter: null },
      { slug: 'shops_nearby',    label_en: 'Shops & Amenities Nearby',  label_de: 'Geschäfte in der Nähe',    icon: 'shopping-bag', countries: [], intentFilter: null },
      { slug: 'work_from_home',  label_en: 'Suitable for WFH',          label_de: 'Geeignet für Homeoffice',  icon: 'home',         countries: [], intentFilter: null },
    ],
  },
  {
    id: 'parking',
    label_en: 'Parking',
    label_de: 'Parken',
    icon: 'car',
    tags: [
      { slug: 'off_street_parking', label_en: 'Off-Street Parking',           label_de: 'Eigener Stellplatz',    icon: 'car', countries: [],     intentFilter: null },
      { slug: 'garage',             label_en: 'Garage',                        label_de: 'Garage',                icon: 'car', countries: [],     intentFilter: null },
      { slug: 'ev_charging',        label_en: 'EV Charging Point',             label_de: 'E-Ladestation',         icon: 'zap', countries: [],     intentFilter: null },
      { slug: 'permit_parking',     label_en: 'Residents\' Permit Parking',   label_de: 'Bewohnerparkausweis',   icon: 'car', countries: ['GB'], intentFilter: null },
    ],
  },
  {
    id: 'energy',
    label_en: 'Energy & Sustainability',
    label_de: 'Energie & Nachhaltigkeit',
    icon: 'leaf',
    tags: [
      { slug: 'solar_panels',        label_en: 'Solar Panels',              label_de: 'Solaranlage',          icon: 'sun',          countries: [],     intentFilter: null },
      { slug: 'heat_pump',            label_en: 'Heat Pump',                 label_de: 'Wärmepumpe',           icon: 'thermometer',  countries: [],     intentFilter: null },
      { slug: 'epc_a_b',              label_en: 'EPC Rating A–B',            label_de: 'Energieeffizienz A–B', icon: 'leaf',         countries: ['GB'], intentFilter: null },
      { slug: 'kfw_efficient',         label_en: 'KfW Efficiency Standard',   label_de: 'KfW-Effizienzhaus',    icon: 'leaf',         countries: ['DE'], intentFilter: null },
      { slug: 'gas_central_heating',   label_en: 'Gas Central Heating',       label_de: 'Gas-Zentralheizung',   icon: 'flame',        countries: [],     intentFilter: null },
    ],
  },
  {
    id: 'safety',
    label_en: 'Safety & Security',
    label_de: 'Sicherheit',
    icon: 'shield',
    tags: [
      { slug: 'gated_community', label_en: 'Gated / Secure Entry',     label_de: 'Gesicherte Anlage',  icon: 'lock',   countries: [], intentFilter: null },
      { slug: 'cctv',            label_en: 'CCTV / Security Cameras',  label_de: 'Videoüberwachung',   icon: 'camera', countries: [], intentFilter: null },
      { slug: 'alarm_system',    label_en: 'Alarm System',              label_de: 'Alarmanlage',        icon: 'siren',  countries: [], intentFilter: null },
      { slug: 'fire_alarm',      label_en: 'Fire / Smoke Alarms',      label_de: 'Rauchmelder',        icon: 'siren',  countries: [], intentFilter: null },
    ],
  },
  {
    id: 'rental',
    label_en: 'Rental Terms',
    label_de: 'Mietkonditionen',
    icon: 'key',
    tags: [
      { slug: 'furnished',         label_en: 'Furnished',               label_de: 'Möbliert',                icon: 'armchair',      countries: [],     intentFilter: 'rent' },
      { slug: 'part_furnished',    label_en: 'Part Furnished',          label_de: 'Teilmöbliert',            icon: 'armchair',      countries: [],     intentFilter: 'rent' },
      { slug: 'unfurnished',       label_en: 'Unfurnished',             label_de: 'Unmöbliert',              icon: 'armchair',      countries: [],     intentFilter: 'rent' },
      { slug: 'bills_included',    label_en: 'Bills Included',          label_de: 'Nebenkosten inklusive',   icon: 'receipt',       countries: [],     intentFilter: 'rent' },
      { slug: 'dss_accepted',      label_en: 'DSS / Housing Benefit OK',label_de: 'Wohngeld akzeptiert',    icon: 'hand-heart',    countries: ['GB'], intentFilter: 'rent' },
      { slug: 'short_let_ok',      label_en: 'Short Let Available',     label_de: 'Kurzzeitmiete möglich',   icon: 'calendar',      countries: [],     intentFilter: 'rent' },
      { slug: 'students_welcome',  label_en: 'Students Welcome',        label_de: 'Studenten willkommen',    icon: 'graduation-cap',countries: [],     intentFilter: 'rent' },
      { slug: 'sharers_ok',        label_en: 'Sharers Accepted',        label_de: 'WG-geeignet',             icon: 'users',         countries: [],     intentFilter: 'rent' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Filter categories + tags relevant to a given country + intent */
export function getFilteredCategories(
  countryCode: string,
  intent: 'buy' | 'rent' | 'both' | null
): TagCategory[] {
  return TAG_CATEGORIES
    .map(cat => ({
      ...cat,
      tags: cat.tags.filter(tag => {
        // Country filter: show if universal or matches
        const countryOk = tag.countries.length === 0 || tag.countries.includes(countryCode)
        // Intent filter: show if universal or matches
        const intentOk = !tag.intentFilter || !intent || intent === 'both' || tag.intentFilter === intent
        return countryOk && intentOk
      }),
    }))
    .filter(cat => cat.tags.length > 0) // drop empty categories
}

/** Get label for a tag in the right locale */
export function getTagLabel(tag: PropertyTag, locale: string): string {
  return locale === 'de' ? tag.label_de : tag.label_en
}

/** Get label for a category in the right locale */
export function getCategoryLabel(cat: TagCategory, locale: string): string {
  return locale === 'de' ? cat.label_de : cat.label_en
}

/** Find a tag by slug across all categories */
export function findTagBySlug(slug: string): PropertyTag | undefined {
  for (const cat of TAG_CATEGORIES) {
    const tag = cat.tags.find(t => t.slug === slug)
    if (tag) return tag
  }
  return undefined
}

/** Flat list of all tag slugs */
export function getAllTagSlugs(): string[] {
  return TAG_CATEGORIES.flatMap(cat => cat.tags.map(t => t.slug))
}
