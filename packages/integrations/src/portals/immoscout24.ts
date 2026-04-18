// =============================================================================
// ImmobilienScout24 Portal Connector
// API: https://api.immobilienscout24.de/restapi/
// Auth: OAuth 2.0 (client_credentials grant)
// Docs: https://developer.immobilienscout24.de/
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

// IS24 API base URLs
const IS24_API_BASE_PROD = 'https://rest.immobilienscout24.de/restapi/api/offer/v1.0'
const IS24_API_BASE_SANDBOX = 'https://rest.sandbox-immobilienscout24.de/restapi/api/offer/v1.0'
const IS24_AUTH_URL_PROD = 'https://api.immobilienscout24.de/authorize/oauth/token'
const IS24_AUTH_URL_SANDBOX = 'https://rest.sandbox-immobilienscout24.de/restapi/security/oauth/token'

interface IS24Token {
  access_token: string
  expires_at: number  // timestamp
}

// Simple in-memory token cache (per process)
let tokenCache: IS24Token | null = null

export class ImmobilienScout24Connector implements PortalConnector {
  readonly slug = 'immoscout24'
  readonly displayName = 'ImmobilienScout24'
  readonly country = 'DE'

  private isSandbox(creds: PortalCredentials): boolean {
    return creds['sandbox'] === 'true' || process.env['IMMOSCOUT24_SANDBOX'] === 'true'
  }

  private apiBase(creds: PortalCredentials): string {
    return this.isSandbox(creds) ? IS24_API_BASE_SANDBOX : IS24_API_BASE_PROD
  }

  private async getAccessToken(creds: PortalCredentials): Promise<string> {
    const now = Date.now()
    if (tokenCache && tokenCache.expires_at > now + 60_000) {
      return tokenCache.access_token
    }

    const authUrl = this.isSandbox(creds) ? IS24_AUTH_URL_SANDBOX : IS24_AUTH_URL_PROD
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: creds['client_id'] ?? '',
      client_secret: creds['client_secret'] ?? '',
    })

    const res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) {
      throw new Error(`IS24 auth failed: ${res.status} ${await res.text()}`)
    }

    const data = await res.json() as { access_token: string; expires_in: number }
    tokenCache = {
      access_token: data.access_token,
      expires_at: now + data.expires_in * 1000,
    }
    return data.access_token
  }

  validateListing(listing: Listing, config: PortalConfig): ValidationResult {
    const errors: ValidationError[] = []

    // IS24-specific validation
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

    // Energy certificate required for DE (country_fields.energy_class)
    const fields = listing.country_fields ?? {}
    if (!fields['energy_class']) {
      errors.push({
        field: 'country_fields.energy_class',
        message: 'Energy certificate class is required for German listings',
        message_de: 'Energieausweis ist für deutsche Angebote Pflicht',
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
    const fields = listing.country_fields ?? {}
    const isRent = listing.intent === 'rent'
    const isSale = listing.intent === 'sale'

    // Apply portal field mappings
    const mapped: Record<string, unknown> = {}
    for (const m of mappings) {
      const raw = (listing as unknown as Record<string, unknown>)[m.internal_field]
      mapped[m.portal_field] = applyTransform(raw as string, m.transform)
    }

    // IS24 REST API v1.0 payload structure
    const payload: Record<string, unknown> = {
      externalRef: listing.place_id,

      // Core object
      '@xsi.type': isRent ? 'common:ApartmentRent' : 'common:ApartmentBuy',
      headline: listing.title_de ?? listing.title ?? '',
      description: listing.description_de ?? listing.description ?? '',
      address: {
        postcode: listing.postcode,
        city: listing.city,
        street: listing.address_line1,
        streetNumber: listing.address_line2 ?? '',
        preciseHouseNumber: true,
      },

      // Area
      livingSpace: listing.size_sqm,
      numberOfRooms: listing.bedrooms,
      numberOfBathrooms: listing.bathrooms,
      floor: listing.floor,
      numberOfFloors: listing.total_floors,
      constructionYear: listing.construction_year,

      // Energy
      energyCertificate: {
        energyCertificateAvailability: fields['energy_class'] ? 'AVAILABLE' : 'NOT_REQUIRED',
        energyConsumptionContainsWarmWater: false,
        effiencyClass: fields['energy_class'] ?? 'NOT_APPLICABLE',
      },

      // Pricing
      ...(isSale && listing.sale_price ? {
        price: {
          value: fromMinorUnits(listing.sale_price, listing.currency),
          currency: listing.currency,
          priceIntervalType: 'ONE_TIME_CHARGE',
        },
      } : {}),

      ...(isRent && listing.rent_price ? {
        baseRent: fromMinorUnits(listing.rent_price, listing.currency),
        additionalCosts: listing.service_charge ? fromMinorUnits(listing.service_charge, listing.currency) : undefined,
        deposit: listing.deposit_amount ? fromMinorUnits(listing.deposit_amount, listing.currency) : undefined,
        currency: listing.currency,
      } : {}),

      // Media
      attachments: (listing.media ?? [])
        .filter(m => m.type === 'photo')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m, i) => ({
          '@xsi.type': 'common:Picture',
          urls: [{ url: [{ '@scale': 'SCALE_800x600', '#text': m.url }] }],
          isPrimary: m.is_primary || i === 0,
          title: m.caption_de ?? m.caption ?? '',
          orderId: i + 1,
        })),

      // Extra mapped fields
      ...mapped,
    }

    return payload as PortalPayload
  }

  async submitListing(payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse> {
    const token = await this.getAccessToken(creds)
    const base = this.apiBase(creds)

    const res = await fetch(`${base}/user/me/realestate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { 'common:messages'?: Array<{ 'message': string }>; id?: string }

    if (!res.ok) {
      const msg = data['common:messages']?.[0]?.['message'] ?? `HTTP ${res.status}`
      return { externalId: '', status: 'failed', message: msg }
    }

    const externalId = data['id'] ?? ''
    // Publish the listing (IS24 creates as INACTIVE by default)
    await this.publishListing(externalId, token, base)

    return {
      externalId,
      status: 'published',
      portalUrl: `https://www.immobilienscout24.de/expose/${externalId}`,
    }
  }

  private async publishListing(externalId: string, token: string, base: string): Promise<void> {
    await fetch(`${base}/user/me/realestate/${externalId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publishObject: { publishChannel: [{ id: 10000 }] } }),
    })
  }

  async updateListing(externalId: string, payload: PortalPayload, creds: PortalCredentials): Promise<PortalResponse> {
    const token = await this.getAccessToken(creds)
    const base = this.apiBase(creds)

    const res = await fetch(`${base}/user/me/realestate/${externalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json() as { 'common:messages'?: Array<{ 'message': string }> }
      const msg = data['common:messages']?.[0]?.['message'] ?? `HTTP ${res.status}`
      return { externalId, status: 'failed', message: msg }
    }

    return {
      externalId,
      status: 'published',
      portalUrl: `https://www.immobilienscout24.de/expose/${externalId}`,
    }
  }

  async withdrawListing(externalId: string, creds: PortalCredentials): Promise<void> {
    const token = await this.getAccessToken(creds)
    const base = this.apiBase(creds)

    await fetch(`${base}/user/me/realestate/${externalId}/publish/10000`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  async getStatus(externalId: string, creds: PortalCredentials): Promise<{ status: string; portalUrl?: string }> {
    const token = await this.getAccessToken(creds)
    const base = this.apiBase(creds)

    const res = await fetch(`${base}/user/me/realestate/${externalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!res.ok) return { status: 'unknown' }

    const data = await res.json() as { publishedChannels?: Array<{ id: number }> }
    const isPublished = data.publishedChannels?.some(c => c.id === 10000) ?? false

    return {
      status: isPublished ? 'published' : 'paused',
      portalUrl: `https://www.immobilienscout24.de/expose/${externalId}`,
    }
  }
}
