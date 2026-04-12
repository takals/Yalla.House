export type CountryConfig = {
  country_code: string
  default_locale: string
  supported_locales: string[]
  currency: string
  currency_minor_units: number
  postal_code_format: RegExp
  postal_code_prefix_length: number
  postal_code_label: string
  area_unit: 'sq_ft' | 'sq_m'
  default_timezone: string
  property_types: string[]
  agent_portal_sources: string[]
  legal_entity: string
  legal_tagline: string
  privacy_policy_url: string
  terms_url: string
  phone_country_code: string
  regions: Array<{ prefix: string; label: string; range?: string }>
}

const GB_REGIONS: CountryConfig['regions'] = [
  { prefix: 'E', label: 'East London' },
  { prefix: 'EC', label: 'City & East Central' },
  { prefix: 'N', label: 'North London' },
  { prefix: 'NW', label: 'North West London' },
  { prefix: 'SE', label: 'South East London' },
  { prefix: 'SW', label: 'South West London' },
  { prefix: 'W', label: 'West London' },
  { prefix: 'WC', label: 'West Central' },
  { prefix: 'M', label: 'Manchester' },
  { prefix: 'B', label: 'Birmingham' },
  { prefix: 'LS', label: 'Leeds' },
  { prefix: 'S', label: 'Sheffield' },
  { prefix: 'CF', label: 'Cardiff' },
  { prefix: 'EH', label: 'Edinburgh' },
  { prefix: 'G', label: 'Glasgow' },
  { prefix: 'BT', label: 'Belfast' },
  { prefix: 'PO', label: 'Portsmouth' },
  { prefix: 'SO', label: 'Southampton' },
  { prefix: 'OX', label: 'Oxford' },
  { prefix: 'CB', label: 'Cambridge' },
]

const DE_REGIONS: CountryConfig['regions'] = [
  { prefix: '10', label: 'Berlin', range: '10115–14199' },
  { prefix: '80', label: 'Munich', range: '80331–81929' },
  { prefix: '20', label: 'Hamburg', range: '20095–22769' },
  { prefix: '60', label: 'Frankfurt', range: '60311–60598' },
  { prefix: '50', label: 'Cologne', range: '50667–51149' },
  { prefix: '40', label: 'Düsseldorf', range: '40213–40627' },
  { prefix: '70', label: 'Stuttgart', range: '70173–70597' },
  { prefix: '04', label: 'Leipzig', range: '04103–04357' },
]

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  GB: {
    country_code: 'GB',
    default_locale: 'en-GB',
    supported_locales: ['en-GB', 'de-DE'],
    currency: 'GBP',
    currency_minor_units: 2,
    postal_code_format: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    postal_code_prefix_length: 2,
    postal_code_label: 'Postcode',
    area_unit: 'sq_ft',
    default_timezone: 'Europe/London',
    property_types: ['house', 'flat', 'apartment', 'villa', 'commercial', 'land', 'other'],
    agent_portal_sources: ['rightmove', 'zoopla', 'onthemarket', 'tpo', 'naea'],
    legal_entity: 'Yalla.House Ltd',
    legal_tagline: 'Sell your property. Keep every pound.',
    privacy_policy_url: 'https://yalla.house/privacy',
    terms_url: 'https://yalla.house/terms',
    phone_country_code: '+44',
    regions: GB_REGIONS,
  },
  DE: {
    country_code: 'DE',
    default_locale: 'de-DE',
    supported_locales: ['de-DE', 'en-GB'],
    currency: 'EUR',
    currency_minor_units: 2,
    postal_code_format: /^\d{5}$/,
    postal_code_prefix_length: 2,
    postal_code_label: 'PLZ',
    area_unit: 'sq_m',
    default_timezone: 'Europe/Berlin',
    property_types: ['house', 'flat', 'apartment', 'villa', 'commercial', 'land', 'other'],
    agent_portal_sources: ['immoscout24', 'immowelt', 'immonet', 'ivd'],
    legal_entity: 'Yalla.House GmbH',
    legal_tagline: 'Verkaufe deine Immobilie. Behalte jeden Euro.',
    privacy_policy_url: 'https://yalla.house/de/privacy',
    terms_url: 'https://yalla.house/de/terms',
    phone_country_code: '+49',
    regions: DE_REGIONS,
  },
}

export const DEFAULT_COUNTRY = 'GB'

export function getCountryConfig(countryCode: string): CountryConfig {
  const config = COUNTRY_CONFIGS[countryCode.toUpperCase()]
  if (!config) {
    return COUNTRY_CONFIGS[DEFAULT_COUNTRY]!
  }
  return config
}

export function formatCurrency(
  amountMinorUnits: number,
  currency: string,
  locale: string,
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amountMinorUnits / 100)
}
