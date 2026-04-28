'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Building2, Plus, Calendar, CalendarDays, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  LogOut, Search, PanelLeftClose, PanelLeftOpen, Banknote, Eye, Menu, X,
  type LucideIcon,
} from 'lucide-react'
import { NotificationBell } from './notification-bell'

// Icon map — lets server components pass a string key instead of JSX
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Home, Building2, Plus, Calendar, CalendarDays, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  Search, Banknote, Eye,
}

import type { NavItem } from './nav-items'
export type { NavItem }

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

export function DashboardShell({ children, navItems, section, userEmail, userName, notifications, unreadCount, notificationLabels, shellLabels, userRoles }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  // Desktop: collapsed/expanded toggle. Mobile: open/closed overlay.
  const [collapsed, setCollapsed] = useState(true)   // desktop only
  const [mobileOpen, setMobileOpen] = useState(false) // mobile only

  // Touch tracking for swipe gesture
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchCurrentX = useRef(0)
  const isSwiping = useRef(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  // Track isDesktop for swipe gesture logic only (not for rendering)
  const isDesktopRef = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    isDesktopRef.current = mq.matches
    const handler = (e: MediaQueryListEvent) => {
      isDesktopRef.current = e.matches
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
    if (isDesktopRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchCurrentX.current = touch.clientX
    // Only start tracking if touch begins near left edge (within 30px) or sidebar is open
    isSwiping.current = touch.clientX < 30 || mobileOpen
  }, [mobileOpen])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return
    const touch = e.touches[0]
    if (!touch) return
    touchCurrentX.current = touch.clientX
    const dy = Math.abs(touch.clientY - touchStartY.current)
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

  return (
    <div className="flex h-screen bg-bg overflow-hidden">

      {/* ── Mobile backdrop — hidden on lg: via CSS ── */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ──────────────────────────────── */}
      {/* Mobile: fixed overlay, off-screen by default, slides in when mobileOpen */}
      {/* Desktop (lg:): static sidebar, collapsed (60px) or expanded (240px) */}
      <aside
        ref={sidebarRef}
        className={[
          'bg-[#0F1117] flex flex-col overflow-hidden',
          // Mobile: fixed overlay sidebar
          'fixed inset-y-0 left-0 z-50 w-[280px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static sidebar, override mobile positioning
          'lg:static lg:z-auto lg:translate-x-0 lg:flex-shrink-0 lg:transition-[width] lg:duration-200',
          collapsed ? 'lg:w-[60px]' : 'lg:w-[240px]',
        ].join(' ')}
      >

        {/* Logo row */}
        <div className="h-[60px] flex items-center px-4 flex-shrink-0 gap-3">
          {/* Full logo: always on mobile, only when expanded on desktop */}
          <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white whitespace-nowrap lg:hidden">
            Yalla<span className="text-brand">.</span>House
          </Link>
          {!collapsed && (
            <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white whitespace-nowrap hidden lg:inline">
              Yalla<span className="text-brand">.</span>House
            </Link>
          )}
          {section === 'admin' && (
            <span className={`text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-brand rounded-sm text-text-primary ${collapsed ? 'hidden lg:hidden' : 'hidden lg:inline'}`}>
              Admin
            </span>
          )}
          {section === 'admin' && (
            <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-brand rounded-sm text-text-primary lg:hidden">
              Admin
            </span>
          )}
          {/* Collapsed logo — desktop only */}
          {collapsed && (
            <Link href="/" className="font-extrabold text-[1.1rem] tracking-tight text-brand mx-auto hidden lg:inline">
              Y
            </Link>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 rounded-md text-white/40 hover:text-white/80 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop toggle (hidden on mobile via lg:flex) */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="mx-3 mb-2 items-center justify-center gap-2 px-2 py-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors hidden lg:flex"
          title={collapsed ? (shellLabels?.expandSidebar ?? 'Expand sidebar') : (shellLabels?.collapseSidebar ?? 'Collapse sidebar')}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          {!collapsed && <span className="text-xs font-medium">{shellLabels?.collapse ?? 'Collapse'}</span>}
        </button>

        {/* Nav */}
        <nav aria-label="Dashboard navigation" role="navigation" className="flex-1 py-1 px-2 overflow-y-auto overflow-x-hidden">
          <div id="sidebar-nav">
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ transition: 'background 0.15s cubic-bezier(0.16,1,0.3,1), color 0.15s cubic-bezier(0.16,1,0.3,1)' }}
                className={`flex items-center gap-3 rounded-[8px] text-[0.875rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden px-3 py-2.5 ${
                  collapsed ? 'lg:px-0 lg:py-2.5 lg:justify-center' : ''
                } ${
                  active
                    ? 'bg-[rgba(212,118,78,0.12)] text-brand'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-brand' : 'text-white/30'}`}>
                  {(() => { const Icon = iconMap[item.icon]; return Icon ? <Icon size={15} /> : null })()}
                </span>
                {/* Label: always on mobile, conditionally on desktop */}
                <span className="lg:hidden">{item.label}</span>
                {!collapsed && <span className="hidden lg:inline">{item.label}</span>}
              </Link>
            )
          })}
          </div>
        </nav>

        {/* Role switcher — hidden when desktop collapsed */}
        {userRoles && userRoles.length > 1 && (
          <div className={`px-2 pb-2 pt-2 border-t border-white/[0.07] flex-shrink-0 ${collapsed ? 'lg:hidden' : ''}`}>
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
        <div className="px-2 pb-4 pt-3 border-t border-white/[0.07] flex-shrink-0">
          {/* Desktop collapsed — just initials */}
          <div className={`items-center justify-center hidden ${collapsed ? 'lg:flex' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
              {initials}
            </div>
          </div>
          {/* Mobile (always) + desktop expanded */}
          <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'lg:hidden' : ''}`}>
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
                {shellLabels?.signOut ?? 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────── */}
      <div ref={mainRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-border-default flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          {/* Mobile hamburger — CSS-hidden on lg: */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:bg-bg transition-colors lg:hidden"
            aria-label={shellLabels?.openMenu ?? 'Open menu'}
          >
            <Menu size={22} />
          </button>
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

