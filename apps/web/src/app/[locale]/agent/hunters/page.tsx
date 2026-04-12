import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { ShieldCheck } from 'lucide-react'
import { HunterPassportCard } from './hunter-passport-card'

interface RawAssignment {
  id: string
  status: string
  data_scope: string
  connected_at: string | null
  hunter_user: { full_name: string | null; email: string } | null
  hunter_profile: {
    intent: string | null
    budget_min: number | null
    budget_max: number | null
    target_areas: string[] | null
    property_types: string[] | null
    min_bedrooms: number | null
    must_haves: string[] | null
    finance_status: string | null
    timeline: string | null
    brief_updated_at: string | null
  } | null
}

export default async function AgentHuntersPage() {
  const t = await getTranslations('agentDash')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: raw } = await (supabase.from('agent_hunter_assignments') as any)
    .select(`
      id, status, data_scope, connected_at,
      hunter_user:users!hunter_id(full_name, email),
      hunter_profile:hunter_profiles!hunter_id(
        intent, budget_min, budget_max, target_areas, property_types,
        min_bedrooms, must_haves, finance_status, timeline, brief_updated_at
      )
    `)
    .eq('agent_id', userId)
    .eq('status', 'active')
    .order('connected_at', { ascending: false })

  const assignments: RawAssignment[] = raw ?? []

  const passports = assignments.map(a => ({
    assignmentId: a.id,
    status: a.status,
    dataScope: a.data_scope,
    connectedAt: a.connected_at,
    hunterName: a.hunter_user?.full_name ?? null,
    hunterEmail: a.hunter_user?.email ?? '',
    intent: a.hunter_profile?.intent ?? null,
    budgetMin: a.hunter_profile?.budget_min ?? null,
    budgetMax: a.hunter_profile?.budget_max ?? null,
    targetAreas: a.hunter_profile?.target_areas ?? null,
    propertyTypes: a.hunter_profile?.property_types ?? null,
    minBedrooms: a.hunter_profile?.min_bedrooms ?? null,
    mustHaves: a.hunter_profile?.must_haves ?? null,
    financeStatus: a.hunter_profile?.finance_status ?? null,
    timeline: a.hunter_profile?.timeline ?? null,
    hasPassport: !!a.hunter_profile?.brief_updated_at,
  }))

  const passportCountText = passports.length > 0
    ? `${passports.length} ${passports.length === 1 ? t('activeConnection') : t('activeConnections')} · ${passports.filter(p => p.hasPassport).length} ${t('withPassport')}`
    : t('noActiveBuyers')

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-0.5">{t('connectedBuyers')}</h1>
          <p className="text-sm text-[#5E6278]">
            {passportCountText}
          </p>
        </div>
        {passports.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#5E6278]">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {passports.filter(p => p.hasPassport).length} von {passports.length} {t('withPassport')}
          </div>
        )}
      </div>

      {passports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E4EB]">
          <div className="flex justify-center mb-4">
            <ShieldCheck size={48} className="text-[#D9DCE4]" />
          </div>
          <p className="font-semibold mb-2">{t('noActiveBuyers')}</p>
          <p className="text-sm text-[#5E6278] max-w-sm mx-auto">
            {t('noBuyersDesc')}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {passports.map(p => (
            <HunterPassportCard key={p.assignmentId} passport={p} />
          ))}
        </div>
      )}
    </>
  )
}
