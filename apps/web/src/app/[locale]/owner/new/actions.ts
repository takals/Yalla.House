'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { countryFromLocale } from '@/lib/detect-country'
import { getCountryConfig } from '@/lib/country-config'

export interface WizardPayload {
  property_type: string
  intent: string
  address_line1: string
  address_line2: string
  postcode: string
  city: string
  size_sqm: string
  rooms: string
  bedrooms: string
  bathrooms: string
  floor: string
  total_floors: string
  construction_year: string
  energy_class: string
  title_de: string
  description_de: string
  sale_price: string
  price_qualifier: string
  rent_price: string
  service_charge: string
  deposit_amount: string
  ownerId: string
  locale: string
}

export async function createListingAction(
  payload: WizardPayload
): Promise<{ error: string } | { authRequired: true } | undefined> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (auth.userId !== payload.ownerId) {
    return { error: 'Not authorized' }
  }

  // Resolve country + currency from locale
  const resolvedCountry = countryFromLocale(payload.locale)
  const config = getCountryConfig(resolvedCountry)

  const supabase = await createClient()
  // Ensure public.users row exists (FK required by listings)
  await (supabase.from('users') as any).upsert(
    { id: auth.userId, email: auth.email, language: payload.locale, country_code: resolvedCountry },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  const toMinorUnits = (val: string): number | null => {
    const n = parseFloat(val)
    return isNaN(n) || n <= 0 ? null : Math.round(n * 100)
  }

  const toInt = (val: string): number | null => {
    const n = parseInt(val, 10)
    return isNaN(n) ? null : n
  }

  const toFloat = (val: string): number | null => {
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  const isFlat =
    payload.property_type === 'flat' || payload.property_type === 'apartment'

  const countryFields: Record<string, unknown> = {}
  if (payload.rooms) countryFields['rooms'] = parseFloat(payload.rooms)
  if (payload.energy_class) countryFields['energy_class'] = payload.energy_class

  const { data: newListing, error } = await (supabase.from('listings') as any).insert({
    owner_id: auth.userId,
    country_code: resolvedCountry,
    currency: config.currency,
    status: 'draft',
    intent: payload.intent as 'sale' | 'rent' | 'both',
    property_type: payload.property_type as
      | 'house' | 'flat' | 'apartment' | 'villa'
      | 'commercial' | 'land' | 'other',
    address_line1: payload.address_line1,
    address_line2: payload.address_line2 || null,
    postcode: payload.postcode,
    city: payload.city,
    region: null,
    title_de: payload.title_de,
    title: payload.title_de,
    description_de: payload.description_de || null,
    size_sqm: toFloat(payload.size_sqm),
    bedrooms: toInt(payload.bedrooms),
    bathrooms: toInt(payload.bathrooms),
    floor: isFlat ? toInt(payload.floor) : null,
    total_floors: isFlat ? toInt(payload.total_floors) : null,
    construction_year: toInt(payload.construction_year),
    sale_price: toMinorUnits(payload.sale_price),
    rent_price: toMinorUnits(payload.rent_price),
    price_qualifier: (payload.price_qualifier as 'fixed_price' | 'vb' | null) || null,
    service_charge: toMinorUnits(payload.service_charge),
    deposit_amount: toMinorUnits(payload.deposit_amount),
    country_fields: countryFields,
    portal_status: {},
  }).select('id').single()

  if (error) {
    console.error('Listing creation error:', error)
    return { error: error.message || 'Save failed. Please try again.' }
  }

  // Redirect to activation wizard instead of plain dashboard
  const listingId = newListing?.id
  redirect(listingId ? `/owner/${listingId}/activate` : '/owner')
}
