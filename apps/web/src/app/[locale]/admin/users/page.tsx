import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { Lock } from 'lucide-react'
import { UserManagement } from './user-management'

export default async function AdminUsersPage() {
  const t = await getTranslations()
  const at = await getTranslations('adminUsers')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Admin role check
  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface rounded-card p-10 text-center max-w-sm">
          <Lock size={32} className="mx-auto mb-2 text-[#5E6278]" />
          <p className="font-bold mb-1">{t('admin.noAccess')}</p>
          <p className="text-sm text-[#5E6278]">{t('admin.noAccessMessage')}</p>
        </div>
      </div>
    )
  }

  const service = createServiceClient()

  // Fetch users with their roles
  let users: any[] = []
  let roles: any[] = []
  let totalCount = 0
  try {
    const [usersResult, rolesResult, totalResult] = await Promise.all([
      (service.from('users') as any)
        .select('id, full_name, email, phone, country_code, created_at')
        .order('created_at', { ascending: false })
        .limit(200),

      (service.from('user_roles') as any)
        .select('user_id, role, is_active')
        .eq('is_active', true),

      (service.from('users') as any)
        .select('id', { count: 'exact', head: true }),
    ])

    users = usersResult.data ?? []
    roles = rolesResult.data ?? []
    totalCount = totalResult.count ?? 0
  } catch (err) {
    console.error('Failed to load admin users data:', err)
  }

  // Build role map: user_id → Set<role>
  const roleMap: Record<string, string[]> = {}
  for (const r of roles) {
    if (!roleMap[r.user_id]) roleMap[r.user_id] = []
    roleMap[r.user_id]!.push(r.role)
  }

  const enrichedUsers = users.map((u: any) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    country_code: u.country_code,
    created_at: u.created_at,
    roles: roleMap[u.id] ?? [],
  }))

  const labels: Record<string, string> = {
    searchPlaceholder: at('searchPlaceholder'),
    allRoles: at('allRoles'),
    roleOwner: at('roleOwner'),
    roleHunter: at('roleHunter'),
    roleAgent: at('roleAgent'),
    roleAdmin: at('roleAdmin'),
    noRoles: at('noRoles'),
    addRole: at('addRole'),
    removeRole: at('removeRole'),
    noUsers: at('noUsers'),
    totalUsers: at('totalUsers'),
    rolesUpdated: at('rolesUpdated'),
    errorUpdatingRole: at('errorUpdatingRole'),
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{at('usersTitle')}</h1>
        <p className="text-sm text-[#5E6278] mt-0.5">{at('usersSubtitle')}</p>
      </div>

      <div className="bg-surface rounded-card p-4 mb-6">
        <p className="text-2xl font-bold">{totalCount}</p>
        <p className="text-xs text-[#5E6278]">{labels.totalUsers}</p>
      </div>

      <UserManagement users={enrichedUsers} t={labels} />
    </div>
  )
}
