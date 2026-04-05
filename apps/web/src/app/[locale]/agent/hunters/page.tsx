import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/agent/hunters')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await (supabase.from('agent_hunter_assignments') as any)
    .select(`
      id, status, data_scope, connected_at,
      hunter_user:users!hunter_id(full_name, email),
      hunter_profile:hunter_profiles!hunter_id(
        intent, budget_min, budget_max, target_areas, property_types,
        min_bedrooms, must_haves, finance_status, timeline, brief_updated_at
      )
    `)
    .eq('agent_id', user.id)
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

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-0.5">Verbundene Käufer</h1>
          <p className="text-sm text-[#5E6278]">
            {passports.length > 0
              ? `${passports.length} aktive Verbindung${passports.length !== 1 ? 'en' : ''} · ${passports.filter(p => p.hasPassport).length} mit Passport`
              : 'Noch keine aktiven Verbindungen'}
          </p>
        </div>
        {passports.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#5E6278]">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {passports.filter(p => p.hasPassport).length} von {passports.length} mit Passport
          </div>
        )}
      </div>

      {passports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E4EB]">
          <p className="text-3xl mb-4">🛂</p>
          <p className="font-semibold mb-2">Noch keine verbundenen Käufer</p>
          <p className="text-sm text-[#5E6278] max-w-sm mx-auto">
            Sobald Käufer deine Anfragen annehmen, siehst du ihre Home Passports hier — mit Budget, Gebieten und Finanzstatus.
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
