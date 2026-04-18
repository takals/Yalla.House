import { describe, it, expect } from 'vitest'
import { ImmobilienScout24Connector } from '../immoscout24'
import { ImmoweltConnector } from '../immowelt'
import { connectorRegistry } from '../registry'
import { applyTransform, fromMinorUnits } from '../types'
import type { Listing, PortalConfig, PortalFieldMapping } from '../types'

// ============================================================================
// Test Fixtures
// ============================================================================

const validListing = (): Listing => ({
  id: 'uuid-123',
  place_id: 'yh_de_abc123',
  country_code: 'DE',
  intent: 'sale',
  status: 'active',
  address_line1: 'Musterstraße 1',
  address_line2: null,
  city: 'Berlin',
  region: 'Berlin',
  postcode: '10115',
  lat: 52.52,
  lng: 13.405,
  property_type: 'apartment',
  bedrooms: 3,
  bathrooms: 1,
  size_sqm: 85,
  floor: 2,
  total_floors: 5,
  construction_year: 1990,
  tenure: null,
  sale_price: 35000000, // 350,000.00 EUR in cents
  rent_price: null,
  rent_period: null,
  service_charge: null,
  deposit_amount: null,
  currency: 'EUR',
  price_qualifier: null,
  title: 'Bright 3-room apartment in Mitte',
  title_de: 'Helle 3-Zimmer-Wohnung in Mitte',
  description: 'A lovely apartment...',
  description_de: 'Eine schöne Wohnung...',
  key_features: null,
  key_features_de: null,
  country_fields: { energy_class: 'B' },
  media: [
    {
      id: 'm1',
      type: 'photo',
      url: 'https://cdn.yalla.house/img1.jpg',
      thumb_url: null,
      caption: null,
      caption_de: null,
      sort_order: 1,
      is_primary: true,
    },
    {
      id: 'm2',
      type: 'photo',
      url: 'https://cdn.yalla.house/img2.jpg',
      thumb_url: null,
      caption: null,
      caption_de: null,
      sort_order: 2,
      is_primary: false,
    },
    {
      id: 'm3',
      type: 'photo',
      url: 'https://cdn.yalla.house/img3.jpg',
      thumb_url: null,
      caption: null,
      caption_de: null,
      sort_order: 3,
      is_primary: false,
    },
  ],
})

const is24Config = (): PortalConfig => ({
  id: 'portal-is24',
  slug: 'immoscout24',
  display_name: 'ImmobilienScout24',
  feed_format: 'api',
  auth_type: 'oauth2',
  cost_per_listing: 4990,
  currency: 'EUR',
  min_photos: 3,
  max_photos: 50,
  mappings: [],
})

const iwConfig = (): PortalConfig => ({
  id: 'portal-iw',
  slug: 'immowelt',
  display_name: 'Immowelt',
  feed_format: 'api',
  auth_type: 'api_key',
  cost_per_listing: 2990,
  currency: 'EUR',
  min_photos: 3,
  max_photos: 30,
  mappings: [],
})

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('Helper Functions', () => {
  describe('fromMinorUnits', () => {
    it('converts EUR cents to decimal', () => {
      expect(fromMinorUnits(35000000, 'EUR')).toBe(350000)
    })

    it('converts zero cents to zero', () => {
      expect(fromMinorUnits(0, 'EUR')).toBe(0)
    })

    it('handles small values correctly', () => {
      expect(fromMinorUnits(150, 'EUR')).toBe(1.5)
    })
  })

  describe('applyTransform', () => {
    it('returns mapped value when transform exists', () => {
      const transform = { sale: 'KAUF', rent: 'MIETE' }
      expect(applyTransform('sale', transform)).toBe('KAUF')
    })

    it('returns original value when not in transform map', () => {
      const transform = { sale: 'KAUF', rent: 'MIETE' }
      expect(applyTransform('unknown', transform)).toBe('unknown')
    })

    it('returns null when value is null', () => {
      const transform = { sale: 'KAUF', rent: 'MIETE' }
      expect(applyTransform(null, transform)).toBe(null)
    })

    it('returns undefined when value is undefined', () => {
      const transform = { sale: 'KAUF', rent: 'MIETE' }
      expect(applyTransform(undefined, transform)).toBeUndefined()
    })

    it('returns null when transform is null', () => {
      expect(applyTransform('sale', null)).toBe('sale')
    })

    it('returns undefined when transform is undefined', () => {
      expect(applyTransform('sale', undefined)).toBe('sale')
    })
  })
})

// ============================================================================
// ImmobilienScout24 Connector Tests
// ============================================================================

describe('ImmobilienScout24Connector', () => {
  const connector = new ImmobilienScout24Connector()
  const config = is24Config()

  describe('validateListing', () => {
    it('valid listing passes validation', () => {
      const listing = validListing()
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('missing title_de fails validation', () => {
      const listing = validListing()
      listing.title_de = null
      listing.title = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'title_de' })
      )
    })

    it('missing description fails validation', () => {
      const listing = validListing()
      listing.description_de = null
      listing.description = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'description_de' })
      )
    })

    it('size_sqm = 0 fails validation', () => {
      const listing = validListing()
      listing.size_sqm = 0
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'size_sqm' })
      )
    })

    it('sale listing without sale_price fails validation', () => {
      const listing = validListing()
      listing.intent = 'sale'
      listing.sale_price = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'sale_price' })
      )
    })

    it('rent listing without rent_price fails validation', () => {
      const listing = validListing()
      listing.intent = 'rent'
      listing.rent_price = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'rent_price' })
      )
    })

    it('missing postcode fails validation', () => {
      const listing = validListing()
      listing.postcode = ''
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'postcode' })
      )
    })

    it('missing energy_class in country_fields fails validation', () => {
      const listing = validListing()
      listing.country_fields = {}
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'country_fields.energy_class',
        })
      )
    })

    it('too few photos fails validation', () => {
      const listing = validListing()
      listing.media = []
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'media' })
      )
    })

    it('multiple errors returned at once', () => {
      const listing = validListing()
      listing.title_de = null
      listing.title = null
      listing.description_de = null
      listing.description = null
      listing.size_sqm = 0
      listing.postcode = ''
      listing.country_fields = {}
      listing.media = []

      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('transformListing', () => {
    it('sale listing produces correct payload structure', () => {
      const listing = validListing()
      listing.intent = 'sale'
      const payload = connector.transformListing(listing, [])

      expect(payload['@xsi.type']).toBe('common:ApartmentBuy')
      expect(payload.externalRef).toBe('yh_de_abc123')
      expect(payload.headline).toBe('Helle 3-Zimmer-Wohnung in Mitte')
      expect(payload.description).toBe('Eine schöne Wohnung...')
      expect((payload.price as { currency: string }).currency).toBe('EUR')
      expect((payload.price as { value: number }).value).toBe(350000) // converted from cents
    })

    it('rent listing produces correct structure', () => {
      const listing = validListing()
      listing.intent = 'rent'
      listing.rent_price = 150000 // 1500.00 EUR
      listing.service_charge = 20000 // 200.00 EUR
      listing.deposit_amount = 450000 // 4500.00 EUR

      const payload = connector.transformListing(listing, [])

      expect(payload['@xsi.type']).toBe('common:ApartmentRent')
      expect(payload.baseRent).toBe(1500)
      expect(payload.additionalCosts).toBe(200)
      expect(payload.deposit).toBe(4500)
      expect(payload.currency).toBe('EUR')
    })

    it('place_id maps to externalRef', () => {
      const listing = validListing()
      const payload = connector.transformListing(listing, [])
      expect(payload.externalRef).toBe('yh_de_abc123')
    })

    it('headline uses title_de', () => {
      const listing = validListing()
      listing.title_de = 'German Title'
      listing.title = 'English Title'
      const payload = connector.transformListing(listing, [])
      expect(payload.headline).toBe('German Title')
    })

    it('headline falls back to title if title_de missing', () => {
      const listing = validListing()
      listing.title_de = null
      listing.title = 'English Title'
      const payload = connector.transformListing(listing, [])
      expect(payload.headline).toBe('English Title')
    })

    it('photos sorted by sort_order', () => {
      const listing = validListing()
      listing.media = [
        {
          id: 'm3',
          type: 'photo',
          url: 'https://cdn.yalla.house/img3.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 3,
          is_primary: false,
        },
        {
          id: 'm1',
          type: 'photo',
          url: 'https://cdn.yalla.house/img1.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 1,
          is_primary: true,
        },
        {
          id: 'm2',
          type: 'photo',
          url: 'https://cdn.yalla.house/img2.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 2,
          is_primary: false,
        },
      ]

      const payload = connector.transformListing(listing, [])
      const attachments = payload.attachments as Array<{
        urls: Array<{ url: Array<{ '@scale': string; '#text': string }> }>
      }>
      expect(attachments[0]!.urls[0]!.url[0]!['#text']).toBe(
        'https://cdn.yalla.house/img1.jpg'
      )
      expect(attachments[1]!.urls[0]!.url[0]!['#text']).toBe(
        'https://cdn.yalla.house/img2.jpg'
      )
      expect(attachments[2]!.urls[0]!.url[0]!['#text']).toBe(
        'https://cdn.yalla.house/img3.jpg'
      )
    })

    it('first photo marked as primary when is_primary not set', () => {
      const listing = validListing()
      listing.media = [
        {
          id: 'm1',
          type: 'photo',
          url: 'https://cdn.yalla.house/img1.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 1,
          is_primary: false,
        },
        {
          id: 'm2',
          type: 'photo',
          url: 'https://cdn.yalla.house/img2.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 2,
          is_primary: false,
        },
      ]

      const payload = connector.transformListing(listing, [])
      const attachments = payload.attachments as Array<{ isPrimary: boolean }>
      expect(attachments[0]!.isPrimary).toBe(true)
      expect(attachments[1]!.isPrimary).toBe(false)
    })

    it('address fields mapped correctly', () => {
      const listing = validListing()
      listing.address_line1 = 'Musterstraße 10'
      listing.address_line2 = '3. OG'
      listing.city = 'München'
      listing.postcode = '80331'

      const payload = connector.transformListing(listing, [])
      const addr = payload.address as Record<string, unknown>
      expect(addr.street).toBe('Musterstraße 10')
      expect(addr.streetNumber).toBe('3. OG')
      expect(addr.city).toBe('München')
      expect(addr.postcode).toBe('80331')
    })

    it('energy certificate included in payload', () => {
      const listing = validListing()
      listing.country_fields = { energy_class: 'A' }

      const payload = connector.transformListing(listing, [])
      const ec = payload.energyCertificate as Record<string, unknown>
      expect(ec.energyCertificateAvailability).toBe('AVAILABLE')
      expect(ec.effiencyClass).toBe('A')
    })
  })

  describe('slug and metadata', () => {
    it('has correct slug', () => {
      expect(connector.slug).toBe('immoscout24')
    })

    it('has correct displayName', () => {
      expect(connector.displayName).toBe('ImmobilienScout24')
    })

    it('has correct country', () => {
      expect(connector.country).toBe('DE')
    })
  })
})

// ============================================================================
// Immowelt Connector Tests
// ============================================================================

describe('ImmoweltConnector', () => {
  const connector = new ImmoweltConnector()
  const config = iwConfig()

  describe('validateListing', () => {
    it('valid listing passes validation', () => {
      const listing = validListing()
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('missing title fails validation', () => {
      const listing = validListing()
      listing.title_de = null
      listing.title = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'title_de' })
      )
    })

    it('missing description fails validation', () => {
      const listing = validListing()
      listing.description_de = null
      listing.description = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'description_de' })
      )
    })

    it('missing city fails validation', () => {
      const listing = validListing()
      listing.city = ''
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'city' })
      )
    })

    it('too few photos fails validation', () => {
      const listing = validListing()
      listing.media = [
        {
          id: 'm1',
          type: 'photo',
          url: 'https://cdn.yalla.house/img1.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 1,
          is_primary: true,
        },
      ]

      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'media' })
      )
    })

    it('rent listing without rent_price fails validation', () => {
      const listing = validListing()
      listing.intent = 'rent'
      listing.rent_price = null
      const result = connector.validateListing(listing, config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'rent_price' })
      )
    })
  })

  describe('transformListing', () => {
    it('sale listing produces offerType KAUF with price in decimal', () => {
      const listing = validListing()
      listing.intent = 'sale'
      const payload = connector.transformListing(listing, [])

      expect(payload.offerType).toBe('KAUF')
      expect(payload.price).toBe(350000) // converted from cents
      expect(payload.currency).toBe('EUR')
    })

    it('rent listing produces offerType MIETE with coldRent in decimal', () => {
      const listing = validListing()
      listing.intent = 'rent'
      listing.rent_price = 150000 // 1500.00 EUR
      const payload = connector.transformListing(listing, [])

      expect(payload.offerType).toBe('MIETE')
      expect(payload.coldRent).toBe(1500)
      expect(payload.currency).toBe('EUR')
    })

    it('externalId maps to place_id', () => {
      const listing = validListing()
      const payload = connector.transformListing(listing, [])
      expect(payload.externalId).toBe('yh_de_abc123')
    })

    it('title uses title_de', () => {
      const listing = validListing()
      listing.title_de = 'German Title'
      listing.title = 'English Title'
      const payload = connector.transformListing(listing, [])
      expect(payload.title).toBe('German Title')
    })

    it('images sorted by sort_order', () => {
      const listing = validListing()
      listing.media = [
        {
          id: 'm3',
          type: 'photo',
          url: 'https://cdn.yalla.house/img3.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 3,
          is_primary: false,
        },
        {
          id: 'm1',
          type: 'photo',
          url: 'https://cdn.yalla.house/img1.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 1,
          is_primary: true,
        },
        {
          id: 'm2',
          type: 'photo',
          url: 'https://cdn.yalla.house/img2.jpg',
          thumb_url: null,
          caption: null,
          caption_de: null,
          sort_order: 2,
          is_primary: false,
        },
      ]

      const payload = connector.transformListing(listing, [])
      const images = payload.images as Array<{ url: string }>
      expect(images[0]!.url).toBe('https://cdn.yalla.house/img1.jpg')
      expect(images[1]!.url).toBe('https://cdn.yalla.house/img2.jpg')
      expect(images[2]!.url).toBe('https://cdn.yalla.house/img3.jpg')
    })

    it('address fields mapped correctly', () => {
      const listing = validListing()
      listing.address_line1 = 'Musterstraße 10'
      listing.address_line2 = '3. OG'
      listing.city = 'München'
      listing.postcode = '80331'

      const payload = connector.transformListing(listing, [])
      const addr = payload.address as Record<string, unknown>
      expect(addr.street).toBe('Musterstraße 10')
      expect(addr.houseNumber).toBe('3. OG')
      expect(addr.city).toBe('München')
      expect(addr.zipCode).toBe('80331')
    })

    it('rent listing includes additional costs and deposit', () => {
      const listing = validListing()
      listing.intent = 'rent'
      listing.rent_price = 150000
      listing.service_charge = 20000
      listing.deposit_amount = 450000

      const payload = connector.transformListing(listing, [])
      expect(payload.coldRent).toBe(1500)
      expect(payload.additionalCosts).toBe(200)
      expect(payload.deposit).toBe(4500)
    })
  })

  describe('slug and metadata', () => {
    it('has correct slug', () => {
      expect(connector.slug).toBe('immowelt')
    })

    it('has correct displayName', () => {
      expect(connector.displayName).toBe('Immowelt')
    })

    it('has correct country', () => {
      expect(connector.country).toBe('DE')
    })
  })
})

// ============================================================================
// Registry Tests
// ============================================================================

describe('Connector Registry', () => {
  it('has immoscout24 connector registered', () => {
    expect(connectorRegistry.has('immoscout24')).toBe(true)
  })

  it('has immowelt connector registered', () => {
    expect(connectorRegistry.has('immowelt')).toBe(true)
  })

  it('returns correct connector for immoscout24', () => {
    const connector = connectorRegistry.get('immoscout24')
    expect(connector.slug).toBe('immoscout24')
  })

  it('returns correct connector for immowelt', () => {
    const connector = connectorRegistry.get('immowelt')
    expect(connector.slug).toBe('immowelt')
  })

  it('throws error for non-existent connector', () => {
    expect(() => connectorRegistry.get('nonexistent')).toThrow()
  })

  it('list returns all registered connectors', () => {
    const list = connectorRegistry.list()
    expect(list.length).toBe(2)
    expect(list.some(c => c.slug === 'immoscout24')).toBe(true)
    expect(list.some(c => c.slug === 'immowelt')).toBe(true)
  })
})
