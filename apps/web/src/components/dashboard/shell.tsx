'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Building2, Plus, Calendar, CalendarDays, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  LogOut, Search, PanelLeftClose, PanelLeftOpen, Banknote, Eye, Menu, X,
} from 'lucide-react'
import { NotificationBell } from './notification-bell'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

interface NotificationData {
  id: string
  title: string
  body: string | null
  action_url: string | null
  status: string
  created_at: string
}

interface RoleSwitchItem {
  role: string
  label: string
  href: string
}

interface Props {
  children: React.ReactNode
  navItems: NavItem[]
  section: string
  userEmail: string
  userName: string | null
  notifications?: NotificationData[]
  unreadCount?: number
  notificationLabels?: Record<string, string>
  shellLabels?: Record<string, string>
  userRoles?: RoleSwitchItem[]
}

const SIDEBAR_W = 280

export function DashboardShell({ children, navItems, section, userEmail, userName, notifications, unreadCount, notificationLabels, shellLabels, userRoles }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  // Desktop: collapsed/expanded toggle. Mobile: open/closed overlay.
  const [isDesktop, setIsDesktop] = useState(false)
  const [collapsed, setCollapsed] = useState(true)   // desktop only
  const [mobileOpen, setMobileOpen] = useState(false) // mobile only

  // Touch tracking for swipe gesture
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const isSwiping = useRef(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Detect desktop vs mobile
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    setCollapsed(!mq.matches)
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      setCollapsed(!e.matches)
      if (e.matches) setMobileOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Swipe gesture — open sidebar by swiping right from left edge
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isDesktop) return
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchCurrentX.current = touch.clientX
    // Only start tracking if touch begins near left edge (within 30px) or sidebar is open
    isSwiping.current = touch.clientX < 30 || mobileOpen
  }, [isDesktop, mobileOpen])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return
    touchCurrentX.current = e.touches[0].clientX
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    const dx = Math.abs(touchCurrentX.current - touchStartX.current)
    // If scrolling more vertically, cancel swipe
    if (dy > dx && dx < 10) { isSwiping.current = false }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return
    isSwiping.current = false
    const dx = touchCurrentX.current - touchStartX.current
    if (!mobileOpen && dx > 60) setMobileOpen(true)     // swipe right → open
    if (mobileOpen && dx < -60) setMobileOpen(false)     // swipe left → close
  }, [mobileOpen])

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  async function handleSignOut() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href || pathname.endsWith(item.href)
    return pathname.includes(item.href)
  }

  const initials = (userName ?? userEmail).slice(0, 2).toUpperCase()

  // On mobile the sidebar is always "expanded" (shows labels), just positioned off-screen
  const showLabels = isDesktop ? !collapsed : true

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* ── Mobile backdrop ──────────────────────── */}
      {!isDesktop && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
            mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        ref={sidebarRef}
        style={isDesktop ? undefined : { width: SIDEBAR_W }}
        className={
          isDesktop
            ? `${collapsed ? 'w-[60px]' : 'w-[240px]'} bg-[#0F1117] flex flex-col flex-shrink-0 transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden`
            : `fixed inset-y-0 left-0 z-50 bg-[#0F1117] flex flex-col transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              }`
        }
      >

        {/* Logo row */}
        <div className="h-[60px] flex items-center px-4 flex-shrink-0 gap-3">
          {showLabels && (
            <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white whitespace-nowrap">
              Yalla<span className="text-brand">.</span>House
            </Link>
          )}
          {showLabels && section === 'admin' && (
            <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-brand rounded-sm text-text-primary">
              Admin
            </span>
          )}
          {isDesktop && collapsed && (
            <Link href="/" className="font-extrabold text-[1.1rem] tracking-tight text-brand mx-auto">
              Y
            </Link>
          )}
          {/* Mobile close button */}
          {!isDesktop && (
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto p-1 rounded-md text-white/40 hover:text-white/80 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Desktop toggle (hidden on mobile) */}
        {isDesktop && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="mx-3 mb-2 flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
            title={collapsed ? (shellLabels?.expandSidebar ?? 'Expand sidebar') : (shellLabels?.collapseSidebar ?? 'Collapse sidebar')}
            aria-expanded={!collapsed}
            aria-controls="sidebar-nav"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span className="text-xs font-medium">{shellLabels?.collapse ?? 'Collapse'}</span>}
          </button>
        )}

        {/* Nav */}
        <nav aria-label="Dashboard navigation" role="navigation" className="flex-1 py-1 px-2 overflow-y-auto overflow-x-hidden">
          <div id="sidebar-nav">
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isDesktop && collapsed ? item.label : undefined}
                style={{ transition: 'background 0.15s cubic-bezier(0.16,1,0.3,1), color 0.15s cubic-bezier(0.16,1,0.3,1)' }}
                className={`flex items-center gap-3 rounded-[8px] text-[0.875rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden ${
                  isDesktop && collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-[rgba(212,118,78,0.12)] text-brand'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-brand' : 'text-white/30'}`}>
                  {item.icon}
                </span>
                {showLabels && item.label}
              </Link>
            )
          })}
          </div>
        </nav>

        {/* Role switcher */}
        {userRoles && userRoles.length > 1 && showLabels && (
          <div className="px-2 pb-2 pt-2 border-t border-white/[0.07] flex-shrink-0">
            <p className="text-[0.6rem] font-bold uppercase tracking-wider text-white/20 px-2 mb-1">
              {shellLabels?.switchRole ?? 'Switch role'}
            </p>
            {userRoles.filter(r => r.role !== section).map(r => (
              <Link
                key={r.role}
                href={r.href}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors text-[0.8rem] font-medium"
              >
                {r.label}
              </Link>
            ))}
          </div>
        )}

        {/* User footer */}
        <div className={`px-2 pb-4 pt-3 border-t border-white/[0.07] flex-shrink-0 ${isDesktop && collapsed ? 'flex justify-center' : ''}`}>
          {isDesktop && collapsed ? (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
              {initials}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 flex-shrink-0">
                {initials}
              </div>
              {showLabels && (
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8125rem] font-semibold truncate text-white/80">
                    {userName ?? userEmail}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-[0.7rem] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut size={10} />
                    {shellLabels?.signOut ?? 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ────────────────────────────── */}
      <div ref={mainRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-border-default flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          {/* Mobile hamburger */}
          {!isDesktop && (
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:bg-bg transition-colors lg:hidden"
              aria-label={shellLabels?.openMenu ?? 'Open menu'}
            >
              <Menu size={22} />
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {notifications && notificationLabels && (
              <NotificationBell
                initialNotifications={notifications}
                unreadCount={unreadCount ?? 0}
                t={notificationLabels}
              />
            )}
            <div className="w-7 h-7 rounded-full bg-bg flex items-center justify-center text-[0.7rem] font-bold text-text-secondary">
              {initials}
            </div>
            <span className="hidden sm:inline text-[0.8125rem] font-semibold text-text-primary">{userName ?? userEmail}</span>
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

export function hunterNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/hunter/overview', label: t.navDashboard,     icon: <LayoutDashboard size={15} />, exact: true },
    { href: '/hunter/search',   label: t.navSearch,        icon: <Search size={15} /> },
    { href: '/hunter/viewings', label: t.navViewings,      icon: <Eye size={15} /> },
    { href: '/hunter/passport', label: t.navPassport,      icon: <ShieldCheck size={15} /> },
    { href: '/hunter/agents',   label: t.navAgents,        icon: <Handshake size={15} /> },
    { href: '/hunter/inbox',    label: t.navInbox,         icon: <Inbox size={15} /> },
    { href: '/hunter/settings', label: t.navSettings,      icon: <Settings size={15} /> },
  ]
}

export function agentNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/agent/assignments', label: t.navAssignments,       icon: <Building2 size={15} />, exact: true },
    { href: '/agent/calendar',   label: t.navCalendar,           icon: <Calendar size={15} /> },
    { href: '/agent/briefs',     label: t.navBriefs,             icon: <Inbox size={15} /> },
    { href: '/agent/hunters',    label: t.navHunters,            icon: <Users size={15} /> },
    { href: '/agent/inbox',      label: t.navInbox,              icon: <Inbox size={15} /> },
    { href: '/agent/agreement',  label: t.navPartnerAgreement,   icon: <Handshake size={15} /> },
    { href: '/agent/profile',    label: t.navProfile,            icon: <UserCircle size={15} /> },
    { href: '/agent/settings',   label: t.navSettings,           icon: <Settings size={15} /> },
  ]
}

export function adminNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/admin',          label: t.navOverview,   icon: <LayoutDashboard size={15} />, exact: true },
    { href: '/admin/users',   label: t.navUsers,      icon: <Users size={15} /> },
  ]
}

export function ownerNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/owner/listings', label: t.navListings,       icon: <Home size={15} />, exact: true },
    { href: '/owner/calendar', label: t.navCalendar,       icon: <CalendarDays size={15} /> },
    { href: '/owner/viewings', label: t.navViewings,       icon: <Calendar size={15} /> },
    { href: '/owner/offers',   label: t.navOffers,         icon: <Banknote size={15} /> },
    { href: '/owner/agents',   label: t.navAgents,         icon: <Handshake size={15} /> },
    { href: '/owner/inbox',    label: t.navInbox,          icon: <Inbox size={15} /> },
    { href: '/owner/new',      label: t.navNewListing,     icon: <Plus size={15} /> },
    { href: '/owner/plans',    label: t.navPlans,          icon: <Star size={15} /> },
    { href: '/owner/settings', label: t.navSettings,       icon: <Settings size={15} /> },
  ]
}

export function partnerNav(t: Record<string, string>): NavItem[] {
  return [
    { href: '/partner',          label: t.navDashboard, icon: <LayoutDashboard size={15} />, exact: true },
    { href: '/partner/requests', label: t.navRequests,  icon: <Inbox size={15} /> },
  ]
}
