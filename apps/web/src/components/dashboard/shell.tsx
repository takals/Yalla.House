'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Building2, Plus, Calendar, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  LogOut, Search, Menu, X,
} from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  async function handleSignOut() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href || pathname.endsWith(item.href)
    return pathname.includes(item.href)
  }

  const initials = (userName ?? userEmail).slice(0, 2).toUpperCase()

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-between px-5 flex-shrink-0">
        <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white">
          Yalla<span className="text-[#D4764E]">.</span>House
        </Link>
        <div className="flex items-center gap-2">
          {section === 'admin' && (
            <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-[#D4764E] rounded-sm text-[#0F1117]">
              Admin
            </span>
          )}
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
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
    </>
  )

  return (
    <div className="flex h-screen bg-[#EDEEF2] overflow-hidden">

      {/* ── Desktop sidebar (lg+) ──────────────────────────────── */}
      <aside className="hidden lg:flex w-[240px] bg-[#0F1117] flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay (<lg) ───────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0F1117] flex flex-col animate-sidebar-in">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ── Main area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-[#E2E4EB] flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#5E6278] hover:bg-[#EDEEF2] transition-colors"
          >
            <Menu size={20} />
          </button>
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden font-extrabold text-[0.95rem] tracking-tight text-[#0F1117]">
            Yalla<span className="text-[#D4764E]">.</span>House
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EDEEF2] flex items-center justify-center text-[0.7rem] font-bold text-[#5E6278]">
              {initials}
            </div>
            <span className="hidden sm:inline text-[0.8125rem] font-semibold text-[#0F1117]">{userName ?? userEmail}</span>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}

// ── Pre-built nav configs ─────────────────────────────────────────────────────

export const hunterNav: NavItem[] = [
  { href: '/hunter/info',     label: 'Dashboard',        icon: <LayoutDashboard size={15} />, exact: true },
  { href: '/hunter/search',   label: 'Search',            icon: <Search size={15} /> },
  { href: '/hunter/passport', label: 'Home Passport',    icon: <ShieldCheck size={15} /> },
  { href: '/hunter/agents',   label: 'Agents',   icon: <Handshake size={15} /> },
  { href: '/hunter/inbox',    label: 'Inbox',       icon: <Inbox size={15} /> },
  { href: '/hunter/settings', label: 'Settings',    icon: <Settings size={15} /> },
]

export const agentNav: NavItem[] = [
  { href: '/agent/info',       label: 'Dashboard',         icon: <LayoutDashboard size={15} />, exact: true },
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
  { href: '/owner/info',     label: 'Dashboard',         icon: <LayoutDashboard size={15} />, exact: true },
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
