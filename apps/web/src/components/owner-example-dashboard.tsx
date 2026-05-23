'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Home, Camera, MapPin, BedDouble, Bath, Maximize, Car,
  CalendarDays, Eye, MessageCircle, TrendingUp, Star,
  CheckCircle2, Circle, Clock, ArrowRight, Sparkles,
  BarChart3, Users, Heart, Share2, Zap, FileText,
  ChevronRight, ThumbsUp, AlertCircle, Lightbulb,
  ExternalLink, Play, Shield, Award, Phone,
  Pencil, Plus, X, Type, Ruler, GripVertical,
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
          href="/owner/new"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          {t.exGoLive} <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Hero gallery + editable property summary ── */}
      <HeroSection t={t} />

      {/* ── Property details: description + features + rooms ── */}
      <PropertyDetails t={t} />

      {/* ── Quick stats row ── */}
      <StatsRow t={t} />

      {/* ── Two-col layout: main + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed t={t} />
          <ViewingCalendar t={t} />
          <OffersSection t={t} />
          <BuyerMessages t={t} />
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-6">
          <ListingStatus t={t} />
          <HomePassport t={t} />
          <TaskChecklist t={t} />
          <AnalyticsCard t={t} />
          <AiTips t={t} />
        </div>
      </div>

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
  const [title, setTitle] = useState(t.exPropertyTitle)
  const [location, setLocation] = useState(t.exPropertyLocation)
  const [price, setPrice] = useState(t.exPropertyPrice)
  const [beds, setBeds] = useState('5')
  const [baths, setBaths] = useState('3')
  const [size, setSize] = useState(t.exSizeValue || '1,800 sq ft')
  const [parking, setParking] = useState('1')
  const [propType, setPropType] = useState(t.exPropertyType)

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
  const [description, setDescription] = useState(t.exDescription || '')
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
// STATS ROW — Key metrics
// ═══════════════════════════════════════════════════════════════════════════
function StatsRow({ t }: { t: Record<string, string> }) {
  const stats = [
    { label: t.exStatViews, value: '1,247', change: '+18%', icon: Eye, color: 'text-blue-600' },
    { label: t.exStatEnquiries, value: '23', change: '+5', icon: MessageCircle, color: 'text-brand' },
    { label: t.exStatViewings, value: '8', change: '3 ' + t.exStatUpcoming, icon: CalendarDays, color: 'text-green-600' },
    { label: t.exStatOffers, value: '2', change: t.exStatNew, icon: TrendingUp, color: 'text-amber-600', highlight: true },
    { label: t.exStatSaved, value: '34', change: '+6 ' + t.exStatThisWeek, icon: Heart, color: 'text-pink-500' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`bg-surface rounded-xl border p-4 ${
            s.highlight
              ? 'border-brand/30 ring-2 ring-brand/10'
              : 'border-border-default'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">{s.label}</p>
            <s.icon size={15} className="text-text-muted" />
          </div>
          <p className={`text-2xl font-bold ${s.highlight ? 'text-brand' : 'text-text-primary'}`}>{s.value}</p>
          <p className={`text-xs mt-0.5 ${s.highlight ? 'text-brand font-semibold' : 'text-green-600'}`}>
            {s.change}
          </p>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY FEED — Recent buyer activity
// ═══════════════════════════════════════════════════════════════════════════
function ActivityFeed({ t }: { t: Record<string, string> }) {
  const items = [
    { icon: TrendingUp, color: 'bg-amber-100 text-amber-600', title: t.exActOffer, desc: t.exActOfferDesc, time: t.exAct2hAgo },
    { icon: CalendarDays, color: 'bg-blue-100 text-blue-600', title: t.exActViewing, desc: t.exActViewingDesc, time: t.exAct5hAgo },
    { icon: MessageCircle, color: 'bg-brand/10 text-brand', title: t.exActMessage, desc: t.exActMessageDesc, time: t.exActYesterday },
    { icon: Eye, color: 'bg-green-100 text-green-600', title: t.exActMilestone, desc: t.exActMilestoneDesc, time: t.exActYesterday },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <h2 className="font-bold text-text-primary">{t.exSectionActivity}</h2>
        <span className="text-xs text-text-secondary">{t.exLast7Days}</span>
      </div>
      <div className="divide-y divide-border-default">
        {items.map((item, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-3.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <item.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="text-xs text-text-secondary truncate">{item.desc}</p>
            </div>
            <span className="text-[10px] text-text-muted whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEWING CALENDAR — Upcoming viewings
// ═══════════════════════════════════════════════════════════════════════════
function ViewingCalendar({ t }: { t: Record<string, string> }) {
  const viewings = [
    { name: 'Sarah & James T.', date: t.exViewDate1, time: '10:00', status: 'confirmed', type: t.exViewInPerson, initials: 'SJ' },
    { name: 'David Okonkwo', date: t.exViewDate2, time: '14:30', status: 'pending', type: t.exViewVideo, initials: 'DO' },
    { name: 'Lisa Park', date: t.exViewDate3, time: '11:00', status: 'confirmed', type: t.exViewInPerson, initials: 'LP' },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <h2 className="font-bold text-text-primary">{t.exSectionViewings}</h2>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
          {t.exViewAll} <ChevronRight size={12} />
        </span>
      </div>
      <div className="p-5 space-y-3">
        {viewings.map((v, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-hover-bg/50 border border-border-light">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
              {v.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{v.name}</p>
              <p className="text-xs text-text-secondary">{v.type}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-text-primary">{v.date}</p>
              <p className="text-xs text-text-secondary">{v.time}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wider ${
              v.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {v.status === 'confirmed' ? t.exViewConfirmed : t.exViewPending}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFERS — Active offers on the property
// ═══════════════════════════════════════════════════════════════════════════
function OffersSection({ t }: { t: Record<string, string> }) {
  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-text-primary">{t.exSectionOffers}</h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            2 {t.exOfferActive}
          </span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offer 1 — strong */}
        <div className="rounded-xl border-2 border-brand/20 p-4 bg-brand/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">SJ</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">Sarah & James T.</p>
              <p className="text-[10px] text-text-secondary">{t.exOfferMortgage}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wider">
              {t.exOfferStrong}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-border-light mb-3">
            <p className="text-2xl font-bold text-text-primary">{t.exOfferAmount1}</p>
            <p className="text-xs text-text-secondary">{t.exOfferNote1}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg">{t.exOfferAccept}</button>
            <button className="flex-1 py-2 bg-gray-100 text-text-primary text-xs font-bold rounded-lg">{t.exOfferCounter}</button>
            <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg">{t.exOfferDecline}</button>
          </div>
        </div>
        {/* Offer 2 */}
        <div className="rounded-xl border border-border-default p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">DO</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary">David Okonkwo</p>
              <p className="text-[10px] text-text-secondary">{t.exOfferCash}</p>
            </div>
          </div>
          <div className="bg-[#FAFBFC] rounded-lg p-3 border border-border-light mb-3">
            <p className="text-2xl font-bold text-text-primary">{t.exOfferAmount2}</p>
            <p className="text-xs text-text-secondary">{t.exOfferNote2}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg">{t.exOfferAccept}</button>
            <button className="flex-1 py-2 bg-gray-100 text-text-primary text-xs font-bold rounded-lg">{t.exOfferCounter}</button>
            <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg">{t.exOfferDecline}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BUYER MESSAGES — Recent enquiries
// ═══════════════════════════════════════════════════════════════════════════
function BuyerMessages({ t }: { t: Record<string, string> }) {
  const messages = [
    { name: 'Sarah T.', initials: 'ST', subject: t.exMsgSubject1, preview: t.exMsgPreview1, time: t.exAct2hAgo, unread: true },
    { name: 'David O.', initials: 'DO', subject: t.exMsgSubject2, preview: t.exMsgPreview2, time: t.exAct5hAgo, unread: true },
    { name: 'Lisa Park', initials: 'LP', subject: t.exMsgSubject3, preview: t.exMsgPreview3, time: t.exActYesterday, unread: false },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-text-primary">{t.exSectionMessages}</h2>
          <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">2</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
          {t.exViewAll} <ChevronRight size={12} />
        </span>
      </div>
      <div className="divide-y divide-border-default">
        {messages.map((m, i) => (
          <div key={i} className={`px-5 py-3.5 flex items-start gap-3 ${m.unread ? 'bg-brand/[0.03]' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs flex-shrink-0 mt-0.5">
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm ${m.unread ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>{m.name}</p>
                <span className="text-[10px] text-text-muted">{m.time}</span>
              </div>
              <p className={`text-xs ${m.unread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{m.subject}</p>
              <p className="text-xs text-text-muted truncate">{m.preview}</p>
            </div>
            {m.unread && <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR — Listing Status
// ═══════════════════════════════════════════════════════════════════════════
function ListingStatus({ t }: { t: Record<string, string> }) {
  const portals = [
    { name: 'Rightmove', status: 'live' },
    { name: 'Zoopla', status: 'live' },
    { name: 'OnTheMarket', status: 'pending' },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default">
        <h3 className="font-bold text-text-primary text-sm">{t.exSectionStatus}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <Shield size={18} className="text-green-600" />
          <div>
            <p className="text-sm font-bold text-green-700">{t.exStatusHealthy}</p>
            <p className="text-[10px] text-green-600">{t.exStatusHealthyDesc}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{t.exPortals}</p>
          <div className="space-y-2">
            {portals.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-text-primary font-medium">{p.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'live'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.status === 'live' ? t.exPortalLive : t.exPortalPending}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-text-primary bg-hover-bg rounded-lg border border-border-default">
            <Eye size={13} /> {t.exPreview}
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-text-primary bg-hover-bg rounded-lg border border-border-default">
            <Share2 size={13} /> {t.exShare}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR — Home Passport completion
// ═══════════════════════════════════════════════════════════════════════════
function HomePassport({ t }: { t: Record<string, string> }) {
  const sections = [
    { label: t.exPassPhotos, done: true, count: '16/16' },
    { label: t.exPassDescription, done: true, count: '' },
    { label: t.exPassFloorPlan, done: true, count: '' },
    { label: t.exPassEpc, done: false, count: '' },
    { label: t.exPassDocuments, done: false, count: '2/4' },
  ]
  const completed = sections.filter(s => s.done).length
  const pct = Math.round((completed / sections.length) * 100)

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <h3 className="font-bold text-text-primary text-sm">{t.exSectionPassport}</h3>
        <span className="text-xs font-bold text-brand">{pct}%</span>
      </div>
      <div className="p-5 space-y-3">
        <div className="w-full h-2 bg-border-light rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {s.done ? (
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              ) : (
                <Circle size={16} className="text-text-muted flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${s.done ? 'text-text-secondary line-through' : 'text-text-primary font-medium'}`}>
                {s.label}
              </span>
              {s.count && (
                <span className="text-[10px] text-text-muted">{s.count}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR — Task checklist
// ═══════════════════════════════════════════════════════════════════════════
function TaskChecklist({ t }: { t: Record<string, string> }) {
  const tasks = [
    { label: t.exTaskRespond, urgent: true, done: false },
    { label: t.exTaskUploadEpc, urgent: false, done: false },
    { label: t.exTaskConfirmViewing, urgent: false, done: false },
    { label: t.exTaskAddPhotos, urgent: false, done: true },
    { label: t.exTaskSetAvailability, urgent: false, done: true },
  ]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <h3 className="font-bold text-text-primary text-sm">{t.exSectionTasks}</h3>
        <span className="text-xs text-text-secondary">{tasks.filter(t => t.done).length}/{tasks.length}</span>
      </div>
      <div className="p-4 space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg ${task.urgent && !task.done ? 'bg-red-50 border border-red-200' : ''}`}>
            {task.done ? (
              <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
            ) : task.urgent ? (
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            ) : (
              <Circle size={15} className="text-text-muted flex-shrink-0" />
            )}
            <span className={`text-xs flex-1 ${task.done ? 'text-text-muted line-through' : task.urgent ? 'text-red-700 font-semibold' : 'text-text-primary'}`}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR — Analytics snapshot
// ═══════════════════════════════════════════════════════════════════════════
function AnalyticsCard({ t }: { t: Record<string, string> }) {
  const bars = [3, 5, 4, 7, 6, 9, 8, 12, 10, 14, 11, 18]

  return (
    <div className="bg-surface rounded-xl border border-border-default">
      <div className="px-5 py-4 border-b border-border-default">
        <h3 className="font-bold text-text-primary text-sm">{t.exSectionAnalytics}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-end gap-1 h-16">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-brand/20 rounded-sm transition-all hover:bg-brand/40"
              style={{ height: `${(h / 18) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-muted">
          <span>{t.exAnalytics4WeeksAgo}</span>
          <span>{t.exAnalyticsToday}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg bg-hover-bg">
            <p className="text-lg font-bold text-text-primary">72%</p>
            <p className="text-[10px] text-text-secondary">{t.exAnalyticsClickRate}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-hover-bg">
            <p className="text-lg font-bold text-text-primary">4.2 {t.exAnalyticsMin}</p>
            <p className="text-[10px] text-text-secondary">{t.exAnalyticsAvgTime}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR — AI Tips
// ═══════════════════════════════════════════════════════════════════════════
function AiTips({ t }: { t: Record<string, string> }) {
  const tips = [
    { icon: Camera, text: t.exTip1 },
    { icon: FileText, text: t.exTip2 },
    { icon: Zap, text: t.exTip3 },
  ]

  return (
    <div className="bg-gradient-to-br from-brand/[0.06] to-brand/[0.02] rounded-xl border border-brand/15">
      <div className="px-5 py-4 flex items-center gap-2">
        <Lightbulb size={16} className="text-brand" />
        <h3 className="font-bold text-text-primary text-sm">{t.exSectionTips}</h3>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <tip.icon size={14} className="text-brand mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">{tip.text}</p>
          </div>
        ))}
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
        href="/owner/new"
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-7 py-3.5 rounded-xl transition-all will-change-transform hover:-translate-y-0.5 hover:shadow-lg text-[0.9375rem]"
      >
        {t.exCtaButton} <ArrowRight size={16} />
      </Link>
    </div>
  )
}
