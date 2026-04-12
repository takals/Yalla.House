'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface WizardPayload {
  property_type: string
  intent: string
  address_line1: string
  address_line2: string
  postcode: string
  city: string
  region: string
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
  nebenkosten: string
  kaution: string
  ownerId: string
}

export async function createListingAction(
  payload: WizardPayload
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== payload.ownerId) {
    return { error: 'Nicht autorisiert' }
  }

  // Ensure public.users row exists (FK required by listings)
  await (supabase.from('users') as any).upsert(
    { id: user.id, email: user.email ?? '', language: 'de' },
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

  const { error } = await (supabase.from('listings') as any).insert({
    owner_id: user.id,
    country_code: 'DE',
    currency: 'EUR',
    status: 'draft',
    intent: payload.intent as 'sale' | 'rent' | 'both',
    property_type: payload.property_type as
      | 'house' | 'flat' | 'apartment' | 'villa'
      | 'commercial' | 'land' | 'other',
    address_line1: payload.address_line1,
    address_line2: payload.address_line2 || null,
    postcode: payload.postcode,
    city: payload.city,
    region: payload.region || null,
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
    nebenkosten: toMinorUnits(payload.nebenkosten),
    kaution: toMinorUnits(payload.kaution),
    country_fields: countryFields,
    portal_status: {},
  })

  if (error) {
    console.error('Listing creation error:', error)
    return { error: error.message || 'Fehler beim Speichern. Bitte versuchen Sie es erneut.' }
  }

  redirect('/owner')
}
