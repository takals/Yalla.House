import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'yalla-house',
  name: 'Yalla.House',
})

// Typed event map — add new events here as they are created
export type Events = {
  'feed/export.requested': {
    data: {
      listingId: string
      portalId: string
    }
  }
  'referral/event.created': {
    data: {
      referredUserId: string
      milestone: 'SIGNUP' | 'LISTING_DRAFT' | 'LISTING_PUBLISHED' | 'FIRST_BOOKING' | 'PAID_PLAN' | 'AGENT_ACTIVATED'
    }
  }
  'listing/published': {
    data: {
      listingId: string
      ownerId: string
    }
  }
}
