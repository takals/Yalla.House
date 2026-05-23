'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Home, Camera, MapPin, BedDouble, Bath, Maximize, Car,
  ArrowRight, Sparkles,
  CheckCircle2, Circle,
  Pencil, Plus, X, Type, Ruler,
} from 'lucide-react'

interface ExampleDashboardProps {
  t: Record<string, string>
  locale: string
}

// ─── Property photos ─────────────────────────────────────────────────────
const PHOTOS = {
  hero: '/images/example/yoxley-hero.jpeg',
  interior1: '/images/example/yoxley-interior1.jpeg',
  interior2: '/images/example/yoxley-interior2.jpeg',
  interior3: '/images/example/yoxley-interior3.jpeg',
  kitchen: '/images/example/yoxley-kitchen.jpeg',
}

export function OwnerExampleDashboard({ t, locale }: ExampleDashboardProps) {
  return (
    <div className="max-w-7xl space-y-6">
      {/* ── Draft banner ── */}
      <div className="bg-gradient-to-r from-amber-500/[0.08] to-amber-500/[0.02] rounded-xl border border-amber-500/15 px-5 py-3 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
          {t.exBadge}
        </span>
        <span className="text-sm text-text-secondary flex-1">{t.exBannerHint}</span>
        <Link
          href="/owner/workspace"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          {t.exGoLive} <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Hero gallery + editable property summary ── */}
      <HeroSection t={t} />

      {/* ── Property details: description + features + rooms ── */}
      <PropertyDetails t={t} />

      {/* ── CTA ── */}
      <CtaSection t={t} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// EDITABLE COMPONENTS — Notion-style inline editing
// ═══════════════════════════════════════════════════════════════════════════

function EditableText({
  value,
  onChange,
  placeholder = '',
  className = '',
  inputClassName = '',
  tag: Tag = 'span',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  tag?: 'span' | 'h1' | 'p'
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onChange(draft) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { setEditing(false); onChange(draft) }
          if (e.key === 'Escape') { setEditing(false); setDraft(value) }
        }}
        className={`bg-transparent border-b-2 border-brand outline-none w-full ${inputClassName}`}
      />
    )
  }

  return (
    <Tag
      onClick={() => { setEditing(true); setDraft(value) }}
      className={`cursor-text group/edit relative inline-flex items-center gap-1.5 rounded px-1 -mx-1 hover:bg-brand/[0.06] transition-colors ${!value ? 'text-text-muted italic border border-dashed border-text-muted/30 px-3 py-1' : ''} ${className}`}
    >
      {value || placeholder}
      <Pencil size={12} className="text-text-muted opacity-0 group-hover/edit:opacity-60 transition-opacity flex-shrink-0" />
    </Tag>
  )
}

function EditableTextarea({
  value,
  onChange,
  placeholder = '',
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      // Auto-resize
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editing])

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={e => {
          setDraft(e.target.value)
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
          }
        }}
        onBlur={() => { setEditing(false); onChange(draft) }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setEditing(false); setDraft(value) }
        }}
        className={`bg-transparent border-2 border-brand rounded-lg outline-none w-full p-3 resize-none text-sm leading-relaxed ${className}`}
        rows={4}
      />
    )
  }

  return (
    <div
      onClick={() => { setEditing(true); setDraft(value) }}
      className={`cursor-text group/edit relative rounded-lg px-1 -mx-1 hover:bg-brand/[0.04] transition-colors ${!value ? 'text-text-muted italic border border-dashed border-text-muted/30 p-4' : ''}`}
    >
      <p className={`text-sm text-text-secondary leading-relaxed whitespace-pre-wrap ${className}`}>
        {value || placeholder}
      </p>
      <Pencil size={13} className="absolute top-2 right-2 text-text-muted opacity-0 group-hover/edit:opacity-60 transition-opacity" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO — Gallery + Editable Property Summary
// ═══════════════════════════════════════════════════════════════════════════
function HeroSection({ t }: { t: Record<string, string> }) {
  const [title, setTitle] = useState(t.exPropertyTitle ?? '')
  const [location, setLocation] = useState(t.exPropertyLocation ?? '')
  const [price, setPrice] = useState(t.exPropertyPrice ?? '')
  const [beds, setBeds] = useState('5')
  const [baths, setBaths] = useState('3')
  const [size, setSize] = useState(t.exSizeValue ?? '1,800 sq ft')
  const [parking, setParking] = useState('1')
  const [propType, setPropType] = useState(t.exPropertyType ?? '')

  return (
    <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
      {/* Photo gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-1 h-[200px] md:h-[320px]">
        <div className="col-span-2 row-span-2 relative overflow-hidden group/hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.hero} alt="" className="w-full h-full object-cover grayscale-[40%] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500 text-white">
              <Circle size={8} fill="white" />
              {t.exStatusDraft}
            </span>
          </div>
          {/* Upload overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/hero:bg-black/20 transition-colors cursor-pointer">
            <span className="flex items-center gap-2 bg-white/90 text-text-primary text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover/hero:opacity-100 transition-opacity shadow-lg">
              <Camera size={14} /> {t.exChangePhotos}
            </span>
          </div>
        </div>
        <div className="overflow-hidden hidden md:block relative group/thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.interior1} alt="" className="w-full h-full object-cover grayscale-[40%] opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/thumb:bg-black/20 transition-colors cursor-pointer">
            <Camera size={14} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="overflow-hidden hidden md:block relative group/thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.interior2} alt="" className="w-full h-full object-cover grayscale-[40%] opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/thumb:bg-black/20 transition-colors cursor-pointer">
            <Camera size={14} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="overflow-hidden hidden md:block relative group/thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.interior3} alt="" className="w-full h-full object-cover grayscale-[40%] opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/thumb:bg-black/20 transition-colors cursor-pointer">
            <Camera size={14} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="overflow-hidden relative hidden md:block group/thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.kitchen} alt="" className="w-full h-full object-cover grayscale-[40%] opacity-90" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer group-hover/thumb:bg-black/50 transition-colors">
            <span className="flex items-center gap-1.5 text-white text-sm font-bold">
              <Camera size={16} /> +12
            </span>
          </div>
        </div>
      </div>

      {/* Editable property summary bar */}
      <div className="px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <EditableText
              value={title}
              onChange={setTitle}
              placeholder={t.exTitlePlaceholder}
              className="text-2xl font-bold text-text-primary"
              inputClassName="text-2xl font-bold text-text-primary"
              tag="h1"
            />
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin size={14} className="flex-shrink-0" />
              <EditableText
                value={location}
                onChange={setLocation}
                placeholder={t.exLocationPlaceholder}
                className="text-sm text-text-secondary"
                inputClassName="text-sm text-text-secondary"
              />
            </div>
          </div>
          <div className="text-right space-y-1">
            <EditableText
              value={price}
              onChange={setPrice}
              placeholder={t.exPricePlaceholder}
              className="text-2xl font-bold text-text-primary"
              inputClassName="text-2xl font-bold text-text-primary text-right"
            />
            <p className="text-xs text-text-secondary">{t.exListedDate}</p>
          </div>
        </div>

        {/* Editable specs */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border-default">
          <EditableSpec icon={BedDouble} label={t.exBeds} value={beds} onChange={setBeds} />
          <EditableSpec icon={Bath} label={t.exBaths} value={baths} onChange={setBaths} />
          <EditableSpec icon={Maximize} label={t.exSize} value={size} onChange={setSize} />
          <EditableSpec icon={Car} label={t.exParking} value={parking} onChange={setParking} />
          <EditableSpec icon={Home} label={t.exType} value={propType} onChange={setPropType} />
        </div>
      </div>
    </div>
  )
}

function EditableSpec({
  icon: Icon,
  label = '',
  value = '',
  onChange,
}: {
  icon: typeof Home
  label?: string
  value?: string
  onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  return (
    <div
      className="flex items-center gap-2 group/spec cursor-text rounded-lg px-1 -mx-1 hover:bg-brand/[0.06] transition-colors"
      onClick={() => {
        if (!editing) { setEditing(true); setDraft(value) }
      }}
    >
      <div className="w-8 h-8 rounded-lg bg-brand/[0.08] flex items-center justify-center">
        <Icon size={15} className="text-brand" />
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => { setEditing(false); onChange(draft) }}
            onKeyDown={e => {
              if (e.key === 'Enter') { setEditing(false); onChange(draft) }
              if (e.key === 'Escape') { setEditing(false); setDraft(value) }
            }}
            className="text-sm font-bold text-text-primary bg-transparent border-b-2 border-brand outline-none w-20"
          />
        ) : (
          <p className="text-sm font-bold text-text-primary inline-flex items-center gap-1">
            {value}
            <Pencil size={10} className="text-text-muted opacity-0 group-hover/spec:opacity-60 transition-opacity" />
          </p>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PROPERTY DETAILS — Description, Key Features, Room Sizes
// ═══════════════════════════════════════════════════════════════════════════
function PropertyDetails({ t }: { t: Record<string, string> }) {
  const [description, setDescription] = useState(t.exDescription ?? '')
  const [features, setFeatures] = useState<string[]>(() => {
    const f: string[] = []
    for (let i = 1; i <= 10; i++) {
      const key = `exFeature${i}`
      if (t[key]) f.push(t[key])
    }
    return f
  })
  const [rooms, setRooms] = useState<Array<{ name: string; size: string }>>(() => {
    const r: Array<{ name: string; size: string }> = []
    for (let i = 1; i <= 20; i++) {
      const nameKey = `exRoom${i}Name`
      const sizeKey = `exRoom${i}Size`
      if (t[nameKey]) r.push({ name: t[nameKey], size: t[sizeKey] || '' })
    }
    return r
  })

  const addFeature = () => setFeatures(prev => [...prev, ''])
  const updateFeature = (idx: number, val: string) => setFeatures(prev => prev.map((f, i) => i === idx ? val : f))
  const removeFeature = (idx: number) => setFeatures(prev => prev.filter((_, i) => i !== idx))

  const addRoom = () => setRooms(prev => [...prev, { name: '', size: '' }])
  const updateRoom = (idx: number, field: 'name' | 'size', val: string) =>
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  const removeRoom = (idx: number) => setRooms(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Description — 2/3 width */}
      <div className="lg:col-span-2 bg-surface rounded-xl border border-border-default">
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-brand" />
            <h2 className="font-bold text-text-primary">{t.exSectionDescription}</h2>
          </div>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">{t.exClickToEdit}</span>
        </div>
        <div className="p-5">
          <EditableTextarea
            value={description}
            onChange={setDescription}
            placeholder={t.exDescriptionPlaceholder}
          />
        </div>

        {/* Key Features */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-primary">{t.exSectionFeatures}</h3>
            <button
              onClick={addFeature}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <Plus size={13} /> {t.exAddFeature}
            </button>
          </div>
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 group/feat">
                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                <EditableText
                  value={feature}
                  onChange={(v) => updateFeature(i, v)}
                  placeholder={t.exFeaturePlaceholder}
                  className="text-sm text-text-secondary flex-1"
                  inputClassName="text-sm text-text-secondary"
                />
                <button
                  onClick={() => removeFeature(i)}
                  className="opacity-0 group-hover/feat:opacity-60 transition-opacity text-text-muted hover:text-red-500"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            {features.length === 0 && (
              <button
                onClick={addFeature}
                className="w-full py-3 border border-dashed border-text-muted/30 rounded-lg text-sm text-text-muted hover:border-brand/40 hover:text-brand transition-colors"
              >
                <Plus size={14} className="inline mr-1" /> {t.exAddFeature}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Room Sizes — 1/3 width */}
      <div className="bg-surface rounded-xl border border-border-default">
        <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-brand" />
            <h3 className="font-bold text-text-primary text-sm">{t.exSectionRooms}</h3>
          </div>
          <button
            onClick={addRoom}
            className="text-brand hover:text-brand-hover transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="p-4 space-y-1.5">
          {rooms.map((room, i) => (
            <div key={i} className="flex items-center gap-2 group/room py-1.5 px-2 -mx-2 rounded-lg hover:bg-brand/[0.04] transition-colors">
              <div className="flex-1 min-w-0">
                <EditableText
                  value={room.name}
                  onChange={(v) => updateRoom(i, 'name', v)}
                  placeholder={t.exRoomNamePlaceholder}
                  className="text-xs font-semibold text-text-primary"
                  inputClassName="text-xs font-semibold text-text-primary"
                />
              </div>
              <EditableText
                value={room.size}
                onChange={(v) => updateRoom(i, 'size', v)}
                placeholder="0'0 x 0'0"
                className="text-xs text-text-secondary font-mono whitespace-nowrap"
                inputClassName="text-xs text-text-secondary font-mono w-24 text-right"
              />
              <button
                onClick={() => removeRoom(i)}
                className="opacity-0 group-hover/room:opacity-60 transition-opacity text-text-muted hover:text-red-500 flex-shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {rooms.length === 0 && (
            <button
              onClick={addRoom}
              className="w-full py-3 border border-dashed border-text-muted/30 rounded-lg text-xs text-text-muted hover:border-brand/40 hover:text-brand transition-colors"
            >
              <Plus size={12} className="inline mr-1" /> {t.exAddRoom}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CTA — Start listing prompt
// ═══════════════════════════════════════════════════════════════════════════
function CtaSection({ t }: { t: Record<string, string> }) {
  return (
    <div className="bg-gradient-to-br from-brand/[0.08] to-brand/[0.03] rounded-xl border border-brand/20 p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
        <Sparkles size={26} className="text-brand" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">{t.exCtaTitle}</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-lg mx-auto leading-relaxed">{t.exCtaDesc}</p>
      <Link
        href="/owner/workspace"
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-7 py-3.5 rounded-xl transition-all will-change-transform hover:-translate-y-0.5 hover:shadow-lg text-[0.9375rem]"
      >
        {t.exCtaButton} <ArrowRight size={16} />
      </Link>
    </div>
  )
}
