// Nav item definitions — shared between Server Components (layouts) and Client Components (shell)
// This file has NO 'use client' directive so it can be safely called from Server Components.

export interface NavItem {
  href: string
  label: string
  icon: string  // key into iconMap in shell.tsx — serializable across server/client boundary
  exact?: boolean
}

// Helper to safely access translation keys
function l(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

export function hunterNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/hunter/overview', label: l(t, 'navDashboard'),  icon: 'LayoutDashboard', exact: true },
    { href: '/hunter/search',   label: l(t, 'navSearch'),     icon: 'Search' },
    { href: '/hunter/viewings', label: l(t, 'navViewings'),   icon: 'Eye' },
    { href: '/hunter/passport', label: l(t, 'navPassport'),   icon: 'ShieldCheck' },
    { href: '/hunter/agents',   label: l(t, 'navAgents'),     icon: 'Handshake' },
    { href: '/hunter/inbox',    label: l(t, 'navInbox'),      icon: 'Inbox' },
    { href: '/hunter/settings', label: l(t, 'navSettings'),   icon: 'Settings' },
  ]
}

export function agentNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/agent/assignments', label: l(t, 'navAssignments'),     icon: 'Building2', exact: true },
    { href: '/agent/calendar',   label: l(t, 'navCalendar'),         icon: 'Calendar' },
    { href: '/agent/briefs',     label: l(t, 'navBriefs'),           icon: 'Inbox' },
    { href: '/agent/hunters',    label: l(t, 'navHunters'),          icon: 'Users' },
    { href: '/agent/inbox',      label: l(t, 'navInbox'),            icon: 'Inbox' },
    { href: '/agent/agreement',  label: l(t, 'navPartnerAgreement'), icon: 'Handshake' },
    { href: '/agent/profile',    label: l(t, 'navProfile'),          icon: 'UserCircle' },
    { href: '/agent/settings',   label: l(t, 'navSettings'),         icon: 'Settings' },
  ]
}

export function adminNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/admin',        label: l(t, 'navOverview'), icon: 'LayoutDashboard', exact: true },
    { href: '/admin/users',  label: l(t, 'navUsers'),    icon: 'Users' },
  ]
}

export function ownerNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/owner/listings', label: l(t, 'navListings'),   icon: 'Home', exact: true },
    { href: '/owner/calendar', label: l(t, 'navCalendar'),   icon: 'CalendarDays' },
    { href: '/owner/viewings', label: l(t, 'navViewings'),   icon: 'Calendar' },
    { href: '/owner/offers',   label: l(t, 'navOffers'),     icon: 'Banknote' },
    { href: '/owner/agents',   label: l(t, 'navAgents'),     icon: 'Handshake' },
    { href: '/owner/inbox',    label: l(t, 'navInbox'),      icon: 'Inbox' },
    { href: '/owner/new',      label: l(t, 'navNewListing'), icon: 'Plus' },
    { href: '/owner/plans',    label: l(t, 'navPlans'),      icon: 'Star' },
    { href: '/owner/settings', label: l(t, 'navSettings'),   icon: 'Settings' },
  ]
}

export function partnerNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/partner',          label: l(t, 'navDashboard'), icon: 'LayoutDashboard', exact: true },
    { href: '/partner/requests', label: l(t, 'navRequests'),  icon: 'Inbox' },
  ]
}
