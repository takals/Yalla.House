'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { LocaleLink as Link } from '@/components/locale-link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Pencil, CalendarPlus, CalendarCheck, Users,
  BarChart3, Globe, Share2, Copy, Check, Mail, MessageCircle,
  Link2, Eye, PanelLeftClose, PanelLeftOpen, LogOut,
  Menu, X, Megaphone, ShoppingBag,
  ChevronRight, PartyPopper, Search, Send, MessageSquare,
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

/* ── Sidebar tooltip — portalled to <body> to escape transform-based containing blocks ── */
function SidebarHint({ id, desc, next, nextLabel, rect }: {
  id?: string; desc: string; next?: string; nextLabel: string; rect: DOMRect | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  // Anchor beside the trigger, then clamp into the viewport: flip to the left if
  // the right edge would overflow, and clamp vertically so it never clips off-screen.
  useLayoutEffect(() => {
    const el = ref.current
    if (!rect || !el) { setPos(null); return }
    const m = 12
    const r = el.getBoundingClientRect()
    let left = rect.right + m
    if (left + r.width > window.innerWidth - m) left = Math.max(m, rect.left - r.width - m)
    let top = rect.top + rect.height / 2 - r.height / 2
    top = Math.min(Math.max(m, top), window.innerHeight - r.height - m)
    setPos({ left, top })
  }, [rect])

  if (!rect || typeof document === 'undefined') return null
  return createPortal(
    <div
      ref={ref}
      id={id}
      role="tooltip"
      className="fixed z-[9999] pointer-events-none hidden lg:block w-64 bg-[#1C1F2E] border border-white/10 rounded-xl shadow-2xl p-3.5 animate-in fade-in zoom-in-95 duration-150"
      style={pos
        ? { left: pos.left, top: pos.top }
        : { left: rect.right + 12, top: rect.top + rect.height / 2, transform: 'translateY(-50%)', visibility: 'hidden' }}
    >
      <p className="text-[0.8125rem] text-white/80 leading-snug">{desc}</p>
      {next && (
        <div className="mt-2.5 pt-2.5 border-t border-white/[0.07] flex items-center gap-1.5">
          <ChevronRight size={12} className="text-brand flex-shrink-0" />
          <p className="text-[0.75rem] font-semibold text-brand/80">
            <span className="text-white/30 font-normal">{nextLabel}:</span> {next}
          </p>
        </div>
      )}
    </div>,
    document.body,
  )
}

export function OwnerListingSidebar({
  listingId, placeId, slug, shortId, status, locale,
  listingTitle, address, price, photoUrl, preMarketOptIn,
  portalSyncs, translations: t, userEmail, userName,
}: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Status toggle
  const [isLive, setIsLive] = useState(status === 'active')
  const [toggling, setToggling] = useState(false)

  // Celebration banner after going live
  const [showCelebration, setShowCelebration] = useState(false)

  // Pre-market toggle
  const [preMarket, setPreMarket] = useState(preMarketOptIn)
  const [preMarketToggling, setPreMarketToggling] = useState(false)

  // Share dropdown
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedShort, setCopiedShort] = useState(false)

  // Tooltip hover — track which item + its bounding rect for fixed positioning
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [hintRect, setHintRect] = useState<DOMRect | null>(null)

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
    if (res.ok) {
      const wasGoingLive = !isLive
      setIsLive(!isLive)
      router.refresh() // refresh server component to update status badge
      if (wasGoingLive) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 12000)
      }
    }
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

  const nextLabel = t.hintNextStep ?? 'Next step'

  // Show/hide hint on both pointer hover and keyboard focus (onFocus/onBlur bubble
  // from the inner link/button to this wrapper). Reused across every sidebar item.
  const hintHandlers = (key: string) => {
    const show = (e: { currentTarget: Element }) => {
      setHoveredItem(key)
      setHintRect((e.currentTarget as HTMLElement).getBoundingClientRect())
    }
    const hide = () => { setHoveredItem(null); setHintRect(null) }
    return { onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide }
  }

  // Dismiss any open hint on scroll/resize — a fixed-position portal would
  // otherwise float detached from its (now-moved) trigger.
  useEffect(() => {
    if (!hoveredItem) return
    const clear = () => { setHoveredItem(null); setHintRect(null) }
    window.addEventListener('scroll', clear, true)
    window.addEventListener('resize', clear)
    return () => {
      window.removeEventListener('scroll', clear, true)
      window.removeEventListener('resize', clear)
    }
  }, [hoveredItem])

  // Quick action nav items
  const navItems = [
    { icon: LayoutDashboard, label: t.backToDashboard ?? 'Dashboard', href: '/owner', isBack: true, key: 'dashboard', hint: t.hintDashboardDesc, hintNext: t.hintDashboardNext },
    { icon: Pencil, label: t.propertyDetails ?? 'Property Details', href: `/owner/${listingId}`, key: 'property', hint: t.hintPropertyDesc, hintNext: t.hintPropertyNext },
    { icon: CalendarPlus, label: t.addViewingSlots ?? 'Add Viewing Slots', href: '/owner/calendar', key: 'slots', hint: t.hintSlotsDesc, hintNext: t.hintSlotsNext },
    { icon: CalendarCheck, label: t.manageViewings ?? 'Manage Viewings', href: '/owner/viewings', key: 'viewings', hint: t.hintViewingsDesc, hintNext: t.hintViewingsNext },
  ]

  const actionItems = [
    { icon: Users, label: t.inviteAgents ?? 'Invite Agents', onClick: () => setInvitePopupOpen(true), key: 'invite', hint: t.hintInviteDesc, hintNext: t.hintInviteNext },
    { icon: BarChart3, label: t.viewAnalytics ?? 'View Analytics', onClick: () => setAnalyticsPopupOpen(true), key: 'analytics', hint: t.hintAnalyticsDesc },
  ]

  const growthItems = [
    { icon: Megaphone, label: t.publishPortals ?? 'Publish to Portals', href: `/owner/${listingId}#portals`, key: 'portals', hint: t.hintPortalsDesc, hintNext: t.hintPortalsNext },
    { icon: ShoppingBag, label: t.orderServices ?? 'Order Services', href: `/${localePrefix}marketplace`, key: 'services', hint: t.hintServicesDesc },
  ]

  return (
    <>
      {/* ── Celebration banner — shown when going live ── */}
      {showCelebration && (
        <div className="fixed top-0 left-0 right-0 z-[70] bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white px-4 py-3 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PartyPopper size={20} className="flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">{t.celebrationTitle ?? 'Your property is live!'}</p>
                <p className="text-xs text-white/80">{t.celebrationDesc ?? 'Buyers can now find your listing. What would you like to do next?'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/${localePrefix}marketplace`}
                onClick={() => setShowCelebration(false)}
                className="text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.celebrationServices ?? 'Order a sign'}
              </Link>
              <button
                onClick={() => { setShareOpen(true); setShowCelebration(false) }}
                className="text-xs font-semibold bg-white text-green-700 hover:bg-white/90 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.celebrationShare ?? 'Share it'}
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
            aria-label={isLive ? (t.ownerLive ?? 'Live') : (t.ownerDraft ?? 'Draft')}
            aria-pressed={isLive}
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
          <div className="relative" {...hintHandlers('earlyAccess')}>
            <button
              onClick={handlePreMarketToggle}
              disabled={preMarketToggling}
              aria-label={t.ownerPreMarket ?? 'Early Access'}
              aria-pressed={preMarket}
              aria-describedby={hoveredItem === 'earlyAccess' ? 'sidebar-hint-earlyAccess' : undefined}
              className={`w-full flex items-center gap-2 rounded-lg transition-colors disabled:opacity-50 mt-1 ${expanded ? 'px-3 py-2' : 'lg:justify-center lg:px-0 lg:py-2 px-3 py-2'}`}
            >
              <Eye size={14} className={`flex-shrink-0 ${preMarket ? 'text-brand' : 'text-white/30'}`} />
              <span className={`text-xs font-semibold whitespace-nowrap ${preMarket ? 'text-brand' : 'text-white/40'} ${expanded ? '' : 'lg:hidden'}`}>
                {t.ownerPreMarket ?? 'Early Access'}
              </span>
            </button>
            {hoveredItem === 'earlyAccess' && (
              <SidebarHint id="sidebar-hint-earlyAccess" desc={t.ownerPreMarketHint ?? 'Let verified hunters see this listing before it goes live on portals.'} nextLabel={nextLabel} rect={hintRect} />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/[0.07] mb-2" />

        {/* ── Navigation items ── */}
        <nav className="flex-1 py-1 px-2 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <div
              key={item.key}
              className="relative"
              {...hintHandlers(item.key)}
            >
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-label={item.label}
                aria-describedby={hoveredItem === item.key ? `sidebar-hint-${item.key}` : undefined}
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
              {item.hint && hoveredItem === item.key && (
                <SidebarHint id={`sidebar-hint-${item.key}`} desc={item.hint} next={item.hintNext} nextLabel={nextLabel} rect={hintRect} />
              )}
            </div>
          ))}

          {/* Action buttons (open popups) */}
          {actionItems.map(item => (
            <div
              key={item.key}
              className="relative"
              {...hintHandlers(item.key)}
            >
              <button
                onClick={() => { item.onClick(); setMobileOpen(false); }}
                aria-label={item.label}
                aria-describedby={hoveredItem === item.key ? `sidebar-hint-${item.key}` : undefined}
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
              {item.hint && hoveredItem === item.key && (
                <SidebarHint id={`sidebar-hint-${item.key}`} desc={item.hint} next={item.hintNext} nextLabel={nextLabel} rect={hintRect} />
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="mx-1 my-2 border-t border-white/[0.07]" />

          {/* Growth items — Portals + Services */}
          {growthItems.map(item => (
            <div
              key={item.key}
              className="relative"
              {...hintHandlers(item.key)}
            >
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-label={item.label}
                aria-describedby={hoveredItem === item.key ? `sidebar-hint-${item.key}` : undefined}
                className={[
                  'flex items-center rounded-[8px] text-[0.8125rem] font-semibold mb-0.5 whitespace-nowrap overflow-hidden',
                  'justify-start px-3 py-2.5 gap-3',
                  expanded ? '' : 'lg:justify-center lg:px-0 lg:gap-0',
                  'text-brand/70 hover:text-brand hover:bg-brand/5',
                ].join(' ')}
              >
                <item.icon size={15} className="flex-shrink-0" />
                <span className={expanded ? '' : 'lg:hidden'}>{item.label}</span>
              </Link>
              {item.hint && hoveredItem === item.key && (
                <SidebarHint id={`sidebar-hint-${item.key}`} desc={item.hint} next={item.hintNext} nextLabel={nextLabel} rect={hintRect} />
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="mx-1 my-2 border-t border-white/[0.07]" />

          {/* Share button */}
          <div
            className="relative"
            {...hintHandlers('share')}
          >
            <button
              onClick={() => { setShareOpen(!shareOpen); setHoveredItem(null); }}
              aria-label={t.ownerShare ?? 'Share'}
              aria-expanded={shareOpen}
              aria-describedby={hoveredItem === 'share' ? 'sidebar-hint-share' : undefined}
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
            {!shareOpen && (
              <SidebarHint id="sidebar-hint-share" desc={t.hintShareDesc ?? 'Share your listing via link, WhatsApp, or email.'} nextLabel={nextLabel} rect={hoveredItem === 'share' ? hintRect : null} />
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
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            {t.inviteAgentsDescV2 ?? 'Find agents near your property and send them a brief — all communication stays in-platform so your details remain private.'}
          </p>

          <div className="bg-bg rounded-xl p-4 border border-border-default space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Search size={14} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t.inviteStep1 ?? 'Search by postcode'}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t.inviteStep1Desc ?? 'Find verified agents near your property from our database.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <Send size={14} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t.inviteStep2 ?? 'Send a brief'}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t.inviteStep2Desc ?? 'Select agents and send them your property details in one click.'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={14} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{t.inviteStep3 ?? 'Chat in-app'}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t.inviteStep3Desc ?? 'All replies come to your Deal Room — no phone calls or emails needed.'}</p>
              </div>
            </div>
          </div>

          <Link
            href="/owner/agents"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Users size={14} />
            {t.browseAgents ?? 'Browse agents'}
          </Link>
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
