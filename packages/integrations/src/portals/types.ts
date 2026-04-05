// =============================================================================
// Portal Connector Types
// =============================================================================

export interface Listing {
  id: string
  place_id: string
  country_code: string
  intent: 'sale' | 'rent' | 'both'
  status: string
  address_line1: string
  address_line2?: string | null
  city: string
  region?: string | null
  postcode: string
  lat?: number | null
  lng?: number | null
  property_type: string
  bedrooms?: number | null
  bathrooms?: number | null
  size_sqm?: number | null
  floor?: number | null
  total_floors?: number | null
  construction_year?: number | null
  tenure?: string | null
  sale_price?: number | null
  rent_price?: number | null
  rent_period?: string | null
  nebenkosten?: number | null
  kaution?: number | null
  currency: string
  price_qualifier?: string | null
  title?: string | null
  title_de?: string | null
  description?: string | null
  description_de?: string | null
  key_features?: string[] | null
  key_features_de?: string[] | null
  country_fields?: Record<string, unknown>
  media?: ListingMedia[]
}

export interface ListingMedia {
  id: string
  type: 'photo' | 'floorplan' | 'energy_cert' | 'video' | 'document' | '360_tour'
  url: string
  thumb_url?: string | null
  caption?: string | null
  caption_de?: string | null
  sort_order: number
  is_primary: boolean
}

export interface PortalConfig {
  id: string
  slug: string
  display_name: string
  feed_format: 'xml' | 'json' | 'csv' | 'api'
  auth_type: 'basic' | 'oauth2' | 'api_key' | 'none'
  cost_per_listing?: number | null
  currency: string
  min_photos: number
  max_photos: number
  mappings: PortalFieldMapping[]
}

export interface PortalFieldMapping {
  internal_field: string
  portal_field: string
  transform?: Record<string, string> | null
  is_required: boolean
}

export interface PortalCredentials {
  [key_name: string]: string
}

export interface ValidationError {
  field: string
  message: string
  message_de?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface PortalPayload {
  externalRef: string  // place_id — our stable ID
  [key: string]: unknown
}

export interface PortalResponse {
  externalId: string
  status: 'published' | 'pending' | 'failed'
  portalUrl?: string
  message?: string
}

// The central abstraction all portal connectors must implement
export interface PortalConnector {
  readonly slug: string
  readonly displayName: string
  readonly country: string

  /** Validate listing data against portal-specific requirements */
  validateListing(listing: Listing, config: PortalConfig): ValidationResult

  /** Transform internal listing to portal-specific payload */
  transformListing(listing: Listing, mappings: PortalFieldMapping[]): PortalPayload

  /** Submit a new listing to the portal */
  submitListing(payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse>

  /** Update an existing published listing */
  updateListing(externalId: string, payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse>

  /** Withdraw / unpublish a listing */
  withdrawListing(externalId: string, creds: PortalCredentials): Promise<void>

  /** Check current status of a submitted listing */
  getStatus(externalId: string, creds: PortalCredentials): Promise<{ status: string; portalUrl?: string }>
}

// Mapping transform helper
export function applyTransform(
  value: string | number | null | undefined,
  transform: Record<string, string> | null | undefined
): string | number | null | undefined {
  if (!transform || value === null || value === undefined) return value
  const str = String(value)
  return transform[str] ?? value
}

// Price conversion helper (minor units → decimal)
export function fromMinorUnits(amount: number, currency: string): number {
  // EUR, GBP etc. all use 2 decimal places
  return amount / 100
}
