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
  Mail,
  Copy,
  Check,
} from 'lucide-react'
import { ListingPopup } from './listing-popup'

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

export function OwnerQuickActions({ listingId, translations: t, portalSyncs }: OwnerQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [invitePopupOpen, setInvitePopupOpen] = useState(false)
  const [analyticsPopupOpen, setAnalyticsPopupOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyInviteLink() {
    const url = `${window.location.origin}/p/${listingId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
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
              {/* Property Details */}
              <Link
                href={`/owner/${listingId}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
              >
                <Pencil size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                  {t.propertyDetails}
                </span>
              </Link>

              {/* Add viewing slots */}
              <Link
                href="/owner/calendar"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
              >
                <CalendarPlus size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                  {t.addViewingSlots}
                </span>
              </Link>

              {/* Manage viewings */}
              <Link
                href="/owner/viewings"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
              >
                <CalendarCheck size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                  {t.manageViewings}
                </span>
              </Link>

              {/* Invite agents — opens popup */}
              <button
                onClick={() => setInvitePopupOpen(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
              >
                <Users size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                  {t.inviteAgents}
                </span>
              </button>

              {/* View analytics — opens popup */}
              <button
                onClick={() => setAnalyticsPopupOpen(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg hover:bg-hover-bg border border-border-default hover:border-brand/30 transition-all group"
              >
                <BarChart3 size={20} className="text-text-secondary group-hover:text-brand transition-colors" />
                <span className="text-xs font-semibold text-text-primary text-center leading-tight">
                  {t.viewAnalytics}
                </span>
              </button>
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

      {/* ── Invite Agents Popup ── */}
      <ListingPopup
        open={invitePopupOpen}
        onClose={() => setInvitePopupOpen(false)}
        title={t.inviteAgents}
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Share your listing link with estate agents so they can view your property and contact you directly.
          </p>

          {/* Copy listing link */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Listing Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/p/${listingId}` : `/p/${listingId}`}
                className="flex-1 px-3 py-2 text-sm bg-bg border border-border-default rounded-lg text-text-primary"
              />
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email invite */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Send via Email
            </label>
            <a
              href={`mailto:?subject=Property on Yalla.House&body=Take a look at this property: ${typeof window !== 'undefined' ? window.location.href : ''}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg hover:bg-hover-muted border border-border-default text-text-primary text-sm font-semibold rounded-lg transition-colors"
            >
              <Mail size={14} />
              Email to agent
            </a>
          </div>

          {/* Agent database link */}
          <div className="pt-4 border-t border-border-default">
            <p className="text-xs text-text-secondary mb-3">
              Looking for an agent? Browse our verified agent database.
            </p>
            <Link
              href="/en/agents"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <Users size={14} />
              Browse agents
            </Link>
          </div>
        </div>
      </ListingPopup>

      {/* ── View Analytics Popup ── */}
      <ListingPopup
        open={analyticsPopupOpen}
        onClose={() => setAnalyticsPopupOpen(false)}
        title={t.viewAnalytics}
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Track how your listing is performing across all channels.
          </p>

          {/* Placeholder stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">Page views</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">Enquiries</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">Viewings booked</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">Link shares</p>
            </div>
          </div>

          {/* Full analytics link */}
          <div className="pt-4 border-t border-border-default">
            <Link
              href={`/owner/${listingId}/analytics`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <BarChart3 size={14} />
              View full analytics dashboard
            </Link>
          </div>
        </div>
      </ListingPopup>
    </>
  )
}
