'use client'

import { useState, useTransition, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Camera, Upload, FileText, Eye, Users, Home,
  Building2, ChevronDown, Check, Pencil,
} from 'lucide-react'
import { createDraftAction, updateWorkspaceFieldAction } from './actions'

/* ── Types ──────────────────────────────────────────────────────── */

interface PhotoRow {
  id: string
  url: string
  thumb_url: string | null
  is_primary: boolean
  sort_order: number
  type: string
}

interface ListingData {
  id: string
  status: string
  intent: string
  property_type: string
  address_line1: string
  address_line2: string | null
  city: string
  postcode: string
  title_de: string | null
  title: string | null
  description_de: string | null
  size_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  total_floors: number | null
  construction_year: number | null
  sale_price: number | null
  rent_price: number | null
  listing_media: PhotoRow[]
}

// All label keys used in the workspace
type WorkspaceLabels = Record<
  'pageTitle' | 'draftBadge' | 'progressLabel' | 'coverPhotoLabel' | 'coverPhotoHint' |
  'titlePlaceholder' | 'addressPlaceholder' | 'saleLabel' | 'rentLabel' |
  'photosTitle' | 'photosHint' | 'uploadPhotos' | 'exampleLabel' |
  'detailsTitle' | 'bedroomsLabel' | 'bathroomsLabel' | 'sizeLabel' | 'typeLabel' | 'yearLabel' |
  'descriptionTitle' | 'descriptionPlaceholder' |
  'documentsTitle' | 'floorPlanLabel' | 'epcLabel' | 'titleDeedsLabel' | 'uploadLabel' |
  'visibilityTitle' | 'visibilityDraft' | 'visibilityComingSoon' | 'visibilityInviteAgents' | 'visibilityPublic' |
  'agentsTitle' | 'agentsHint' | 'inviteAgents' |
  'priceTitle' | 'pricePlaceholder' |
  'createDraft' | 'saving' | 'saved' | 'newWorkspace' | 'newWorkspaceDesc',
  string
>

interface Props {
  listing: ListingData | null
  labels: WorkspaceLabels
  isGuest: boolean
}

/* ── Helpers ────────────────────────────────────────────────────── */

function computeProgress(l: ListingData | null): number {
  if (!l) return 0
  const checks = [
    !!l.title_de || !!l.title,
    !!l.address_line1,
    !!l.city,
    !!l.postcode,
    !!l.property_type,
    l.bedrooms !== null && l.bedrooms > 0,
    l.bathrooms !== null && l.bathrooms > 0,
    l.size_sqm !== null && l.size_sqm > 0,
    !!l.description_de,
    (l.listing_media?.length ?? 0) > 0,
    l.sale_price !== null || l.rent_price !== null,
    l.construction_year !== null,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

/* ── Progress Ring ──────────────────────────────────────────────── */

function ProgressRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct < 30 ? '#EF4444' : pct < 70 ? '#F59E0B' : '#22C55E'
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={4} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em"
        className="text-[0.7rem] font-bold fill-text-primary"
      >{pct}%</text>
    </svg>
  )
}

/* ── Inline Editable Field ──────────────────────────────────────── */

function InlineEdit({
  value, placeholder, onSave, className = '', multiline = false,
}: {
  value: string
  placeholder: string
  onSave: (v: string) => void
  className?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const commit = useCallback(() => {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }, [draft, value, onSave])

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
          placeholder={placeholder}
          className={`w-full bg-transparent border border-brand/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand resize-none ${className}`}
          rows={4}
        />
      )
    }
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        placeholder={placeholder}
        className={`w-full bg-transparent border border-brand/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
      />
    )
  }

  return (
    <div
      onClick={() => { setDraft(value); setEditing(true) }}
      className={`group cursor-text flex items-center gap-2 hover:bg-bg rounded-lg px-3 py-2 -mx-3 transition-colors ${className}`}
    >
      <span className={value ? 'text-text-primary' : 'text-text-secondary italic'}>
        {value || placeholder}
      </span>
      <Pencil size={12} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  )
}

/* ── Section Card ───────────────────────────────────────────────── */

function ModuleCard({
  title, icon: Icon, children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface rounded-card border border-border-default p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-brand" />
        </div>
        <h3 className="text-[0.9375rem] font-bold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────────── */

export function PropertyWorkspace({ listing: initial, labels, isGuest }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [listing, setListing] = useState<ListingData | null>(initial)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [intent, setIntent] = useState<'sale' | 'rent'>((initial?.intent as 'sale' | 'rent') ?? 'sale')
  const [visibility, setVisibility] = useState<string>('draft')

  const progress = computeProgress(listing)

  /* ── Create draft ────────────────────────────────────────────── */
  function handleCreateDraft() {
    startTransition(async () => {
      const result = await createDraftAction(locale)
      if ('authRequired' in result) {
        router.push('/auth/login')
        return
      }
      if ('error' in result) return
      // Reload the page to pick up the new listing
      router.refresh()
    })
  }

  /* ── Auto-save field ─────────────────────────────────────────── */
  function autoSave(field: string, value: string | number | null) {
    if (!listing) return
    setSaveStatus('saving')
    startTransition(async () => {
      const result = await updateWorkspaceFieldAction(listing.id, field, value)
      if ('ok' in result) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    })
  }

  /* ── Empty state — no draft yet ──────────────────────────────── */
  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          {/* Draft house illustration */}
          <div className="mx-auto w-64 h-40 rounded-2xl bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] border-2 border-dashed border-[#CBD5E1] flex items-center justify-center relative overflow-hidden">
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="opacity-40">
              <path d="M60 8L10 45V85H50V60H70V85H110V45L60 8Z" fill="#94A3B8" stroke="#64748B" strokeWidth="2"/>
              <rect x="42" y="35" width="16" height="16" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="62" y="35" width="16" height="16" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5"/>
              <path d="M55 60H65V85H55V60Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5"/>
              <circle cx="63" cy="73" r="1.5" fill="#94A3B8"/>
            </svg>
            <div className="absolute top-3 right-3 bg-[#94A3B8]/20 text-[#64748B] text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {labels.draftBadge}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">{labels.newWorkspace}</h2>
            <p className="text-text-secondary text-sm">{labels.newWorkspaceDesc}</p>
          </div>
          <button
            onClick={handleCreateDraft}
            disabled={isPending || isGuest}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            <Home size={16} />
            {isPending ? labels.saving : labels.createDraft}
          </button>
        </div>
      </div>
    )
  }

  /* ── Workspace with listing ──────────────────────────────────── */
  const photos = listing.listing_media ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header zone ────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border-default bg-surface">

        {/* Cover photo — greyed draft house */}
        <div className="h-48 sm:h-56 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center relative">
          <svg width="200" height="140" viewBox="0 0 200 140" fill="none" className="opacity-30">
            <path d="M100 12L15 72V130H75V95H125V130H185V72L100 12Z" fill="#94A3B8" stroke="#64748B" strokeWidth="2.5"/>
            <rect x="65" y="50" width="25" height="22" rx="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
            <rect x="110" y="50" width="25" height="22" rx="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
            <path d="M88 95H112V130H88V95Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
            <circle cx="108" cy="113" r="2.5" fill="#94A3B8"/>
            <rect x="45" y="55" width="12" height="18" rx="1" fill="#CBD5E1" opacity="0.5"/>
            <rect x="143" y="55" width="12" height="18" rx="1" fill="#CBD5E1" opacity="0.5"/>
            <path d="M100 0L95 12H105L100 0Z" fill="#94A3B8" opacity="0.4"/>
          </svg>

          {/* Draft overlay badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-[#94A3B8]/20 backdrop-blur-sm text-[#475569] text-[0.7rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#94A3B8]/30">
              {labels.draftBadge}
            </span>
          </div>

          {/* Upload cover photo button */}
          <button className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm text-text-primary text-sm font-medium px-4 py-2 rounded-lg border border-border-default hover:bg-white transition-colors">
            <Camera size={14} />
            {labels.coverPhotoLabel}
          </button>
        </div>

        {/* Title + Meta row */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-4">
            {/* Progress ring */}
            <ProgressRing pct={progress} />

            <div className="flex-1 min-w-0 space-y-1">
              {/* Editable title */}
              <InlineEdit
                value={listing.title_de ?? listing.title ?? ''}
                placeholder={labels.titlePlaceholder}
                onSave={v => {
                  setListing(prev => prev ? { ...prev, title_de: v, title: v } : prev)
                  autoSave('title_de', v)
                  autoSave('title', v)
                }}
                className="text-xl font-bold"
              />
              {/* Address + intent toggle */}
              <div className="flex items-center gap-3 flex-wrap">
                <InlineEdit
                  value={[listing.address_line1, listing.postcode, listing.city].filter(Boolean).join(', ')}
                  placeholder={labels.addressPlaceholder}
                  onSave={v => {
                    // For now, save as address_line1 — full address parsing comes in Phase 2
                    setListing(prev => prev ? { ...prev, address_line1: v } : prev)
                    autoSave('address_line1', v)
                  }}
                  className="text-sm text-text-secondary"
                />

                {/* Sale / Rent toggle */}
                <div className="flex items-center bg-bg rounded-lg p-0.5 border border-border-default">
                  <button
                    onClick={() => { setIntent('sale'); autoSave('intent', 'sale') }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      intent === 'sale'
                        ? 'bg-brand text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {labels.saleLabel}
                  </button>
                  <button
                    onClick={() => { setIntent('rent'); autoSave('intent', 'rent') }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      intent === 'rent'
                        ? 'bg-brand text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {labels.rentLabel}
                  </button>
                </div>
              </div>
            </div>

            {/* Save indicator */}
            {saveStatus !== 'idle' && (
              <span className={`text-xs font-medium flex items-center gap-1 flex-shrink-0 ${
                saveStatus === 'saving' ? 'text-text-secondary' : 'text-green-600'
              }`}>
                {saveStatus === 'saving' ? (
                  <span className="inline-block w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                {saveStatus === 'saving' ? labels.saving : labels.saved}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Module Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Photos */}
        <ModuleCard title={labels.photosTitle} icon={Camera}>
          <div className="grid grid-cols-3 gap-2">
            {/* Example photos — greyed placeholders */}
            {[
              { label: 'Living Room', emoji: '🛋️' },
              { label: 'Kitchen', emoji: '🍳' },
              { label: 'Bedroom', emoji: '🛏️' },
            ].map((ex, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] border border-dashed border-[#CBD5E1] flex flex-col items-center justify-center gap-1 relative">
                <span className="text-2xl opacity-40">{ex.emoji}</span>
                <span className="text-[0.6rem] text-[#94A3B8] font-medium">{ex.label}</span>
                <span className="absolute top-1 right-1 bg-[#94A3B8]/20 text-[#64748B] text-[0.5rem] font-bold uppercase px-1.5 py-0.5 rounded">
                  {labels.exampleLabel}
                </span>
              </div>
            ))}
            {/* Real photos (if any) */}
            {photos.map(p => (
              <div key={p.id} className="aspect-[4/3] rounded-lg overflow-hidden border border-border-default">
                <img src={p.thumb_url ?? p.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {/* Upload slot */}
            <button className="aspect-[4/3] rounded-lg border-2 border-dashed border-brand/30 flex flex-col items-center justify-center gap-1 hover:border-brand/60 hover:bg-[#FFF4EF]/30 transition-colors">
              <Upload size={16} className="text-brand/50" />
              <span className="text-[0.65rem] font-medium text-brand/60">{labels.uploadPhotos}</span>
            </button>
          </div>
          <p className="text-xs text-text-secondary">{labels.photosHint}</p>
        </ModuleCard>

        {/* Property Details */}
        <ModuleCard title={labels.detailsTitle} icon={Home}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: labels.bedroomsLabel, field: 'bedrooms', value: listing.bedrooms },
              { label: labels.bathroomsLabel, field: 'bathrooms', value: listing.bathrooms },
              { label: labels.sizeLabel, field: 'size_sqm', value: listing.size_sqm },
              { label: labels.yearLabel, field: 'construction_year', value: listing.construction_year },
            ].map(d => (
              <div key={d.field} className="space-y-1">
                <label className="text-xs font-medium text-text-secondary">{d.label}</label>
                <input
                  type="number"
                  defaultValue={d.value ?? ''}
                  placeholder="—"
                  onBlur={e => {
                    const v = e.target.value ? parseInt(e.target.value) : null
                    setListing(prev => prev ? { ...prev, [d.field]: v } : prev)
                    autoSave(d.field, v)
                  }}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
                />
              </div>
            ))}
          </div>
          {/* Property type selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">{labels.typeLabel}</label>
            <select
              value={listing.property_type}
              onChange={e => {
                setListing(prev => prev ? { ...prev, property_type: e.target.value } : prev)
                autoSave('property_type', e.target.value)
              }}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
            >
              <option value="house">House</option>
              <option value="flat">Flat</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="other">Other</option>
            </select>
          </div>
        </ModuleCard>

        {/* Description */}
        <ModuleCard title={labels.descriptionTitle} icon={FileText}>
          <InlineEdit
            value={listing.description_de ?? ''}
            placeholder={labels.descriptionPlaceholder}
            onSave={v => {
              setListing(prev => prev ? { ...prev, description_de: v } : prev)
              autoSave('description_de', v)
            }}
            multiline
            className="text-sm"
          />
        </ModuleCard>

        {/* Price */}
        <ModuleCard title={labels.priceTitle} icon={Building2}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              {intent === 'sale' ? labels.saleLabel : labels.rentLabel}
            </label>
            <input
              type="number"
              defaultValue={
                intent === 'sale'
                  ? listing.sale_price ? listing.sale_price / 100 : ''
                  : listing.rent_price ? listing.rent_price / 100 : ''
              }
              placeholder={labels.pricePlaceholder}
              onBlur={e => {
                const v = e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null
                const field = intent === 'sale' ? 'sale_price' : 'rent_price'
                setListing(prev => prev ? { ...prev, [field]: v } : prev)
                autoSave(field, v)
              }}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand text-text-primary"
            />
          </div>
        </ModuleCard>

        {/* Documents */}
        <ModuleCard title={labels.documentsTitle} icon={FileText}>
          <div className="space-y-2">
            {[labels.floorPlanLabel, labels.epcLabel, labels.titleDeedsLabel].map(doc => (
              <div key={doc} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border-default hover:border-brand/30 transition-colors">
                <span className="text-sm text-text-secondary">{doc}</span>
                <button className="text-xs font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1">
                  <Upload size={12} />
                  {labels.uploadLabel}
                </button>
              </div>
            ))}
          </div>
        </ModuleCard>

        {/* Visibility */}
        <ModuleCard title={labels.visibilityTitle} icon={Eye}>
          <div className="space-y-2">
            {[
              { key: 'draft', label: labels.visibilityDraft },
              { key: 'coming_soon', label: labels.visibilityComingSoon },
              { key: 'invite_agents', label: labels.visibilityInviteAgents },
              { key: 'public', label: labels.visibilityPublic },
            ].map(v => (
              <label
                key={v.key}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  visibility === v.key
                    ? 'border-brand bg-[#FFF4EF]/50'
                    : 'border-border-default hover:border-border-dark'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={v.key}
                  checked={visibility === v.key}
                  onChange={() => setVisibility(v.key)}
                  className="accent-brand"
                />
                <span className="text-sm font-medium text-text-primary">{v.label}</span>
              </label>
            ))}
          </div>
        </ModuleCard>

        {/* Agents */}
        <ModuleCard title={labels.agentsTitle} icon={Users}>
          <p className="text-sm text-text-secondary">{labels.agentsHint}</p>
          <button
            onClick={() => {
              // Navigate to agent search — the existing flow
              const path = locale === 'de' ? '/owner/agents' : `/${locale}/owner/agents`
              window.location.href = path
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors text-sm"
          >
            <Users size={14} />
            {labels.inviteAgents}
          </button>
        </ModuleCard>

      </div>
    </div>
  )
}
