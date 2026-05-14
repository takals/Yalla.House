'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import {
  Camera, Upload, FileText, Eye, Users, Home,
  Building2, Check, Pencil, X, Star, Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthAction } from '@/lib/use-auth-action'
import { countryFromLocale } from '@/lib/detect-country'
import { getCountryConfig } from '@/lib/country-config'
import {
  createDraftAction,
  updateWorkspaceFieldAction,
  saveWorkspacePhotoAction,
  deleteWorkspaceMediaAction,
  setWorkspacePrimaryAction,
  saveWorkspaceDocumentAction,
} from './actions'

/* ── Types ──────────────────────────────────────────────────────── */

interface MediaRow {
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
  listing_media: MediaRow[]
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
  'createDraft' | 'saving' | 'saved' | 'newWorkspace' | 'newWorkspaceDesc' |
  'addressLine1Label' | 'cityLabel' | 'postcodeLabel' |
  'typeHouse' | 'typeFlat' | 'typeApartment' | 'typeVilla' | 'typeCommercial' | 'typeLand' | 'typeOther' |
  'photoUploading' | 'photoDeleteConfirm' | 'setPrimary' | 'primaryBadge' |
  'docUploaded' | 'docReplace' | 'dropHint' | 'currencyLabel',
  string
>

interface Props {
  listing: ListingData | null
  labels: WorkspaceLabels
  isGuest: boolean
  countryCode: string
  currency: string
}

/* ── Constants ─────────────────────────────────────────────────── */

const BUCKET = 'listing-photos'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_IMAGE = 'image/jpeg,image/png,image/webp'
const ACCEPTED_DOC = 'image/jpeg,image/png,image/webp,application/pdf'

/* ── Helpers ────────────────────────────────────────────────────── */

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function extOf(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
}

function storagePathFromUrl(url: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : url
}

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

const PROPERTY_TYPE_KEYS: Record<string, string> = {
  house: 'typeHouse',
  flat: 'typeFlat',
  apartment: 'typeApartment',
  villa: 'typeVilla',
  commercial: 'typeCommercial',
  land: 'typeLand',
  other: 'typeOther',
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

export function PropertyWorkspace({ listing: initial, labels, isGuest, countryCode, currency }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { handleAuthRequired } = useAuthAction()
  const [listing, setListing] = useState<ListingData | null>(initial)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [intent, setIntent] = useState<'sale' | 'rent'>((initial?.intent as 'sale' | 'rent') ?? 'sale')
  const [visibility, setVisibility] = useState<string>('draft')
  const [photos, setPhotos] = useState<MediaRow[]>(
    (initial?.listing_media ?? []).filter(m => m.type === 'photo').sort((a, b) => a.sort_order - b.sort_order)
  )
  const [documents, setDocuments] = useState<MediaRow[]>(
    (initial?.listing_media ?? []).filter(m => m.type !== 'photo')
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const docInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const progress = computeProgress(listing)
  const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0]
  const intlLocale = locale === 'de' ? 'de-DE' : 'en-GB'

  /* ── Currency formatter ──────────────────────────────────────── */
  function formatPrice(minorUnits: number): string {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(minorUnits / 100)
  }

  /* ── Create draft ────────────────────────────────────────────── */
  function handleCreateDraft() {
    startTransition(async () => {
      const result = await createDraftAction(locale)
      if (handleAuthRequired(result)) return
      if ('error' in result) return
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

  /* ── Photo upload ────────────────────────────────────────────── */
  async function handlePhotoFiles(files: FileList, asCover: boolean = false) {
    if (!listing) return
    setUploadError('')
    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setUploadError(`${file.name}: max 10 MB`)
        continue
      }

      setUploading(true)
      const path = `${listing.id}/${randomId()}.${extOf(file)}`

      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false })

      if (storageError) {
        setUploadError(storageError.message)
        setUploading(false)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const isPrimary = asCover || photos.length === 0
      const result = await saveWorkspacePhotoAction(listing.id, publicUrl, photos.length, isPrimary)

      if (handleAuthRequired(result)) {
        setUploading(false)
        return
      }

      if ('error' in result) {
        setUploadError(result.error)
        await supabase.storage.from(BUCKET).remove([path])
      } else if ('success' in result) {
        const newPhoto: MediaRow = {
          id: result.id,
          url: publicUrl,
          thumb_url: null,
          is_primary: isPrimary,
          sort_order: photos.length,
          type: 'photo',
        }
        if (isPrimary) {
          setPhotos(prev => prev.map(p => ({ ...p, is_primary: false })).concat(newPhoto))
        } else {
          setPhotos(prev => [...prev, newPhoto])
        }
      }

      setUploading(false)
    }
  }

  async function handleDeletePhoto(photo: MediaRow) {
    const storagePath = storagePathFromUrl(photo.url)
    const result = await deleteWorkspaceMediaAction(photo.id, storagePath)
    if (handleAuthRequired(result)) return
    if ('error' in result) {
      setUploadError(result.error)
    } else {
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    }
  }

  async function handleSetPrimary(photo: MediaRow) {
    if (!listing || photo.is_primary) return
    const result = await setWorkspacePrimaryAction(photo.id, listing.id)
    if (handleAuthRequired(result)) return
    if ('error' in result) {
      setUploadError(result.error)
    } else {
      setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photo.id })))
    }
  }

  /* ── Document upload ─────────────────────────────────────────── */
  async function handleDocUpload(file: File, docType: 'floorplan' | 'energy_cert' | 'document') {
    if (!listing) return
    setUploadError('')
    setUploading(true)
    const supabase = createClient()
    const path = `${listing.id}/docs/${randomId()}.${extOf(file)}`

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false })

    if (storageError) {
      setUploadError(storageError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const result = await saveWorkspaceDocumentAction(listing.id, publicUrl, docType)

    if (handleAuthRequired(result)) {
      setUploading(false)
      return
    }

    if ('error' in result) {
      setUploadError(result.error)
      await supabase.storage.from(BUCKET).remove([path])
    } else if ('success' in result) {
      const newDoc: MediaRow = {
        id: result.id,
        url: publicUrl,
        thumb_url: null,
        is_primary: false,
        sort_order: 0,
        type: docType,
      }
      setDocuments(prev => [...prev.filter(d => d.type !== docType), newDoc])
    }

    setUploading(false)
  }

  async function handleDeleteDoc(doc: MediaRow) {
    const storagePath = storagePathFromUrl(doc.url)
    const result = await deleteWorkspaceMediaAction(doc.id, storagePath)
    if (handleAuthRequired(result)) return
    if ('error' in result) {
      setUploadError(result.error)
    } else {
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
    }
  }

  /* ── Drag-and-drop handler ───────────────────────────────────── */
  function handleDrop(e: React.DragEvent, target: 'photos' | 'cover' | 'floorplan' | 'energy_cert' | 'document') {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (!files?.length) return
    if (target === 'photos') {
      handlePhotoFiles(files)
    } else if (target === 'cover') {
      handlePhotoFiles(files, true)
    } else {
      if (files[0]) handleDocUpload(files[0], target)
    }
  }

  function preventDragDefault(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  /* ── Empty state — no draft yet ──────────────────────────────── */
  if (!listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
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

  /* ── Document helpers ────────────────────────────────────────── */
  const docTypes: Array<{ key: 'floorplan' | 'energy_cert' | 'document'; label: string }> = [
    { key: 'floorplan', label: labels.floorPlanLabel },
    { key: 'energy_cert', label: labels.epcLabel },
    { key: 'document', label: labels.titleDeedsLabel },
  ]

  /* ── Workspace with listing ──────────────────────────────────── */

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header zone ────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border-default bg-surface">

        {/* Cover photo */}
        <div
          className="h-48 sm:h-56 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center relative"
          onDragOver={preventDragDefault}
          onDragEnter={preventDragDefault}
          onDrop={e => handleDrop(e, 'cover')}
        >
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              unoptimized
            />
          ) : (
            <svg width="200" height="140" viewBox="0 0 200 140" fill="none" className="opacity-30">
              <path d="M100 12L15 72V130H75V95H125V130H185V72L100 12Z" fill="#94A3B8" stroke="#64748B" strokeWidth="2.5"/>
              <rect x="65" y="50" width="25" height="22" rx="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
              <rect x="110" y="50" width="25" height="22" rx="3" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
              <path d="M88 95H112V130H88V95Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
              <circle cx="108" cy="113" r="2.5" fill="#94A3B8"/>
            </svg>
          )}

          {/* Draft overlay badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-[#94A3B8]/20 backdrop-blur-sm text-[#475569] text-[0.7rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#94A3B8]/30">
              {labels.draftBadge}
            </span>
          </div>

          {/* Upload cover photo button */}
          <input
            ref={coverInputRef}
            type="file"
            accept={ACCEPTED_IMAGE}
            className="hidden"
            onChange={e => e.target.files && handlePhotoFiles(e.target.files, true)}
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm text-text-primary text-sm font-medium px-4 py-2 rounded-lg border border-border-default hover:bg-white transition-colors"
          >
            <Camera size={14} />
            {labels.coverPhotoLabel}
          </button>
        </div>

        {/* Title + Meta row */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-4">
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

              {/* Address fields + intent toggle */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <InlineEdit
                    value={listing.address_line1}
                    placeholder={labels.addressLine1Label}
                    onSave={v => {
                      setListing(prev => prev ? { ...prev, address_line1: v } : prev)
                      autoSave('address_line1', v)
                    }}
                    className="text-sm"
                  />
                  <span className="text-text-muted">·</span>
                  <InlineEdit
                    value={listing.postcode}
                    placeholder={labels.postcodeLabel}
                    onSave={v => {
                      setListing(prev => prev ? { ...prev, postcode: v } : prev)
                      autoSave('postcode', v)
                    }}
                    className="text-sm"
                  />
                  <span className="text-text-muted">·</span>
                  <InlineEdit
                    value={listing.city}
                    placeholder={labels.cityLabel}
                    onSave={v => {
                      setListing(prev => prev ? { ...prev, city: v } : prev)
                      autoSave('city', v)
                    }}
                    className="text-sm"
                  />
                </div>

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
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                {saveStatus === 'saving' ? labels.saving : labels.saved}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span className="flex-1">{uploadError}</span>
          <button onClick={() => setUploadError('')} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Module Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Photos */}
        <ModuleCard title={labels.photosTitle} icon={Camera}>
          <div
            className="grid grid-cols-3 gap-2"
            onDragOver={preventDragDefault}
            onDragEnter={preventDragDefault}
            onDrop={e => handleDrop(e, 'photos')}
          >
            {/* Real photos */}
            {photos.map(p => (
              <div key={p.id} className="aspect-[4/3] rounded-lg overflow-hidden border border-border-default relative group">
                <Image
                  src={p.thumb_url ?? p.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="150px"
                  unoptimized
                />
                {/* Primary badge */}
                {p.is_primary && (
                  <span className="absolute top-1 left-1 text-[0.5rem] font-bold bg-brand text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star size={8} />
                    {labels.primaryBadge}
                  </span>
                )}
                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {!p.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(p)}
                      className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow"
                      title={labels.setPrimary}
                    >
                      <Star size={12} className="text-brand" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(p)}
                    className="w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload slot */}
            <input
              ref={photoInputRef}
              type="file"
              accept={ACCEPTED_IMAGE}
              multiple
              className="hidden"
              onChange={e => e.target.files && handlePhotoFiles(e.target.files)}
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
              className="aspect-[4/3] rounded-lg border-2 border-dashed border-brand/30 flex flex-col items-center justify-center gap-1 hover:border-brand/60 hover:bg-[#FFF4EF]/30 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={16} className="text-brand/50 animate-spin" />
              ) : (
                <Upload size={16} className="text-brand/50" />
              )}
              <span className="text-[0.65rem] font-medium text-brand/60">
                {uploading ? labels.photoUploading : labels.uploadPhotos}
              </span>
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
          {/* Property type selector — translated options */}
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
              {Object.entries(PROPERTY_TYPE_KEYS).map(([val, labelKey]) => (
                <option key={val} value={val}>{labels[labelKey as keyof WorkspaceLabels]}</option>
              ))}
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
              {intent === 'sale' ? labels.saleLabel : labels.rentLabel} ({labels.currencyLabel}: {currency})
            </label>
            <div className="relative">
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
              {/* Show formatted price preview */}
              {((intent === 'sale' && listing.sale_price) || (intent === 'rent' && listing.rent_price)) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none">
                  {formatPrice(intent === 'sale' ? listing.sale_price! : listing.rent_price!)}
                </span>
              )}
            </div>
          </div>
        </ModuleCard>

        {/* Documents */}
        <ModuleCard title={labels.documentsTitle} icon={FileText}>
          <div className="space-y-2">
            {docTypes.map(({ key, label }) => {
              const existingDoc = documents.find(d => d.type === key)
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border-default hover:border-brand/30 transition-colors"
                  onDragOver={preventDragDefault}
                  onDragEnter={preventDragDefault}
                  onDrop={e => handleDrop(e, key)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-text-secondary">{label}</span>
                    {existingDoc && (
                      <span className="text-[0.65rem] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        {labels.docUploaded}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {existingDoc && (
                      <button
                        onClick={() => handleDeleteDoc(existingDoc)}
                        className="text-xs text-red-400 hover:text-red-600 p-1"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <input
                      ref={el => { docInputRefs.current[key] = el }}
                      type="file"
                      accept={ACCEPTED_DOC}
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleDocUpload(e.target.files[0], key)}
                    />
                    <button
                      onClick={() => docInputRefs.current[key]?.click()}
                      className="text-xs font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
                    >
                      <Upload size={12} />
                      {existingDoc ? labels.docReplace : labels.uploadLabel}
                    </button>
                  </div>
                </div>
              )
            })}
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
