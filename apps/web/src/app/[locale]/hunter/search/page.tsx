import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { Search, Check } from 'lucide-react'
import { SearchForm } from './search-form'

export default async function SearchProfilePage() {
  const t = await getTranslations('hunterSearch')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch existing searches + hunter profile defaults
  const [searchesResult, profileResult] = await Promise.all([
    (supabase as any)
      .from('search_requests')
      .select(`
        id, intent, areas, radius_km, budget_min, budget_max, currency,
        property_types, bedrooms_min, bedrooms_max, timeline, notes, languages,
        status, created_at,
        contact_consent(agent_outreach, phone_allowed)
      `)
      .eq('hunter_id', userId)
      .order('created_at', { ascending: false }),
    (supabase as any)
      .from('hunter_profiles')
      .select('intent, budget_min, budget_max, target_areas, property_types, timeline')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const existingSearches = searchesResult.data ?? []
  const profile = profileResult.data

  return (
    <div className="max-w-5xl">

      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-brand-solid-bg text-brand-badge-text text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide border border-brand">
          <Search size={14} /> {t('badge')}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">
          {t('title')}
        </h1>
        <p className="text-text-secondary text-base max-w-2xl mb-6">
          {t('heroDesc')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
          {(['benefit1', 'benefit2', 'benefit3', 'benefit4', 'benefit5'] as const).map(key => (
            <div key={key} className="flex items-start gap-2 text-sm text-text-primary">
              <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-surface rounded-2xl p-6 mb-10 border border-border-default">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-5">{t('howItWorksTitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {([
            { n: '1', titleKey: 'step1Title' as const, bodyKey: 'step1Body' as const },
            { n: '2', titleKey: 'step2Title' as const, bodyKey: 'step2Body' as const },
            { n: '3', titleKey: 'step3Title' as const, bodyKey: 'step3Body' as const },
            { n: '4', titleKey: 'step4Title' as const, bodyKey: 'step4Body' as const },
          ]).map(step => (
            <div key={step.n} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-black flex-shrink-0">
                {step.n}
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{t(step.titleKey)}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{t(step.bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing searches */}
      {existingSearches.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4">{t('yourSearches')}</h2>
          <div className="grid gap-3">
            {existingSearches.map((s: {
              id: string
              intent: string
              areas: { name?: string }[]
              budget_min: number | null
              budget_max: number | null
              currency: string
              status: string
              contact_consent: { agent_outreach: boolean }[] | null
            }) => (
              <div key={s.id} className="bg-surface rounded-xl p-4 border border-border-default flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'active' ? 'bg-[#DCFCE7] text-[#166534]'
                      : s.status === 'paused' ? 'bg-brand-solid-bg text-brand-badge-text'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>{s.status}</span>
                    <span className="text-xs text-text-secondary capitalize">{s.intent}</span>
                    {s.contact_consent?.[0]?.agent_outreach && (
                      <span className="text-xs bg-[#DBEAFE] text-[#1E40AF] px-2 py-0.5 rounded-full font-medium">
                        {t('agentOutreachOn')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">
                    {Array.isArray(s.areas) && s.areas.length > 0
                      ? s.areas.map(a => a.name).filter(Boolean).join(', ')
                      : t('noAreaSet')}
                  </p>
                  {(s.budget_min || s.budget_max) && (
                    <p className="text-xs text-text-secondary">
                      {s.currency} {s.budget_min ? (s.budget_min / 100).toLocaleString() : '—'}
                      {' – '}
                      {s.budget_max ? (s.budget_max / 100).toLocaleString() : '—'}
                    </p>
                  )}
                </div>
                <a href={`/hunter/search/${s.id}`} className="text-sm font-semibold text-brand hover:underline">
                  {t('viewSearch')}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New search form */}
      <SearchForm
        defaults={profile ? {
          intent: profile.intent ?? 'buy',
          areas: profile.target_areas ?? [],
          budget_min: profile.budget_min,
          budget_max: profile.budget_max,
          property_types: profile.property_types ?? [],
          timeline: profile.timeline ?? 'flexible',
        } : undefined}
      />

    </div>
  )
}
