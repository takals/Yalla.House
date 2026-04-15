/**
 * Tag extractor — maps listing descriptions to property_tags slugs.
 *
 * Used by:
 *   - Portal scrapers (Inngest functions) to auto-tag listings
 *   - Owner listing wizard to suggest tags from descriptions
 *   - Feed import to normalise structured data into tags
 *
 * Each pattern maps one or more regex patterns (EN + DE) to a tag slug.
 * Confidence is 0.85 for fuzzy matches, 0.95 for exact structured data.
 */

export interface ExtractedTag {
  slug: string
  confidence: number
  matchedText: string
}

interface TagPattern {
  slug: string
  patterns: RegExp[]
  confidence: number
}

const TAG_PATTERNS: TagPattern[] = [
  // ── Accessibility ──
  { slug: 'wheelchair_accessible', confidence: 0.90, patterns: [
    /wheelchair\s*accessible/gi, /rollstuhl\s*gerecht/gi, /barrierearm/gi, /barrierefrei/gi,
    /disabled\s*access/gi, /behinderten\s*gerecht/gi,
  ]},
  { slug: 'step_free_access', confidence: 0.85, patterns: [
    /step[\s-]*free/gi, /no\s*steps/gi, /stufen\s*los/gi, /stufen\s*frei/gi, /eben\s*erdig/gi,
  ]},
  { slug: 'ground_floor', confidence: 0.90, patterns: [
    /ground\s*floor\s*(flat|apartment|unit|maisonette)?/gi,
    /erdgeschoss/gi, /eg[\s-]*(wohnung)?/gi,
  ]},
  { slug: 'wide_doorways', confidence: 0.80, patterns: [
    /wide\s*door(way)?s?/gi, /breit(e)?\s*t(ü|ue)r/gi,
  ]},
  { slug: 'walk_in_shower', confidence: 0.85, patterns: [
    /walk[\s-]*in\s*shower/gi, /level[\s-]*access\s*shower/gi,
    /eben\s*erdige?\s*dusche/gi, /bodentiefe?\s*dusche/gi,
  ]},
  { slug: 'lift_access', confidence: 0.90, patterns: [
    /\blift\b/gi, /\belevator\b/gi, /aufzug/gi, /fahrstuhl/gi,
  ]},

  // ── Outdoor ──
  { slug: 'private_garden', confidence: 0.85, patterns: [
    /private\s*garden/gi, /own\s*garden/gi, /rear\s*garden/gi,
    /eigener?\s*garten/gi, /privat(er)?\s*garten/gi,
  ]},
  { slug: 'shared_garden', confidence: 0.85, patterns: [
    /shared\s*garden/gi, /communal\s*garden/gi,
    /gemeinschafts\s*garten/gi,
  ]},
  { slug: 'balcony', confidence: 0.95, patterns: [
    /balcon(y|ies)/gi, /balkon/gi, /loggia/gi,
  ]},
  { slug: 'terrace', confidence: 0.90, patterns: [
    /\bterrace\b/gi, /\bpatio\b/gi, /terrasse/gi,
  ]},
  { slug: 'roof_terrace', confidence: 0.90, patterns: [
    /roof\s*terrace/gi, /rooftop\s*(terrace|garden|patio)/gi,
    /dach\s*terrasse/gi,
  ]},

  // ── Community ──
  { slug: 'community_garden', confidence: 0.85, patterns: [
    /community\s*garden/gi, /communal\s*garden/gi,
    /gemeinschafts\s*garten/gi,
  ]},
  { slug: 'concierge', confidence: 0.90, patterns: [
    /concierge/gi, /doorman/gi, /porter/gi, /pf(ö|oe)rtner/gi,
  ]},
  { slug: 'gym_on_site', confidence: 0.85, patterns: [
    /\bgym\b/gi, /fitness\s*(room|centre|center|studio|area)/gi,
    /fitness\s*studio/gi, /fitnessraum/gi,
  ]},
  { slug: 'co_working_space', confidence: 0.80, patterns: [
    /co[\s-]*working/gi, /coworking/gi,
  ]},
  { slug: 'play_area', confidence: 0.80, patterns: [
    /play\s*(area|ground|room)/gi, /kinder\s*spiel\s*(platz|raum)/gi,
  ]},
  { slug: 'bike_storage', confidence: 0.85, patterns: [
    /bike\s*stor(age|e|room)/gi, /cycle\s*stor(age|e)/gi,
    /fahrrad\s*(keller|stell\s*platz|raum|abstellplatz)/gi,
  ]},

  // ── Building ──
  { slug: 'new_build', confidence: 0.90, patterns: [
    /new[\s-]*build/gi, /newly\s*built/gi, /neubau/gi, /erstbezug/gi,
  ]},
  { slug: 'period_features', confidence: 0.85, patterns: [
    /period\s*(features?|property|character)/gi, /victorian/gi, /edwardian/gi, /georgian/gi,
    /altbau/gi, /gr(ü|ue)nderzeit/gi, /jugendstil/gi, /stuck\s*decke/gi,
  ]},
  { slug: 'open_plan', confidence: 0.85, patterns: [
    /open[\s-]*plan/gi, /open\s*living/gi, /offener?\s*grundriss/gi,
  ]},
  { slug: 'high_ceilings', confidence: 0.85, patterns: [
    /high\s*ceiling/gi, /tall\s*ceiling/gi, /hohe\s*decken/gi,
  ]},
  { slug: 'storage_room', confidence: 0.80, patterns: [
    /stor(age|e)\s*room/gi, /cellar/gi, /basement\s*stor/gi,
    /abstellraum/gi, /keller/gi, /kellerraum/gi,
  ]},
  { slug: 'guest_wc', confidence: 0.90, patterns: [
    /guest\s*(wc|toilet|cloakroom|bathroom)/gi, /downstairs\s*(wc|toilet|cloakroom)/gi,
    /g(ä|ae)ste[\s-]*(wc|bad|toilette)/gi,
  ]},
  { slug: 'ensuite', confidence: 0.90, patterns: [
    /en[\s-]*suite/gi, /ensuite/gi, /eigenes?\s*bad/gi,
  ]},
  { slug: 'utility_room', confidence: 0.85, patterns: [
    /utility\s*room/gi, /hauswirtschafts\s*raum/gi, /waschk(ü|ue)che/gi,
  ]},
  { slug: 'double_glazing', confidence: 0.85, patterns: [
    /double\s*glaz(ed|ing)/gi, /doppel\s*verglas(ung|t)/gi,
  ]},

  // ── Pets ──
  { slug: 'pets_allowed', confidence: 0.90, patterns: [
    /pets?\s*(allowed|welcome|considered|friendly)/gi,
    /haustiere?\s*(erlaubt|willkommen)/gi, /tierhaltung\s*erlaubt/gi,
  ]},
  { slug: 'dogs_allowed', confidence: 0.85, patterns: [
    /dogs?\s*(allowed|welcome|friendly)/gi, /hunde?\s*(erlaubt|willkommen)/gi,
  ]},
  { slug: 'cats_allowed', confidence: 0.85, patterns: [
    /cats?\s*(allowed|welcome)/gi, /katzen?\s*(erlaubt|willkommen)/gi,
  ]},
  { slug: 'no_pets', confidence: 0.90, patterns: [
    /no\s*pets/gi, /pets?\s*not\s*(allowed|permitted)/gi,
    /keine\s*haustiere/gi, /tierhaltung\s*nicht\s*erlaubt/gi,
  ]},

  // ── Lifestyle ──
  { slug: 'near_station', confidence: 0.80, patterns: [
    /close\s*to\s*(station|tube|underground|rail|train|bus|tram)/gi,
    /near(by)?\s*(station|tube|underground|rail|train)/gi,
    /minutes?\s*(walk|from)\s*(station|tube|underground)/gi,
    /nahe\s*(u[\s-]?bahn|s[\s-]?bahn|bahnhof|haltestelle)/gi,
  ]},
  { slug: 'quiet_street', confidence: 0.80, patterns: [
    /quiet\s*(street|road|location|area|neighbourhood)/gi, /peaceful\s*(street|location)/gi,
    /ruhig(e)?\s*(stra(ß|ss)e|lage|gegend|wohnlage)/gi,
  ]},
  { slug: 'near_schools', confidence: 0.75, patterns: [
    /close\s*to\s*school/gi, /near(by)?\s*school/gi, /good\s*school/gi, /ofsted/gi,
    /nahe\s*(schul|kita|kindergarten)/gi,
  ]},
  { slug: 'near_parks', confidence: 0.75, patterns: [
    /near(by)?\s*(park|green\s*space|common|heath)/gi, /overlooking\s*(park|green)/gi,
    /nahe\s*(park|gr(ü|ue)n\s*(fl(ä|ae)che|anlage))/gi,
  ]},
  { slug: 'work_from_home', confidence: 0.80, patterns: [
    /work\s*from\s*home/gi, /home\s*office/gi, /wfh/gi, /study\s*room/gi,
    /arbeitszimmer/gi, /home[\s-]*office/gi,
  ]},

  // ── Parking ──
  { slug: 'off_street_parking', confidence: 0.90, patterns: [
    /off[\s-]*street\s*parking/gi, /driveway/gi, /parking\s*space/gi,
    /stell\s*platz/gi, /park\s*platz/gi,
  ]},
  { slug: 'garage', confidence: 0.95, patterns: [
    /\bgarage\b/gi, /\bgaragen?\b/gi,
  ]},
  { slug: 'ev_charging', confidence: 0.90, patterns: [
    /ev\s*charg(ing|er|e)/gi, /electric\s*vehicle\s*charg/gi,
    /e[\s-]*lade\s*station/gi, /wallbox/gi, /ladem(ö|oe)glichkeit/gi,
  ]},
  { slug: 'permit_parking', confidence: 0.80, patterns: [
    /permit\s*parking/gi, /resident(s)?('s)?\s*parking/gi, /cpz/gi,
    /bewohner\s*park\s*(ausweis|zone)/gi,
  ]},

  // ── Energy ──
  { slug: 'solar_panels', confidence: 0.90, patterns: [
    /solar\s*panel/gi, /photovoltai[ck]/gi, /pv\s*panel/gi,
    /solar\s*anlage/gi, /photovoltaik/gi,
  ]},
  { slug: 'heat_pump', confidence: 0.90, patterns: [
    /heat\s*pump/gi, /air\s*source/gi, /ground\s*source/gi,
    /w(ä|ae)rme\s*pumpe/gi, /luft\s*w(ä|ae)rme/gi,
  ]},
  { slug: 'epc_a_b', confidence: 0.85, patterns: [
    /epc\s*(rating\s*)?[ab]\b/gi, /energy\s*rating\s*[ab]\b/gi,
  ]},
  { slug: 'kfw_efficient', confidence: 0.85, patterns: [
    /kfw[\s-]*(effizienz|f(ö|oe)rder|standard|haus|\d{2,3})/gi,
  ]},
  { slug: 'gas_central_heating', confidence: 0.85, patterns: [
    /gas\s*central\s*heat/gi, /gch/gi, /gas\s*heat/gi,
    /gas[\s-]*(zentral\s*)?heizung/gi, /gasheizung/gi,
  ]},

  // ── Safety ──
  { slug: 'gated_community', confidence: 0.85, patterns: [
    /gated\s*(community|development|estate|complex)/gi, /secure\s*(entry|entrance|building)/gi,
    /gesichert(e)?\s*(anlage|eingang)/gi, /geschlossene?\s*wohn\s*anlage/gi,
  ]},
  { slug: 'cctv', confidence: 0.85, patterns: [
    /cctv/gi, /security\s*camera/gi, /video\s*(ü|ue)berwachung/gi,
  ]},
  { slug: 'alarm_system', confidence: 0.85, patterns: [
    /alarm\s*system/gi, /burglar\s*alarm/gi, /intruder\s*alarm/gi,
    /alarm\s*anlage/gi, /einbruch\s*schutz/gi,
  ]},

  // ── Rental ──
  { slug: 'furnished', confidence: 0.90, patterns: [
    /\bfurnished\b/gi, /\bm(ö|oe)bliert\b/gi,
  ]},
  { slug: 'part_furnished', confidence: 0.85, patterns: [
    /part(ly)?\s*furnished/gi, /teil\s*m(ö|oe)bliert/gi,
  ]},
  { slug: 'unfurnished', confidence: 0.90, patterns: [
    /\bunfurnished\b/gi, /\bunm(ö|oe)bliert\b/gi,
  ]},
  { slug: 'bills_included', confidence: 0.85, patterns: [
    /bills?\s*inc(luded)?/gi, /all\s*bills/gi, /neben\s*kosten\s*inkl/gi, /warm\s*miete/gi,
  ]},
  { slug: 'dss_accepted', confidence: 0.85, patterns: [
    /dss\s*(accepted|welcome|considered)/gi, /housing\s*benefit\s*(accepted|welcome|ok)/gi,
    /universal\s*credit\s*(accepted|welcome)/gi,
  ]},
  { slug: 'short_let_ok', confidence: 0.85, patterns: [
    /short[\s-]*let/gi, /short[\s-]*term/gi, /temporary/gi,
    /kurzzeit\s*miete/gi, /befristet/gi,
  ]},
  { slug: 'students_welcome', confidence: 0.85, patterns: [
    /student(s)?\s*(welcome|suitable|accommodation|let)/gi,
    /studenten?\s*(willkommen|geeignet|wohnung)/gi,
  ]},
  { slug: 'sharers_ok', confidence: 0.85, patterns: [
    /sharer(s)?\s*(accepted|welcome|ok|suitable)/gi, /suitable\s*for\s*shar/gi,
    /wg[\s-]*(geeignet|tauglich|m(ö|oe)glich)/gi,
  ]},
]

/**
 * Extract tags from a listing description or structured feature list.
 * Returns an array of matched tags with confidence scores.
 */
export function extractTags(text: string): ExtractedTag[] {
  if (!text || text.trim().length === 0) return []

  const results: ExtractedTag[] = []
  const seenSlugs = new Set<string>()

  for (const pattern of TAG_PATTERNS) {
    if (seenSlugs.has(pattern.slug)) continue

    for (const regex of pattern.patterns) {
      // Reset lastIndex for global regexes
      regex.lastIndex = 0
      const match = regex.exec(text)
      if (match) {
        results.push({
          slug: pattern.slug,
          confidence: pattern.confidence,
          matchedText: match[0],
        })
        seenSlugs.add(pattern.slug)
        break // one match per slug is enough
      }
    }
  }

  return results
}

/**
 * Extract tags from structured property features (e.g., Rightmove key_features array).
 * Higher confidence since these are explicit structured data.
 */
export function extractTagsFromFeatures(features: string[]): ExtractedTag[] {
  const combined = features.join(' | ')
  return extractTags(combined).map(t => ({
    ...t,
    confidence: Math.min(t.confidence + 0.05, 1.0), // slight boost for structured data
  }))
}
