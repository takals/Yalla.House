import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'yalla-house',
  name: 'Yalla.House',
})

// Typed event map — add new events here as they are created
export type Events = {
  'marketing/welcome.start': {
    data: {
      userId: string
      email: string
      firstName: string | null
      role: 'owner' | 'hunter' | 'agent' | 'partner' | 'referrer' | 'admin' | 'other'
      locale: 'de' | 'en'
    }
  }
  'marketing/mql.created': {
    data: {
      contactId: string
      email: string
      firstName: string | null
      lastName: string | null
      role: string | null
      market: string | null
      source: string | null
    }
  }
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
  'intake/session.completed': {
    data: {
      sessionId: string
      userId: string
      flowId: string
      voiceUsed: boolean
      fieldsFromMemory: number
      fieldsTotal: number
      durationSeconds: number
    }
  }
  'intake/patterns.analyze': {
    data: {
      flowId: string
    }
  }
  'brief/agents.insufficient': {
    data: {
      listingId: string
      ownerId: string
      postcode: string
      city: string
      registeredAgentCount: number
      minimumRequired: number
    }
  }
  'agent/invite.send': {
    data: {
      prospectiveAgentId: string
      listingId: string
      template: 'owner_brief' | 'cold_outreach'
    }
  }
  'agent/invite.batch': {
    data: {
      postcode: string
      listingId: string
      maxInvites: number
    }
  }
  // ── Viewing lifecycle events ──────────────────────────────
  'viewing/confirmed': {
    data: {
      viewingId: string
      listingId: string
      hunterId: string
      ownerId: string
      agentId: string | null
      scheduledAt: string      // ISO timestamp
      listingTitle: string
      listingCity: string
    }
  }
  'viewing/reminder.24h': {
    data: {
      viewingId: string
      hunterId: string
      ownerId: string
      agentId: string | null
      scheduledAt: string
      listingTitle: string
      listingCity: string
    }
  }
  'viewing/reminder.1h': {
    data: {
      viewingId: string
      hunterId: string
      ownerId: string
      agentId: string | null
      scheduledAt: string
      listingTitle: string
      listingCity: string
    }
  }
  'viewing/checkin.requested': {
    data: {
      viewingId: string
      hunterId: string
      listingTitle: string
    }
  }
  'viewing/completed': {
    data: {
      viewingId: string
      hunterId: string
      ownerId: string
      agentId: string | null
      listingId: string
      listingTitle: string
    }
  }
}
