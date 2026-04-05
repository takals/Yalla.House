import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

// Milestone payout values (EUR cents) — Germany
const PAYOUT_TABLE: Record<string, number> = {
  SIGNUP:             0,      // No payout for sign-up alone
  LISTING_DRAFT:      0,
  LISTING_PUBLISHED:  2500,   // 25.00 EUR — 30-day hold
  FIRST_BOOKING:      1500,   // 15.00 EUR
  PAID_PLAN:          5000,   // 50.00 EUR
  AGENT_ACTIVATED:    3000,   // 30.00 EUR
}

export const referralProcess = inngest.createFunction(
  { id: 'referral.process', retries: 2 },
  { event: 'referral/event.created' },
  async ({ event, step }) => {
    const { referredUserId, milestone } = event.data

    const db = createServiceClient()

    // Find the referral record for this user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: referral, error } = await (db as any)
      .from('referrals')
      .select('id, referrer_id')
      .eq('referred_user_id', referredUserId)
      .single()

    if (error || !referral) {
      // User was not referred — nothing to do
      return { skipped: true, reason: 'no referral record' }
    }

    const value = PAYOUT_TABLE[milestone] ?? 0

    // Upsert referral event (UNIQUE constraint prevents double-crediting)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (db as any).from('referral_events').upsert({
      referral_id: referral.id,
      milestone,
      value: value / 100,  // store as decimal EUR in DB
      currency: 'EUR',
      status: milestone === 'LISTING_PUBLISHED'
        ? 'pending'   // 30-day hold
        : 'approved',
    }, { onConflict: 'referral_id,milestone', ignoreDuplicates: true })

    if (insertError) {
      throw new Error(`Failed to create referral event: ${insertError.message}`)
    }

    // Update referrer total_earned (only for approved events)
    if (milestone !== 'LISTING_PUBLISHED' && value > 0) {
      await step.run('update-earnings', async () => {
        await (db as any).rpc('increment_referrer_earnings', {
          p_referrer_id: referral.referrer_id,
          p_amount: value / 100,
        })
      })
    }

    return { referralId: referral.id, milestone, value, status: 'processed' }
  }
)
