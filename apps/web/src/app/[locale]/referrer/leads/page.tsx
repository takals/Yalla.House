import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { type Database } from '@/types/database'

type Referrer = Database['public']['Tables']['referrers']['Row']
type Referral = Database['public']['Tables']['referrals']['Row']
type ReferralEvent = Database['public']['Tables']['referral_events']['Row']

interface ReferralWithData extends Referral {
  user?: {
    full_name: string | null
    email: string | null
  }
}

interface ReferralWithEvents extends ReferralWithData {
  events: ReferralEvent[]
}

const MILESTONE_CONFIG = {
  SIGNUP: { label: 'Sign Up', amount: 0, order: 1 },
  LISTING_DRAFT: { label: 'Listing Draft', amount: 0, order: 2 },
  LISTING_PUBLISHED: { label: 'Listing Published', amount: 2500, order: 3 },
  FIRST_BOOKING: { label: 'First Booking', amount: 1500, order: 4 },
  PAID_PLAN: { label: 'Paid Plan', amount: 5000, order: 5 },
  AGENT_ACTIVATED: { label: 'Agent Activated', amount: 3000, order: 6 },
} as const

export default async function ReferralLeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch referrer record
  const { data: referrerData } = await supabase
    .from('referrers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!referrerData) {
    redirect('/referrer')
  }

  const referrer = referrerData as Referrer

  // Fetch referrals with user data and events
  const { data: referralsData } = await (supabase as any)
    .from('referrals')
    .select(`
      id, referred_user_id, referred_role, created_at,
      user:users(full_name, email)
    `)
    .eq('referrer_id', referrer.id)
    .order('created_at', { ascending: false })

  const referralIds = (referralsData ?? []).map((r: any) => r.id)

  // Fetch all events for these referrals
  const { data: eventsData } = await referralIds.length > 0
    ? (supabase as any)
        .from('referral_events')
        .select('*')
        .in('referral_id', referralIds)
    : Promise.resolve({ data: null })

  const events = (eventsData ?? []) as ReferralEvent[]
  const eventsByReferral = events.reduce(
    (acc, event) => {
      if (!acc[event.referral_id]) {
        acc[event.referral_id] = []
      }
      const arr = acc[event.referral_id]
      if (arr) {
        arr.push(event)
      }
      return acc
    },
    {} as Record<string, ReferralEvent[]>
  )

  const referralsWithEvents = (referralsData ?? []).map((r: any) => ({
    ...r,
    events: eventsByReferral[r.id] ?? [],
  })) as ReferralWithEvents[]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link href="/referrer" className="text-brand text-sm font-semibold mb-3 inline-block hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-1">Your Referrals</h1>
        <p className="text-[#5E6278] text-sm">
          Track the progress of each referral and their earned milestones.
        </p>
      </div>

      {referralsWithEvents.length === 0 ? (
        <div className="bg-surface rounded-xl p-12 text-center border border-[#E2E4EB]">
          <p className="text-[#5E6278] font-medium mb-2">No referrals yet</p>
          <p className="text-xs text-[#999] mb-4">
            Share your referral link to start earning money.
          </p>
          <Link
            href="/referrer"
            className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
          >
            Get Referral Link →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {referralsWithEvents.map(referral => {
            const userName = referral.user?.full_name || 'Anonymous User'
            const roleLabel = referral.referred_role.charAt(0).toUpperCase() + referral.referred_role.slice(1)

            // Get completed milestones
            const completedMilestones = new Set(
              referral.events
                .filter(e => e.status === 'approved' || e.status === 'paid')
                .map(e => e.milestone)
            )

            // Get all milestones sorted
            const allMilestones = Object.entries(MILESTONE_CONFIG)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, config]) => ({
                key: key as keyof typeof MILESTONE_CONFIG,
                ...config,
                completed: completedMilestones.has(key as keyof typeof MILESTONE_CONFIG),
              }))

            // Calculate total earned from this referral
            const totalEarned = referral.events
              .filter(e => e.status === 'approved' || e.status === 'paid')
              .reduce((sum, e) => sum + (e.value || 0), 0)

            return (
              <div key={referral.id} className="bg-surface rounded-xl border border-[#E2E4EB] p-5 hover:border-[#D9DCE4] transition">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{userName}</h3>
                      <p className="text-xs text-[#5E6278]">
                        {roleLabel} · Joined {new Date(referral.created_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    {totalEarned > 0 && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534]">
                        €{(totalEarned / 100).toFixed(2)} earned
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestone Progress */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#5E6278] mb-3">Progress</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {allMilestones.map(milestone => {
                      const isCompleted = milestone.completed
                      const bgColor = isCompleted
                        ? 'bg-[#DCFCE7]'
                        : milestone.key === 'SIGNUP'
                          ? 'bg-[#E2E4EB]'
                          : 'bg-[#F5F5F7]'
                      const textColor = isCompleted ? 'text-[#166534]' : 'text-[#5E6278]'
                      const borderColor = isCompleted ? 'border-[#166534]' : 'border-transparent'

                      return (
                        <div
                          key={milestone.key}
                          className={`${bgColor} ${borderColor} border rounded-lg p-2 text-center`}
                        >
                          <p className={`text-xs font-semibold ${textColor}`}>
                            {milestone.label}
                          </p>
                          {milestone.amount > 0 && (
                            <p className={`text-xs mt-1 ${isCompleted ? 'text-[#166534] font-bold' : 'text-[#5E6278]'}`}>
                              €{(milestone.amount / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
