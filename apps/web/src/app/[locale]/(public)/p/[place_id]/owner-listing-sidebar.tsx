'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Pencil, CalendarPlus, CalendarCheck, Users,
  BarChart3, Globe, Share2, Copy, Check, Mail, MessageCircle,
  Link2, Eye, PanelLeftClose, PanelLeftOpen, LogOut,
  Menu, X, ArrowLeft,
} from 'lucide-react'
import { ShareCardModal } from '@/components/share-card'
import { ListingPopup } from './listing-popup'

interface Props {
  listingId: string
  placeId: string
  slug: string | null
  shortId: string | null
  status: string
  locale: string
  listingTitle: string
  address: string
  price: string | null
  photoUrl: string | null
  preMarketOptIn: boolean
  portalSyncs?: Array<{ portal: string; status: string }>
  translations: Record<string, string>
  userEmail: string
  userName: string | null
}

export function OwnerListingSidebar({
  listingId, placeId, slug, shortId, status, locale,
  listingTitle, address, price, photoUrl, preMarketOptIn,
  portalSyncs, translations: t, userEmail, userName,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Status toggle
  const [isLive, setIsLive] = useState(status === 'active')
  const [toggling, setToggling] = useState(false)

  // Pre-market toggle
  const [preMarket, setPreMarket] = useState(preMarketOptIn)
  const [preMarketToggling, setPreMarketToggling] = useState(false)

  // Share dropdown
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedShort, setCopiedShort] = useState(false)

  // Popups
  const [invitePopupOpen, setInvitePopupOpen] = useState(false)
  const [analyticsPopupOpen, setAnalyticsPopupOpen] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)

  const localePrefix = locale === 'de' ? '' : 'en/'
  const canonicalId = slug ?? placeId
  const publicUrl = `https://yalla.house/${localePrefix}p/${canonicalId}`
  const shortUrl = shortId ? `https://yalla.house/${localePrefix}p/${shortId}` : publicUrl

  const initials = (userName ?? userEmail).slice(0, 2).toUpperCase()

  async function handleToggle() {
    setToggling(true)
    const newStatus = isLive ? 'draft' : 'active'
    const res = await fetch('/api/listings/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, status: newStatus }),
    })
    if (res.ok) setIsLive(!isLive)
    setToggling(false)
  }

  async function handlePreMarketToggle() {
    setPreMarketToggling(true)
    const newVal = !preMarket
    const res = await fetch('/api/listings/pre-market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, enabled: newVal }),
    })
    if (res.ok) setPreMarket(newVal)
    setPreMarketToggling(false)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyShortLink() {
    navigator.clipboard.writeText(shortUrl)
    setCopiedShort(true)
    setTimeout(() => setCopiedShort(false), 2000)
  }

  function copyInviteLink() {
    const url = `${window.location.origin}/p/${listingId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedInvite(true)
      setTimeout(() => setCopiedInvite(false), 2000)
    })
  }

  async function handleSignOut() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Quick action nav items
  const navItems = [
    { icon: LayoutDashboard, label: t.backToDashboard ?? 'Dashboard', href: '/owner', isBack: true },
    { icon: Pencil, label: t.propertyDetails ?? 'Property Details', href: `/owner/${listingId}` },
    { icon: CalendarPlus, label: t.addViewingSlots ?? 'Add Viewing Slots', href: '/owner/calendar' },
    { icon: CalendarCheck, label: t.manageViewings ?? 'Manage Viewings', href: '/owner/viewings' },
  ]

  const actionItems = [
    { icon: Users, label: t.inviteAgents ?? 'Invite Agents', onClick: () => setInvitePopupOpen(true) },
    { icon: BarChart3, label: t.viewAnalytics ?? 'View Analytics', onClick: () => setAnalyticsPopupOpen(true) },
  ]

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile hamburger — fixed top-left ── */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="fixed top-3 left-3 z-[60] lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#0F1117] text-brand hover:bg-[#1C1F2E] transition-colors shadow-lg"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={[
          'bg-[#0F1117] flex flex-col overflow-hidden flex-shrink-0',
          // Mobile: fixed overlay drawer
          'fixed inset-y-0 left-0 z-50 w-[240px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static sidebar in flex layout
          'lg:static lg:translate-x-0 lg:z-auto',
          'lg:transition-[width] lg:duration-200',
          expanded ? 'lg:w-[240px]' : 'lg:w-[60px]',
        ].join(' ')}
      >
        {/* Logo row */}
        <div className="h-[60px] flex items-center justify-center flex-shrink-0">
          <Link
            href="/"
            className={`font-extrabold text-[1.1rem] tracking-tight text-brand ${expanded ? 'lg:hidden' : ''}`}
          >
            Y
          </Link>
          {expanded && (
            <Link href="/" className="font-extrabold text-[1.05rem] tracking-tight text-white whitespace-nowrap hidden lg:flex items-center gap-1 px-4">
              Yalla<span className="text-brand">.</span>House
            </Link>
          )}
        </div>

        {/* Desktop expand/collapse toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mx-3 mb-2 items-center justify-center gap-2 px-2 py-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors hidden lg:flex"
          title={expanded ? (t.collapseSidebar ?? 'Collapse') : (t.expandSidebar ?? 'Expand')}
        >
          {expanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          {expanded && <span className="text-xs font-medium">{t.collapse ?? 'Collapse'}</span>}
        </button>

        {/* ── Status controls section ── */}
        <div className={`px-3 pb-3 ${expanded ? '' : 'lg:px-1.5'}`}>
          {/* Live / Draft toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`w-full flex items-center gap-2 rounded-lg transition-colors disabled:opacity-50 ${expanded ? 'px-3 py-2.5' : 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5'}`}
          >
            <div className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${isLive ? 'bg-green-500' : 'bg-white/20'}`}>
              <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${isLive ? 'left-[14px]' : 'left-[2px]'}`} />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${isLive ? 'text-green-400' : 'text-white/40'} ${expanded ? '' : 'lg:hidden'}`}>
              {isLive ? (t.ownerLive ?? 'Live') : (t.ownerDraft ?? 'Draft')}
            </span>
          </button>

          {/* Early Access toggle */}
          <button
            onClick={handlePreMarketToggle}
            disabled={preMarketToggling}
            className={`w-full flex items-center gap-2 rounded-lg transition-colors disabled:opacity-50 mt-1 ${expanded ? 'px-3 py-2' : 'lg:justify-center lg:px-0 lg:py-2 px-3 py-2'}`}
          >
            <Eye size={14} className={`flex-shrink-0 ${preMarket ? 'text-brand' : 'text-white/30'}`} />
            <span className={`text-xs font-semibold whitespace-nowrap ${preMarket ? 'text-brand' : 'text-white/40'} ${expanded ? '' : 'lg:hidden'}`}>
              {t.ownerPreMarket ?? 'Early Access'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/[0.07] mb-2" />

        {/* ── Navigation items ── */}
        <nav className="flex-1 py-1 px-2 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={item.label}
              className={[
                'flex items-center rounded-[8px] text-[0.8125rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden',
                'justify-start px-3 py-2.5 gap-3',
                expanded ? '' : 'lg:justify-center lg:px-0 lg:gap-0',
                item.isBack
                  ? 'text-white/30 hover:text-white hover:bg-white/[0.05]'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <item.icon size={15} className="flex-shrink-0" />
              <span className={expanded ? '' : 'lg:hidden'}>{item.label}</span>
            </Link>
          ))}

          {/* Action buttons (open popups) */}
          {actionItems.map(item => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setMobileOpen(false); }}
              title={item.label}
              className={[
                'w-full flex items-center rounded-[8px] text-[0.8125rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden',
                'justify-start px-3 py-2.5 gap-3',
                expanded ? '' : 'lg:justify-center lg:px-0 lg:gap-0',
                'text-white/50 hover:text-white hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <item.icon size={15} className="flex-shrink-0" />
              <span className={expanded ? '' : 'lg:hidden'}>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div className="mx-1 my-2 border-t border-white/[0.07]" />

          {/* Share button */}
          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              title={t.ownerShare ?? 'Share'}
              className={[
                'w-full flex items-center rounded-[8px] text-[0.8125rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden',
                'justify-start px-3 py-2.5 gap-3',
                expanded ? '' : 'lg:justify-center lg:px-0 lg:gap-0',
                'text-white/50 hover:text-white hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <Share2 size={15} className="flex-shrink-0" />
              <span className={expanded ? '' : 'lg:hidden'}>{t.ownerShare ?? 'Share'}</span>
            </button>

            {shareOpen && (
              <div className={`absolute z-50 w-56 bg-[#1C1F2E] rounded-xl shadow-2xl border border-white/10 p-3 space-y-1 ${expanded ? 'left-full ml-2 top-0' : 'left-full ml-2 top-0 lg:left-[60px]'}`}>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
                  {copied ? (t.ownerCopied ?? 'Copied!') : (t.ownerCopyLink ?? 'Copy link')}
                </button>
                {shortId && (
                  <button
                    onClick={handleCopyShortLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    {copiedShort ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copiedShort ? (t.ownerCopied ?? 'Copied!') : (t.ownerCopyShortLink ?? 'Short link')}
                  </button>
                )}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent((t.ownerShareText ?? 'Check out this property') + ' ' + publicUrl)}`}
                  target="_blank"
                  rel="noopener"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(t.ownerEmailSubject ?? 'Property on Yalla.House')}&body=${encodeURIComponent((t.ownerShareText ?? 'Check out this property') + '\n\n' + publicUrl)}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Mail size={14} />
                  Email
                </a>
                <div className="border-t border-white/10 my-1" />
                <ShareCardModal
                  listingTitle={listingTitle}
                  address={address}
                  price={price}
                  photoUrl={photoUrl}
                  shareUrl={publicUrl}
                  shortUrl={shortUrl}
                  locale={locale}
                />
              </div>
            )}
          </div>
        </nav>

        {/* ── Portal status section — expanded only ── */}
        {expanded && portalSyncs && (
          <div className="px-3 pb-3 border-t border-white/[0.07] pt-3 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={12} className="text-white/30" />
              <span className="text-[0.6rem] font-bold uppercase tracking-wider text-white/30">
                {t.portalStatus ?? 'Portal Status'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {portalSyncs.length > 0 ? (
                portalSyncs.map(sync => (
                  <span
                    key={sync.portal}
                    className={`inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-1 rounded-full ${
                      sync.status === 'live'
                        ? 'bg-green-500/20 text-green-400'
                        : sync.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-white/5 text-white/40'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${
                      sync.status === 'live' ? 'bg-green-400' : sync.status === 'pending' ? 'bg-amber-400' : 'bg-white/40'
                    }`} />
                    {sync.portal}
                  </span>
                ))
              ) : (
                <span className="text-[0.65rem] text-white/30 italic">
                  {t.portalStatusNone ?? 'No portals connected'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── User footer ── */}
        <div className="px-2 pb-4 pt-3 border-t border-white/[0.07] flex-shrink-0">
          <div className={`items-center justify-center hidden ${expanded ? '' : 'lg:flex'}`}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
              {initials}
            </div>
          </div>
          <div className={`flex items-center gap-3 px-2 py-2 ${expanded ? '' : 'lg:hidden'}`}>
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
                {t.signOut ?? 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Invite Agents Popup ── */}
      <ListingPopup
        open={invitePopupOpen}
        onClose={() => setInvitePopupOpen(false)}
        title={t.inviteAgents ?? 'Invite Agents'}
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            {t.inviteAgentsDesc ?? 'Share your listing link with estate agents so they can view your property and contact you directly.'}
          </p>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              {t.listingLink ?? 'Listing Link'}
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
                {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
                {copiedInvite ? (t.copied ?? 'Copied!') : (t.copy ?? 'Copy')}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              {t.sendViaEmail ?? 'Send via Email'}
            </label>
            <a
              href={`mailto:?subject=${encodeURIComponent(t.inviteEmailSubject ?? 'Property on Yalla.House')}&body=${encodeURIComponent(t.inviteEmailBody ?? 'Take a look at this property: ') + (typeof window !== 'undefined' ? window.location.href : '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg hover:bg-hover-muted border border-border-default text-text-primary text-sm font-semibold rounded-lg transition-colors"
            >
              <Mail size={14} />
              {t.emailToAgent ?? 'Email to agent'}
            </a>
          </div>
          <div className="pt-4 border-t border-border-default">
            <p className="text-xs text-text-secondary mb-3">
              {t.browseAgentsHint ?? 'Looking for an agent? Browse our verified agent database.'}
            </p>
            <Link
              href="/en/agents"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <Users size={14} />
              {t.browseAgents ?? 'Browse agents'}
            </Link>
          </div>
        </div>
      </ListingPopup>

      {/* ── View Analytics Popup ── */}
      <ListingPopup
        open={analyticsPopupOpen}
        onClose={() => setAnalyticsPopupOpen(false)}
        title={t.viewAnalytics ?? 'View Analytics'}
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            {t.analyticsDesc ?? 'Track how your listing is performing across all channels.'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">{t.pageViews ?? 'Page views'}</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">{t.enquiries ?? 'Enquiries'}</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">{t.viewingsBooked ?? 'Viewings booked'}</p>
            </div>
            <div className="bg-bg rounded-xl p-4 border border-border-default text-center">
              <p className="text-2xl font-extrabold text-text-primary">0</p>
              <p className="text-xs text-text-secondary mt-1">{t.linkShares ?? 'Link shares'}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border-default">
            <Link
              href={`/owner/${listingId}/analytics`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <BarChart3 size={14} />
              {t.viewFullAnalytics ?? 'View full analytics dashboard'}
            </Link>
          </div>
        </div>
      </ListingPopup>
    </>
  )
}
