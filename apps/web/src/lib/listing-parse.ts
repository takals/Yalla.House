// Heuristic parser for inbound agent listing emails.
//
// Agents paste listings@yalla.house into their own property mailouts. Those
// emails land in agent_inbound_emails; this module turns the raw email into
// zero-or-more listing *candidates* (agent_inbound_listings) that an admin
// then reviews. It is deliberately conservative and dependency-free — no AI,
// no network — so it runs cheaply on every inbound message. AI enrichment can
// be layered on later for the fields left null here.

export interface ParsedListing {
  title: string | null
  priceText: string | null
  priceAmount: number | null
  currency: string | null
  location: string | null
  postcode: string | null
  countryCode: string | null
  propertyType: string | null
  bedrooms: number | null
  url: string | null
  description: string | null
}

export interface ParseInput {
  subject?: string | null
  text?: string | null
  html?: string | null
  countryHint?: string | null
}

/** Strip tags/entities from an HTML body into readable plain text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&pound;/gi, '£')
    .replace(/&euro;/gi, '€')
    .replace(/&#163;/g, '£')
    .replace(/&#8364;/g, '€')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Property-detail URLs worth treating as a distinct listing anchor.
const LISTING_URL_RE =
  /https?:\/\/[^\s"'<>]*(?:rightmove\.co\.uk\/properties|zoopla\.co\.uk\/(?:for-sale|to-rent)\/details|onthemarket\.com\/details|immobilienscout24\.de\/expose|immoscout24\.de\/expose|immowelt\.de\/expose|kleinanzeigen\.de\/s-anzeige|primelocation\.com\/[^\s"'<>]*details)[^\s"'<>]*/gi

const ANY_URL_RE = /https?:\/\/[^\s"'<>]+/gi

// UK postcode (full or outward), DE 5-digit PLZ.
const UK_POSTCODE_RE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i
const DE_PLZ_RE = /\b(\d{5})\b/

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

/** Parse a GBP or EUR price. Returns { text, amount, currency }. */
export function parsePrice(s: string): { text: string; amount: number | null; currency: string } | null {
  // £1,250,000  |  £1.25m  |  €450.000  |  450.000 €  |  EUR 450,000
  const gbp = s.match(/£\s?([\d.,]+)\s*(k|m|million)?/i)
  const eur = s.match(/(?:€|EUR)\s?([\d.,]+)\s*(k|m|mio|million)?/i) ||
              s.match(/([\d][\d.,]*)\s*(?:€|EUR)/)
  const pick = gbp
    ? { raw: gbp[0], num: gbp[1] ?? '', suffix: gbp[2], currency: 'GBP' }
    : eur
    ? { raw: eur[0], num: eur[1] ?? '', suffix: eur[2], currency: 'EUR' }
    : null
  if (!pick) return null

  // Normalise thousands/decimals. Property prices are near-always whole
  // numbers with thousands separators (£575,000 / 450.000 €). Rule:
  //   - with a k/m suffix, the separator is a decimal point (£1.25m)
  //   - otherwise a separator is only a decimal when exactly 2 digits follow
  //     (cents, e.g. 1.234,56); any other separator is a thousands separator.
  let digits = pick.num.replace(/[^\d.,]/g, '')
  const suffix = (pick.suffix ?? '').toLowerCase()
  const hasSuffix = suffix === 'k' || suffix === 'm' || suffix === 'million' || suffix === 'mio'
  const lastComma = digits.lastIndexOf(',')
  const lastDot = digits.lastIndexOf('.')
  const lastSep = Math.max(lastComma, lastDot)
  let decimalSep: string | null = null
  if (hasSuffix) {
    decimalSep = lastComma > lastDot ? ',' : lastDot > lastComma ? '.' : null
  } else if (lastSep !== -1 && digits.length - lastSep - 1 === 2) {
    decimalSep = digits[lastSep] ?? null
  }
  if (decimalSep) {
    const thousandsSep = decimalSep === ',' ? '.' : ','
    digits = digits.split(thousandsSep).join('').replace(decimalSep, '.')
  } else {
    digits = digits.replace(/[.,]/g, '')
  }
  let amount = parseFloat(digits)
  if (!isFinite(amount)) amount = NaN
  if (suffix === 'k') amount *= 1_000
  if (suffix === 'm' || suffix === 'million' || suffix === 'mio') amount *= 1_000_000

  return {
    text: pick.raw.trim(),
    amount: isFinite(amount) ? Math.round(amount) : null,
    currency: pick.currency,
  }
}

function detectBedrooms(s: string): number | null {
  const m = s.match(/\b(\d{1,2})\s*(?:bed(?:room)?s?|-?bed\b|zimmer|zi\.?|schlafzimmer)\b/i)
  return m?.[1] ? parseInt(m[1], 10) : null
}

const TYPE_KEYWORDS: Array<[RegExp, string]> = [
  [/\bstudio\b/i, 'studio'],
  [/\b(flat|apartment|maisonette|wohnung|apartement)\b/i, 'flat'],
  [/\b(terraced|reihenhaus)\b/i, 'terraced'],
  [/\b(semi-?detached|doppelhaus)\b/i, 'semi_detached'],
  [/\b(detached|einfamilienhaus|villa|freistehend)\b/i, 'detached'],
  [/\b(new build|neubau)\b/i, 'new_build'],
  [/\b(commercial|gewerbe|büro|buro|office|retail|laden)\b/i, 'commercial'],
  [/\b(haus|house|bungalow)\b/i, 'house'],
]

function detectType(s: string): string | null {
  for (const [re, type] of TYPE_KEYWORDS) if (re.test(s)) return type
  return null
}

function detectCountry(s: string, hint?: string | null): string | null {
  if (/immobilienscout24|immoscout24|immowelt|kleinanzeigen|\.de\b|€|EUR|plz|zimmer/i.test(s)) return 'DE'
  if (/rightmove|zoopla|onthemarket|primelocation|£|GBP|\.co\.uk\b/i.test(s)) return 'GB'
  if (UK_POSTCODE_RE.test(s)) return 'GB'
  return hint ?? null
}

function firstMeaningfulLine(text: string): string | null {
  const line = text
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 8 && !/^https?:\/\//i.test(l) && !/unsubscribe|abmelden|view.*browser/i.test(l))
  return line ? line.slice(0, 180) : null
}

/**
 * Parse an inbound email into listing candidates.
 * - One candidate per recognised property URL (sharing email-level signals).
 * - If no property URL, a single email-level candidate (when any signal found).
 * Always returns at least an empty array; callers decide how to store it.
 */
export function parseListingsFromEmail(input: ParseInput): ParsedListing[] {
  const subject = (input.subject ?? '').trim()
  const bodyText =
    (input.text && input.text.trim()) ||
    (input.html ? htmlToText(input.html) : '') ||
    ''
  const haystack = `${subject}\n${bodyText}`
  const searchable = `${haystack}\n${input.html ?? ''}`

  const price = parsePrice(haystack)
  const ukPc = haystack.match(UK_POSTCODE_RE)
  const dePlz = haystack.match(DE_PLZ_RE)
  const postcode: string | null = ukPc ? `${ukPc[1]} ${ukPc[2]}`.toUpperCase() : dePlz?.[1] ? dePlz[1] : null
  const bedrooms = detectBedrooms(haystack)
  const propertyType = detectType(haystack)
  const countryCode = detectCountry(searchable, input.countryHint)
  const title = subject || firstMeaningfulLine(bodyText)
  const description = bodyText ? bodyText.slice(0, 600) : null

  const listingUrls = uniq((searchable.match(LISTING_URL_RE) ?? []).map(u => u.replace(/[).,]+$/, '')))
  const fallbackUrls = listingUrls.length
    ? []
    : uniq((searchable.match(ANY_URL_RE) ?? [])
        .map(u => u.replace(/[).,]+$/, ''))
        .filter(u => !/unsubscribe|abmelden|mailto:|\.(png|jpg|jpeg|gif|css|js)(\?|$)/i.test(u))
        .slice(0, 1))

  const base: Omit<ParsedListing, 'url'> = {
    title: title ?? null,
    priceText: price?.text ?? null,
    priceAmount: price?.amount ?? null,
    currency: price?.currency ?? null,
    location: postcode,
    postcode,
    countryCode,
    propertyType,
    bedrooms,
    description,
  }

  const urls = listingUrls.length ? listingUrls : fallbackUrls
  if (urls.length) {
    return urls.slice(0, 20).map(url => ({ ...base, url }))
  }

  // No URL — only emit a candidate when a genuine *property* signal is present
  // (a bare subject line alone is not a listing).
  const hasSignal = !!(price || postcode || bedrooms || propertyType)
  return hasSignal ? [{ ...base, url: null }] : []
}
