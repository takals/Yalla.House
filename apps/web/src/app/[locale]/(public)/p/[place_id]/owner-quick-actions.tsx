'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Pencil,
  CalendarPlus,
  CalendarCheck,
  Users,
  BarChart3,
  Globe,
  ChevronDown,
} from 'lucide-react'

interface OwnerQuickActionsProps {
  listingId: string
  translations: {
    quickActions: string
    editListing: string
    propertyDetails: string
    addViewingSlots: string
    manageViewings: string
    inviteAgents: string
    viewAnalytics: string
    portalStatus: string
    portalStatusLive: string
    portalStatusPending: string
    portalStatusNone: string
  }
  portalSyncs?: Array<{ portal: string; status: string }>
}

type ActionItem = {
  key: string
  icon: typeof Pencil
  href?: (id: string) => string
  scrollTo?: string
}

const ACTION_ITEMS: ActionItem[] = [
  { key: 'propertyDetails', icon: Pencil, href: (id: string) => `/owner/${id}` },
  { key: 'addViewingSlots', icon: CalendarPlus, href: () => '/owner/calendar' },
  { key: 'manageViewings', icon: CalendarCheck, href: () => '/owner/viewings' },
  { key: 'inviteAgents', icon: Users, href: () => '/owner/agents' },
  { key: 'viewAnalytics', icon: BarChart3, href: (id: string) => `/owner/${id}/analytics` },
]

export function OwnerQuickActions({ listingId, translations: t, portalSyncs }: OwnerQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-surface rounded-card border border-border-default shadow-sm overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-hover-bg transition-colors"
      >
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          {t.quickActions}
        </p>
        <ChevronDown
          size={16}
          className={`text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-6 pb-5 border-t border-border-default">
          {/* Action grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
            {ACTION_ITEMS.map(item => {
              const Icon = item.icon
              const label = t[item.key as keyof typeof t]

              // Scroll-to action (e.g. "Add viewing slots" scrolls to calendar)
              if (item.scrollTo) {
                return (
                  <button
                    key={item.key}
                    onClick={() => document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
                  >
                    <Icon size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                    <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                      {label}
                    </span>
                  </button>
                )
              }

              const href = item.href ? item.href(listingId) : '#'

              return (
                <Link
                  key={item.key}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
                >
                  <Icon size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                  <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Portal status row */}
          <div className="mt-4 pt-4 border-t border-border-default">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} className="text-text-secondary" />
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                {t.portalStatus}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {portalSyncs && portalSyncs.length > 0 ? (
                portalSyncs.map(sync => (
                  <span
                    key={sync.portal}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                      sync.status === 'live'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : sync.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-bg text-text-secondary'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      sync.status === 'live'
                        ? 'bg-[#166534]'
                        : sync.status === 'pending'
                          ? 'bg-amber-500'
                          : 'bg-text-secondary'
                    }`} />
                    {sync.portal}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-secondary italic">
                  {t.portalStatusNone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
