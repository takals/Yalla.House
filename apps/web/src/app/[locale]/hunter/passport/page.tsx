import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PassportForm } from './passport-form'

export default async function PassportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/hunter/passport')

  const [profileResult, userResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('hunter_profiles') as any)
      .select('intent, budget_min, budget_max, target_areas, property_types, min_bedrooms, must_haves, dealbreakers, finance_status, timeline, brief_updated_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  return (
    <div className="max-w-5xl">

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#FFFBE0] text-[#7A5F00] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide border border-[#FFD400]">
            🛂 Your Verified Buyer Identity
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Create Your Home Passport
          </h1>
          <p className="text-[#5E6278] text-base max-w-2xl mb-6">
            Set it once. Agents request access — you stay in control.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
            {[
              'A portable buyer profile you own and control',
              'Agents request access — you decide who sees it',
              'Verified finance status builds agent trust instantly',
              'Filter newsletters — only strong matches reach you',
              'Surface off-market opportunities before portals do',
            ].map(benefit => (
              <div key={benefit} className="flex items-start gap-2 text-sm text-[#0F1117]">
                <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-surface rounded-2xl p-6 mb-10 border border-[#E2E4EB]">
          <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-5">How Your Home Passport Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Set your criteria', body: 'Location, budget, property type, must-haves and finance status.' },
              { n: '2', title: 'Agents request access', body: 'Agents discover your Passport and request to connect — you approve.' },
              { n: '3', title: 'Only matches reach you', body: 'Everything irrelevant is filtered out. Strong opportunities only.' },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-black flex-shrink-0">
                  {step.n}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-[#5E6278] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <PassportForm
          profile={profileResult.data}
          userName={userResult.data?.full_name ?? null}
        />

      </div>
  )
}
