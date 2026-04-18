interface RoleSwitchItem {
  role: string
  label: string
  href: string
}

const ROLE_CONFIG: Record<string, { label: string; href: string }> = {
  owner:   { label: 'Owner',       href: '/owner'   },
  hunter:  { label: 'Home Hunter', href: '/hunter'  },
  agent:   { label: 'Agent',       href: '/agent'   },
  partner: { label: 'Partner',     href: '/partner' },
  admin:   { label: 'Admin',       href: '/admin'   },
}

/**
 * Fetch the user's active roles and return them as RoleSwitchItems
 * for the dashboard sidebar role switcher.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchUserRoles(
  supabase: any,
  userId: string
): Promise<RoleSwitchItem[]> {
  const { data: roles } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!roles || roles.length === 0) return []

  return roles
    .map((r: { role: string }) => {
      const cfg = ROLE_CONFIG[r.role]
      if (!cfg) return null
      return { role: r.role, label: cfg.label, href: cfg.href }
    })
    .filter(Boolean) as RoleSwitchItem[]
}
