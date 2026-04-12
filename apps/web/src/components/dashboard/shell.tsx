'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Building2, Plus, Calendar, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  LogOut, Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

interface Props {
  children: React.ReactNode
  navItems: NavItem[]
  section: string
  userEmail: string
  userName: string | null
}

export function DashboardShell({ children, navItems, section, userEmail, userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href || pathname.endsWith(item.href)
    return pathname.includes(item.href)
  }

  const initials = (userName ?? userEmail).slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-[#EDEEF2] overflow-hidden">

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className="w-[240px] bg-[#0F1117] flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="h-[60px] flex items-center px-5 flex-shrink-0">
          <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white">
            Yalla<span className="text-[#D4764E]">.</span>House
          </Link>
          {section === 'admin' && (
            <span className="ml-2 text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-[#D4764E] rounded-sm text-[#0F1117]">
              Admin
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-3 overflow-y-auto">
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ transition: 'background 0.15s cubic-bezier(0.16,1,0.3,1), color 0.15s cubic-bezier(0.16,1,0.3,1)' }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[0.875rem] font-semibold mb-0.5 ${
                  active
                    ? 'bg-[rgba(212,118,78,0.12)] text-[#D4764E]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-[#D4764E]' : 'text-white/30'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 pt-3 border-t border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.8125rem] font-semibold truncate text-white/80">
                {userName ?? userEmail}
              </p>
              <button
                onClick={handleSignOut}
                className="text-[0.7rem] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={10} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-[#E2E4EB] flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EDEEF2] flex items-center justify-center text-[0.7rem] font-bold text-[#5E6278]">
              {initials}
            </div>
            <span className="text-[0.8125rem] font-semibold text-[#0F1117]">{userName ?? userEmail}</span>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// ── Pre-built nav configs ─────────────────────────────────────────────────────

// Navigation items are hardcoded here with German labels.
// Translations for labels are handled server-side in layout files.

export const hunterNav: NavItem[] = [
  { href: '/hunter',          label: 'Dashboard',        icon: <LayoutDashboard size={15} />, exact: true },
  { href: '/hunter/search',   label: 'Search',            icon: <Search size={15} /> },
  { href: '/hunter/passport', label: 'Home Passport',    icon: <ShieldCheck size={15} /> },
  { href: '/hunter/agents',   label: 'Agents',   icon: <Handshake size={15} /> },
  { href: '/hunter/inbox',    label: 'Inbox',       icon: <Inbox size={15} /> },
  { href: '/hunter/settings', label: 'Settings',    icon: <Settings size={15} /> },
]

export const agentNav: NavItem[] = [
  { href: '/agent',            label: 'Dashboard',         icon: <LayoutDashboard size={15} />, exact: true },
  { href: '/agent/assignments', label: 'Assignments', icon: <Building2 size={15} /> },
  { href: '/agent/calendar',   label: 'Calendar',   icon: <Calendar size={15} /> },
  { href: '/agent/briefs',     label: 'Briefs',   icon: <Inbox size={15} /> },
  { href: '/agent/hunters',    label: 'Hunters', icon: <Users size={15} /> },
  { href: '/agent/agreement',  label: 'Partner Agreement', icon: <Handshake size={15} /> },
  { href: '/agent/profile',    label: 'Profile',       icon: <UserCircle size={15} /> },
]

export const adminNav: NavItem[] = [
  { href: '/admin',          label: 'Overview',         icon: <LayoutDashboard size={15} />, exact: true },
]

export const ownerNav: NavItem[] = [
  { href: '/owner',          label: 'Dashboard',         icon: <LayoutDashboard size={15} />, exact: true },
  { href: '/owner/listings', label: 'Listings',    icon: <Home size={15} /> },
  { href: '/owner/viewings', label: 'Viewings',    icon: <Calendar size={15} /> },
  { href: '/owner/agents',   label: 'Agents',      icon: <Handshake size={15} /> },
  { href: '/owner/inbox',    label: 'Inbox',       icon: <Inbox size={15} /> },
  { href: '/owner/new',      label: 'New Listing',     icon: <Plus size={15} /> },
  { href: '/owner/plans',    label: 'Plans & Billing',   icon: <Star size={15} /> },
  { href: '/owner/settings', label: 'Settings',     icon: <Settings size={15} /> },
]

export const partnerNav: NavItem[] = [
  { href: '/partner',          label: 'Dashboard', icon: <LayoutDashboard size={15} />, exact: true },
  { href: '/partner/requests', label: 'Requests',  icon: <Inbox size={15} /> },
]
