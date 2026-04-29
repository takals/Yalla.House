'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Home, Building2, Plus, Calendar, CalendarDays, Star,
  ShieldCheck, Handshake, Inbox, Settings, Users, UserCircle,
  LogOut, Search, PanelLeftClose, PanelLeftOpen, Banknote, Eye,
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

  // Desktop only: collapsed (60px icons) or expanded (240px icons + labels)
  // Mobile/tablet: always collapsed (60px icon strip)
  const [expanded, setExpanded] = useState(false)

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

      {/* ── Sidebar — always visible ───────────────────────── */}
      {/* All screens: static 60px icon strip                   */}
      {/* Desktop (lg:): toggleable between 60px and 240px      */}
      <aside
        className={[
          'bg-[#0F1117] flex flex-col overflow-hidden flex-shrink-0',
          'w-[60px] transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          expanded ? 'lg:w-[240px]' : 'lg:w-[60px]',
        ].join(' ')}
      >

        {/* Logo row */}
        <div className="h-[60px] flex items-center justify-center flex-shrink-0">
          {/* Collapsed: brand initial */}
          <Link
            href="/"
            className={`font-extrabold text-[1.1rem] tracking-tight text-brand ${expanded ? 'lg:hidden' : ''}`}
          >
            Y
          </Link>
          {/* Expanded: full logo (desktop only) */}
          {expanded && (
            <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white whitespace-nowrap hidden lg:flex items-center gap-1 px-4">
              Yalla<span className="text-brand">.</span>House
              {section === 'admin' && (
                <span className="text-[0.6rem] font-black uppercase tracking-wider px-1.5 py-0.5 bg-brand rounded-sm text-text-primary ml-1">
                  Admin
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Desktop expand/collapse toggle — hidden on mobile/tablet */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mx-3 mb-2 items-center justify-center gap-2 px-2 py-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors hidden lg:flex"
          title={expanded ? (shellLabels?.collapseSidebar ?? 'Collapse sidebar') : (shellLabels?.expandSidebar ?? 'Expand sidebar')}
          aria-expanded={expanded}
          aria-controls="sidebar-nav"
        >
          {expanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          {expanded && <span className="text-xs font-medium">{shellLabels?.collapse ?? 'Collapse'}</span>}
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
                title={item.label}
                style={{ transition: 'background 0.15s cubic-bezier(0.16,1,0.3,1), color 0.15s cubic-bezier(0.16,1,0.3,1)' }}
                className={[
                  'flex items-center rounded-[8px] text-[0.875rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden',
                  // Collapsed: centered icon, no label
                  'justify-center px-0 py-2.5',
                  // Expanded (desktop only): left-aligned with gap
                  expanded ? 'lg:justify-start lg:px-3 lg:gap-3' : '',
                  active
                    ? 'bg-[rgba(212,118,78,0.12)] text-brand'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.05]',
                ].join(' ')}
              >
                <span className={`flex-shrink-0 ${active ? 'text-brand' : 'text-white/30'}`}>
                  {(() => { const Icon = iconMap[item.icon]; return Icon ? <Icon size={15} /> : null })()}
                </span>
                {/* Label only visible when expanded on desktop */}
                {expanded && <span className="hidden lg:inline">{item.label}</span>}
              </Link>
            )
          })}
          </div>
        </nav>

        {/* Role switcher — only when expanded on desktop */}
        {expanded && userRoles && userRoles.length > 1 && (
          <div className="px-2 pb-2 pt-2 border-t border-white/[0.07] flex-shrink-0 hidden lg:block">
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
          {/* Collapsed (all screens): just initials */}
          <div className={`flex items-center justify-center ${expanded ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
              {initials}
            </div>
          </div>
          {/* Expanded (desktop only): name + sign out */}
          {expanded && (
            <div className="hidden lg:flex items-center gap-3 px-2 py-2">
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
          )}
        </div>
      </aside>

      {/* ── Main area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-[60px] bg-white border-b border-border-default flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
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
