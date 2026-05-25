// =============================================================================
// HubSpot Contacts — upsert by email
// =============================================================================

import { HubSpotClient, HubSpotError } from './client'
import type {
  HubSpotContact,
  HubSpotProperties,
  YallaContactInput,
} from './types'

/**
 * Translate a Yalla user shape into the flat HubSpot property map. Skips
 * undefined values so a partial update doesn't overwrite existing data with
 * blanks.
 */
export function mapYallaToHubSpot(input: YallaContactInput): HubSpotProperties {
  const out: HubSpotProperties = { email: input.email }
  const set = (key: string, value: unknown) => {
    if (value === undefined || value === null) return
    if (value instanceof Date) {
      out[key] = value.toISOString()
      return
    }
    out[key] = String(value)
  }

  set('firstname', input.firstName)
  set('lastname', input.lastName)
  set('phone', input.phone)

  set('yh_user_role', input.role)
  set('yh_market', input.market)
  set('yh_locale', input.locale)
  set('yh_referral_source', input.referralSource)
  set('yh_signup_at', input.signupAt)
  set('yh_last_active_at', input.lastActiveAt)

  set('yh_listing_count', input.listingCount)
  set('yh_listing_value_total', input.listingValueTotal)
  set('yh_listing_status', input.listingStatus)

  if (input.portals) {
    set('yh_portal_immoscout', input.portals.immoscout)
    set('yh_portal_immowelt', input.portals.immowelt)
    set('yh_portal_rightmove', input.portals.rightmove)
    set('yh_portal_zoopla', input.portals.zoopla)
  }

  set('yh_offers_made', input.offersMade)
  set('yh_viewings_attended', input.viewingsAttended)
  set('yh_budget_min', input.budgetMin)
  set('yh_budget_max', input.budgetMax)

  set('yh_payouts_total', input.payoutsTotal)

  return out
}

/**
 * Upsert a contact by email. Uses PATCH with idProperty=email; falls back to
 * POST if the contact doesn't yet exist. Returns the HubSpot contact record.
 */
export async function upsertContact(
  client: HubSpotClient,
  input: YallaContactInput,
): Promise<HubSpotContact> {
  const properties = mapYallaToHubSpot(input)
  const emailParam = encodeURIComponent(input.email)
  try {
    return await client.patch<HubSpotContact>(
      `/crm/v3/objects/contacts/${emailParam}?idProperty=email`,
      { properties },
    )
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 404) {
      return await client.post<HubSpotContact>('/crm/v3/objects/contacts', {
        properties,
      })
    }
    throw err
  }
}

/** Look up a single contact by email. Returns null if not found. */
export async function getContactByEmail(
  client: HubSpotClient,
  email: string,
  propertyNames?: string[],
): Promise<HubSpotContact | null> {
  const params = new URLSearchParams({ idProperty: 'email' })
  if (propertyNames?.length) params.set('properties', propertyNames.join(','))
  try {
    return await client.get<HubSpotContact>(
      `/crm/v3/objects/contacts/${encodeURIComponent(email)}?${params.toString()}`,
    )
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 404) return null
    throw err
  }
}

/** Delete a contact by email (GDPR erasure request). */
export async function deleteContactByEmail(
  client: HubSpotClient,
  email: string,
): Promise<void> {
  const contact = await getContactByEmail(client, email, ['email'])
  if (!contact) return
  await client.delete(`/crm/v3/objects/contacts/${contact.id}`)
}
