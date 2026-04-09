import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { TrendingUp, Users, Award, Wallet } from 'lucide-react'
import { fromMinorUnits } from '@yalla/integrations'
import type { Database } from '@/types/database'
import CopyButton from './copy-button'

type Referrer = Database['public']['Tables']['referrers']['Row']
type Referral = Database['public']['Tables']['referrals']['Row']
type ReferralEvent = Database['public']['Tables']['referral_events']['Row']
type Payout = Database['public']['Tables']['payouts']['Row']

interface ReferralWithUser extends Referral {
  user?: {
    full_name: string | null
    email: string | null
  }
}

export default async function ReferrerDashboard() {
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
    // User is not a referrer yet
    return (
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Referral Program</h1>
          <p className="text-[#5E6278] text-sm">
            You haven't joined the referral program yet.
          </p>
        </div>

        <div className="bg-surface rounded-xl p-8 border border-[#E2E4EB] text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-[#FFD400]" />
          <h2 className="text-lg font-bold mb-2">Earn by Referring</h2>
          <p className="text-[#5E6278] text-sm mb-6">
            Invite sellers to Yalla.House and earn commissions for each milestone they reach.
          </p>
          <Link
            href="/referrer/join"
            className="inline-block px-6 py-2 bg-brand text-black font-bold rounded-lg hover:bg-[#E6C200] transition"
          >
            Join the Program →
          </Link>
        </div>
      </div>
    )
  }

  const referrer = referrerData as Referrer

  // Parallel fetch: referrals count, events, payouts
  const [referralsResult, eventsResult, payoutsResult] = await Promise.all([
    supabase
      .from('referrals')
      .select('id, referred_user_id, referred_role, created_at, user:users(full_name, email)', { count: 'exact' })
      .eq('referrer_id', referrer.id),

    supabase
      .from('referral_events')
      .select(`
        id, milestone, value, status, referral_id,
        referrals!inner(referrer_id)
      `)
      .eq('referrals.referrer_id', referrer.id)
      .in('status', ['approved', 'paid']),

    supabase
      .from('payouts')
      .select('*')
      .eq('referrer_id', referrer.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const referrals = (referralsResult.data ?? []) as unknown as ReferralWithUser[]
  const completedEvents = (eventsResult.data ?? []) as ReferralEvent[]
  const payouts = (payoutsResult.data ?? []) as Payout[]

  // Calculate totals
  const totalReferrals = referralsResult.count ?? 0
  const activeReferrals = referrals.length
  const totalEarned = completedEvents.reduce((sum, e) => sum + (e.value || 0), 0)
  const pendingPayout = payouts
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const referralLink = `https://yalla.house/r/${referrer.referrer_code}`

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Referral Dashboard</h1>
        <p className="text-[#5E6278] text-sm">
          Track your referrals and earnings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB]">
          <p className="text-2xl font-bold">{totalReferrals}</p>
          <p className="text-xs text-[#5E6278] mt-1">Total Referrals</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB]">
          <p className="text-2xl font-bold text-[#166534]">{activeReferrals}</p>
          <p className="text-xs text-[#5E6278] mt-1">Active</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB]">
          <p className="text-2xl font-bold text-[#166534]">€{(totalEarned / 100).toFixed(2)}</p>
          <p className="text-xs text-[#5E6278] mt-1">Total Earned</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB]">
          <p className="text-2xl font-bold text-[#FFD400]">€{(pendingPayout / 100).toFixed(2)}</p>
          <p className="text-xs text-[#5E6278] mt-1">Pending Payout</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-5 mb-8">
        <h2 className="text-sm font-bold mb-4">Your Referral Code</h2>
        <div className="space-y-3">
          <div className="bg-[#FFFBE0] rounded-lg p-4 flex items-center justify-between">
            <code className="font-mono text-sm font-bold text-[#000]">
              {referrer.referrer_code}
            </code>
            <CopyButton code={referrer.referrer_code} />
          </div>
          <div className="bg-[#FFFBE0] rounded-lg p-4">
            <p className="text-xs text-[#5E6278] mb-2">Full Referral Link:</p>
            <code className="text-xs font-mono text-[#000] break-all">
              {referralLink}
            </code>
          </div>
        </div>
      </div>

      {/* Quick Share Section */}
      <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-5 mb-8">
        <h2 className="text-sm font-bold mb-4">Share Your Link</h2>
        <div className="flex gap-3 flex-wrap">
          <a
            href={`mailto:?subject=Earn Money by Selling Your Property&body=Check out Yalla.House, the UK flat-fee property selling platform. No commission, no agent. Sell directly on Rightmove & Zoopla and keep every pound.%0A%0AJoin via my referral link: ${referralLink}`}
            className="px-4 py-2 bg-[#E2E4EB] text-black text-sm font-semibold rounded-lg hover:bg-[#D9DCE4] transition"
          >
            Email
          </a>
          <button
            onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=I'm earning money with Yalla.House's referral program&url=${encodeURIComponent(referralLink)}`, '_blank')
            }}
            className="px-4 py-2 bg-[#000] text-white text-sm font-semibold rounded-lg hover:bg-[#1a1a1a] transition"
          >
            Twitter
          </button>
          <button
            onClick={() => {
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank')
            }}
            className="px-4 py-2 bg-[#0A66C2] text-white text-sm font-semibold rounded-lg hover:bg-[#084ea8] transition"
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Action Links */}
      <div className="flex gap-3">
        <Link
          href="/referrer/leads"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-black font-bold rounded-lg hover:bg-[#E6C200] transition"
        >
          <Users className="w-4 h-4" />
          View Referrals
        </Link>
      </div>
    </div>
  )
}
