// =============================================================================
// Immowelt Portal Connector
// API: https://api.immowelt.com/
// Auth: API Key (x-api-key header)
// Docs: https://developer.immowelt.com/
// Also syndicates to: immonet.de (same Axel Springer group)
// =============================================================================

import type {
  Listing,
  PortalConfig,
  PortalConnector,
  PortalCredentials,
  PortalFieldMapping,
  PortalPayload,
  PortalResponse,
  ValidationError,
  ValidationResult,
} from './types'
import { applyTransform, fromMinorUnits } from './types'

// Immowelt API base URLs
const IW_API_BASE_PROD    = 'https://api.immowelt.com/v1'
const IW_API_BASE_SANDBOX = 'https://api.sandbox.immowelt.com/v1'

export class ImmoweltConnector implements PortalConnector {
  readonly slug = 'immowelt'
  readonly displayName = 'Immowelt'
  readonly country = 'DE'

  private isSandbox(creds: PortalCredentials): boolean {
    return creds['sandbox'] === 'true' || process.env['IMMOWELT_SANDBOX'] === 'true'
  }

  private apiBase(creds: PortalCredentials): string {
    return this.isSandbox(creds) ? IW_API_BASE_SANDBOX : IW_API_BASE_PROD
  }

  private headers(creds: PortalCredentials): Record<string, string> {
    return {
      'x-api-key': creds['api_key'] ?? '',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  validateListing(listing: Listing, config: PortalConfig): ValidationResult {
    const errors: ValidationError[] = []

    if (!listing.title_de && !listing.title) {
      errors.push({
        field: 'title_de',
        message: 'Listing title is required',
        message_de: 'Titel ist erforderlich',
      })
    }

    if (!listing.description_de && !listing.description) {
      errors.push({
        field: 'description_de',
        message: 'Property description is required',
        message_de: 'Beschreibung ist erforderlich',
      })
    }

    if (!listing.size_sqm || listing.size_sqm <= 0) {
      errors.push({
        field: 'size_sqm',
        message: 'Living space (sqm) is required',
        message_de: 'Wohnfläche (m²) ist erforderlich',
      })
    }

    if (listing.intent === 'sale' && !listing.sale_price) {
      errors.push({
        field: 'sale_price',
        message: 'Sale price is required for sale listings',
        message_de: 'Kaufpreis ist für Verkaufsangebote erforderlich',
      })
    }

    if (listing.intent === 'rent' && !listing.rent_price) {
      errors.push({
        field: 'rent_price',
        message: 'Rental price is required for rental listings',
        message_de: 'Kaltmiete ist für Mietangebote erforderlich',
      })
    }

    if (!listing.postcode) {
      errors.push({
        field: 'postcode',
        message: 'Postcode is required',
        message_de: 'Postleitzahl ist erforderlich',
      })
    }

    if (!listing.city) {
      errors.push({
        field: 'city',
        message: 'City is required',
        message_de: 'Stadt ist erforderlich',
      })
    }

    // Photo count check
    const photos = (listing.media ?? []).filter(m => m.type === 'photo')
    if (photos.length < config.min_photos) {
      errors.push({
        field: 'media',
        message: `Minimum ${config.min_photos} photos required (${photos.length} uploaded)`,
        message_de: `Mindestens ${config.min_photos} Fotos erforderlich (${photos.length} hochgeladen)`,
      })
    }

    return { valid: errors.length === 0, errors }
  }

  transformListing(listing: Listing, mappings: PortalFieldMapping[]): PortalPayload {
    const isRent = listing.intent === 'rent'
    const isSale = listing.intent === 'sale'

    // Apply portal field mappings
    const mapped: Record<string, unknown> = {}
    for (const m of mappings) {
      const raw = (listing as unknown as Record<string, unknown>)[m.internal_field]
      mapped[m.portal_field] = applyTransform(raw as string, m.transform)
    }

    // Immowelt REST API payload structure
    const payload: Record<string, unknown> = {
      externalId: listing.place_id,

      // Core metadata
      title: listing.title_de ?? listing.title ?? '',
      description: listing.description_de ?? listing.description ?? '',

      // Location
      address: {
        zipCode: listing.postcode,
        city: listing.city,
        street: listing.address_line1,
        houseNumber: listing.address_line2 ?? '',
        showAddress: true,
      },

      // Property details
      area: listing.size_sqm,
      rooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      floor: listing.floor,
      totalFloors: listing.total_floors,
      yearBuilt: listing.construction_year,

      // Offer type
      offerType: isSale ? 'KAUF' : 'MIETE',

      // Pricing
      ...(isSale && listing.sale_price ? {
        price: fromMinorUnits(listing.sale_price, listing.currency),
        currency: listing.currency,
      } : {}),

      ...(isRent && listing.rent_price ? {
        coldRent: fromMinorUnits(listing.rent_price, listing.currency),
        additionalCosts: listing.service_charge
          ? fromMinorUnits(listing.service_charge, listing.currency)
          : undefined,
        deposit: listing.deposit_amount
          ? fromMinorUnits(listing.deposit_amount, listing.currency)
          : undefined,
        currency: listing.currency,
      } : {}),

      // Media
      images: (listing.media ?? [])
        .filter(m => m.type === 'photo')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m, i) => ({
          url: m.url,
          isPrimary: m.is_primary || i === 0,
          caption: m.caption_de ?? m.caption ?? '',
          order: i + 1,
        })),

      // Extra mapped fields
      ...mapped,
    }

    return payload as PortalPayload
  }

  async submitListing(payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse> {
    const base = this.apiBase(creds)
    const res = await fetch(`${base}/listings`, {
      method: 'POST',
      headers: this.headers(creds),
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { id?: string; errors?: Array<{ message: string }> }

    if (!res.ok) {
      const msg = data.errors?.[0]?.message ?? `HTTP ${res.status}`
      return { externalId: '', status: 'failed', message: msg }
    }

    const externalId = data['id'] ?? ''

    // Immowelt also requires a publish step
    await this.publishListing(externalId, creds)

    return {
      externalId,
      status: 'published',
      portalUrl: `https://www.immowelt.de/expose/${externalId}`,
    }
  }

  private async publishListing(externalId: string, creds: PortalCredentials): Promise<void> {
    const base = this.apiBase(creds)
    await fetch(`${base}/listings/${externalId}/publish`, {
      method: 'PUT',
      headers: this.headers(creds),
      body: JSON.stringify({ published: true }),
    })
  }

  async updateListing(externalId: string, payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse> {
    const base = this.apiBase(creds)
    const res = await fetch(`${base}/listings/${externalId}`, {
      method: 'PUT',
      headers: this.headers(creds),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json() as { errors?: Array<{ message: string }> }
      const msg = data.errors?.[0]?.message ?? `HTTP ${res.status}`
      return { externalId, status: 'failed', message: msg }
    }

    return {
      externalId,
      status: 'published',
      portalUrl: `https://www.immowelt.de/expose/${externalId}`,
    }
  }

  async withdrawListing(externalId: string, creds: PortalCredentials): Promise<void> {
    const base = this.apiBase(creds)
    await fetch(`${base}/listings/${externalId}/publish`, {
      method: 'PUT',
      headers: this.headers(creds),
      body: JSON.stringify({ published: false }),
    })
  }

  async getStatus(externalId: string, creds: PortalCredentials): Promise<{ status: string; portalUrl?: string }> {
    const base = this.apiBase(creds)
    const res = await fetch(`${base}/listings/${externalId}`, {
      headers: this.headers(creds),
    })

    if (!res.ok) return { status: 'unknown' }

    const data = await res.json() as { status?: string }
    const isPublished = data.status === 'ACTIVE' || data.status === 'PUBLISHED'

    return {
      status: isPublished ? 'published' : 'paused',
      portalUrl: `https://www.immowelt.de/expose/${externalId}`,
    }
  }
}
