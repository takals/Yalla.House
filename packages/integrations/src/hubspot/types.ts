// =============================================================================
// HubSpot Integration Types
// =============================================================================

export type YallaUserRole =
  | 'owner'
  | 'hunter'
  | 'agent'
  | 'partner'
  | 'referrer'
  | 'admin'
  | 'other'

export type YallaMarket = 'DE' | 'UK' | 'both' | 'undecided'

export type YallaLocale = 'de' | 'en'

export type YallaListingStatus =
  | 'none'
  | 'draft'
  | 'active'
  | 'under_offer'
  | 'sold'
  | 'withdrawn'

export type YallaReferralSource =
  | 'organic'
  | 'direct'
  | 'paid_search'
  | 'paid_social'
  | 'content'
  | 'referrer'
  | 'partner'
  | 'outbound'
  | 'other'

/** Shape of the Yalla user model relevant for HubSpot sync */
export interface YallaContactInput {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role: YallaUserRole
  market?: YallaMarket
  locale?: YallaLocale
  referralSource?: YallaReferralSource
  signupAt?: Date | string
  lastActiveAt?: Date | string
  // Owner
  listingCount?: number
  listingValueTotal?: number
  listingStatus?: YallaListingStatus
  portals?: {
    immoscout?: boolean
    immowelt?: boolean
    rightmove?: boolean
    zoopla?: boolean
  }
  // Hunter
  offersMade?: number
  viewingsAttended?: number
  budgetMin?: number
  budgetMax?: number
  // Referrer
  payoutsTotal?: number
}

/** Raw HubSpot property map (what we send to the API) */
export type HubSpotProperties = Record<string, string>

export interface HubSpotContact {
  id: string
  properties: Record<string, string | null>
  createdAt: string
  updatedAt: string
}

export interface HubSpotApiError {
  status: 'error'
  message: string
  correlationId?: string
  category?: string
}
