'use server'

import { inngest } from '@/lib/inngest/client'

export type ReferralMilestone =
  | 'SIGNUP'
  | 'LISTING_DRAFT'
  | 'LISTING_PUBLISHED'
  | 'FIRST_BOOKING'
  | 'PAID_PLAN'
  | 'AGENT_ACTIVATED'

/**
 * Record that a referred user reached a milestone.
 *
 * The Inngest handler works out whether this user was referred at all and
 * credits the referrer; callers just announce what happened. Best-effort by
 * design — a referral problem must never fail the action that triggered it.
 */
export async function emitReferralMilestone(
  referredUserId: string,
  milestone: ReferralMilestone
): Promise<void> {
  try {
    await inngest.send({
      name: 'referral/event.created',
      data: { referredUserId, milestone },
    })
  } catch (err) {
    console.error('Referral milestone send failed:', milestone, err)
  }
}
