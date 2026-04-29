'use client'

import { DemoSection, DemoCard } from './demo-content'
import {
  Home, CalendarDays, Eye, MessageCircle, Banknote,
  Users, Clock, CheckCircle2, MapPin, BedDouble, Maximize,
  Star, TrendingUp, Send, Phone, Mail, Camera, ArrowRight,
} from 'lucide-react'

interface OwnerDemoProps {
  section: 'listings' | 'overview' | 'calendar' | 'viewings' | 'offers' | 'inbox' | 'settings'
  t: Record<string, string>
}

// ─── Placeholder images (Unsplash, free to use) ───────────────────────────
const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=350&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=350&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=350&fit=crop&q=80',
]

export function OwnerDemoContent({ section, t }: OwnerDemoProps) {
  switch (section) {
    case 'listings':
      return <DemoListings t={t} />
    case 'overview':
      return <DemoOverview t={t} />
    case 'calendar':
      return <DemoCalendar t={t} />
    case 'viewings':
      return <DemoViewings t={t} />
    case 'offers':
      return <DemoOffers t={t} />
    case 'inbox':
      return <DemoInbox t={t} />
    case 'settings':
      return <DemoSettings t={t} />
    default:
      return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LISTINGS DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoListings({ t }: { t: Record<string, string> }) {
  return (
    <DemoSection badge={t.demoBadge} hint={t.listingsHint}>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Example listing 1 — Live */}
        <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
          <div className="h-40 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEMO_PHOTOS[0]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t.statusLive}
              </span>
              <span className="text-xs text-text-muted">{t.demoId1}</span>
            </div>
            <h3 className="font-bold text-text-primary text-[0.9375rem] mb-1">{t.demoTitle1}</h3>
            <p className="text-xs text-text-secondary mb-3 flex items-center gap-1">
              <MapPin size={11} /> {t.demoLocation1}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">{t.demoPrice1}</span>
              <div className="flex gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><Maximize size={11} /> 95 m²</span>
                <span className="flex items-center gap-1"><BedDouble size={11} /> 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Example listing 2 — Draft */}
        <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
          <div className="h-40 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEMO_PHOTOS[1]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {t.statusDraft}
              </span>
              <span className="text-xs text-text-muted">{t.demoId2}</span>
            </div>
            <h3 className="font-bold text-text-primary text-[0.9375rem] mb-1">{t.demoTitle2}</h3>
            <p className="text-xs text-text-secondary mb-3 flex items-center gap-1">
              <MapPin size={11} /> {t.demoLocation2}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary">{t.demoPrice2}</span>
              <div className="flex gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><Maximize size={11} /> 68 m²</span>
                <span className="flex items-center gap-1"><BedDouble size={11} /> 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoOverview({ t }: { t: Record<string, string> }) {
  const stats = [
    { label: t.statListings, value: '2', sub: t.statWithOffers, icon: Home },
    { label: t.statInquiries, value: '7', sub: t.statThisWeek, icon: MessageCircle },
    { label: t.statViewings, value: '4', sub: t.stat2ThisWeek, icon: Eye },
    { label: t.statOffers, value: '1', sub: t.statNewOffer, icon: TrendingUp, highlight: true },
  ]

  return (
    <DemoSection badge={t.demoBadge} hint={t.overviewHint}>
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`bg-surface rounded-xl p-4 border ${s.highlight ? 'border-brand/30 ring-2 ring-brand/10' : 'border-border-default'}`}>
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">{s.label}</p>
              <div className="flex items-baseline justify-between">
                <p className={`text-2xl font-bold ${s.highlight ? 'text-brand' : 'text-text-primary'}`}>{s.value}</p>
                <s.icon size={16} className="text-text-muted" />
              </div>
              <p className="text-xs text-text-secondary mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Mini listing table */}
        <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary">{t.sectionListings}</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border-default">
                <td className="py-3 px-4">
                  <p className="font-semibold text-text-primary text-xs">{t.demoTitle1}</p>
                  <p className="text-[10px] text-text-secondary">{t.demoLocation1}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{t.statusLive}</span>
                </td>
                <td className="py-3 px-4 text-xs text-text-primary font-medium">{t.demoPrice1}</td>
                <td className="py-3 px-4 text-center text-xs text-text-primary">5</td>
                <td className="py-3 px-4 text-center text-xs text-text-primary">3</td>
              </tr>
              <tr>
                <td className="py-3 px-4">
                  <p className="font-semibold text-text-primary text-xs">{t.demoTitle2}</p>
                  <p className="text-[10px] text-text-secondary">{t.demoLocation2}</p>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.statusDraft}</span>
                </td>
                <td className="py-3 px-4 text-xs text-text-primary">{t.demoPrice2}</td>
                <td className="py-3 px-4 text-center text-xs text-text-primary">0</td>
                <td className="py-3 px-4 text-center text-xs text-text-primary">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CALENDAR DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoCalendar({ t }: { t: Record<string, string> }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const slots = [
    { day: 1, time: '10:00 – 11:00', status: 'available' },
    { day: 1, time: '14:00 – 15:00', status: 'booked' },
    { day: 3, time: '11:00 – 12:00', status: 'available' },
    { day: 4, time: '16:00 – 17:00', status: 'available' },
    { day: 5, time: '10:00 – 11:00', status: 'booked' },
  ]

  return (
    <DemoSection badge={t.demoBadge} hint={t.calendarHint}>
      <div className="p-6 space-y-4">
        {/* Week header */}
        <div className="grid grid-cols-7 gap-2">
          {days.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-text-secondary py-2">{d}</div>
          ))}
        </div>

        {/* Week slots */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((_, i) => {
            const daySlots = slots.filter(s => s.day === i)
            return (
              <div key={i} className="min-h-[120px] bg-surface rounded-lg border border-border-default p-2 space-y-1.5">
                <span className="text-xs font-bold text-text-primary">{i + 12}</span>
                {daySlots.map((slot, j) => (
                  <div
                    key={j}
                    className={`text-[10px] px-1.5 py-1 rounded ${
                      slot.status === 'booked'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                  >
                    {slot.time}
                    <div className="font-semibold">
                      {slot.status === 'booked' ? t.slotBooked : t.slotAvailable}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> {t.slotAvailable}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> {t.slotBooked}
          </span>
        </div>
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEWINGS DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoViewings({ t }: { t: Record<string, string> }) {
  const viewings = [
    { name: 'Sarah Johnson', property: t.demoTitle1, date: t.demoDate1, time: '14:00', status: 'confirmed', type: t.typeInPerson },
    { name: 'Marcus Weber', property: t.demoTitle1, date: t.demoDate2, time: '10:30', status: 'pending', type: t.typeVideo },
    { name: 'Emily Chen', property: t.demoTitle2, date: t.demoDate3, time: '16:00', status: 'pending', type: t.typeInPerson },
  ]

  return (
    <DemoSection badge={t.demoBadge} hint={t.viewingsHint}>
      <div className="p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: t.viewingsPending, value: '2', color: 'text-amber-600' },
            { label: t.viewingsConfirmed, value: '1', color: 'text-green-600' },
            { label: t.viewingsSlots, value: '6', color: 'text-text-primary' },
            { label: t.viewingsBooked, value: '3', color: 'text-blue-600' },
          ].map((s, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border-default p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Viewing cards */}
        <div className="space-y-3">
          {viewings.map((v, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border-default p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                {v.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{v.name}</p>
                <p className="text-xs text-text-secondary">{v.property}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-text-primary">{v.date}</p>
                <p className="text-xs text-text-secondary">{v.time} · {v.type}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                v.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {v.status === 'confirmed' ? t.statusConfirmed : t.statusPending}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// OFFERS DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoOffers({ t }: { t: Record<string, string> }) {
  return (
    <DemoSection badge={t.demoBadge} hint={t.offersHint}>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Offer 1 */}
          <div className="bg-surface rounded-xl border-2 border-brand/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">SJ</div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Sarah Johnson</p>
                  <p className="text-xs text-text-secondary">{t.demoTitle1}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{t.statusPending}</span>
            </div>
            <div className="bg-[#FAFBFC] rounded-lg p-3 mb-3">
              <p className="text-2xl font-bold text-text-primary">{t.offerAmount1}</p>
              <p className="text-xs text-text-secondary">{t.offerCondition1}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg">{t.offerAccept}</button>
              <button className="flex-1 py-2 bg-gray-100 text-text-primary text-xs font-bold rounded-lg">{t.offerCounter}</button>
              <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg">{t.offerDecline}</button>
            </div>
          </div>

          {/* Offer 2 */}
          <div className="bg-surface rounded-xl border border-border-default p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">MW</div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Marcus Weber</p>
                  <p className="text-xs text-text-secondary">{t.demoTitle1}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{t.statusPending}</span>
            </div>
            <div className="bg-[#FAFBFC] rounded-lg p-3 mb-3">
              <p className="text-2xl font-bold text-text-primary">{t.offerAmount2}</p>
              <p className="text-xs text-text-secondary">{t.offerCondition2}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg">{t.offerAccept}</button>
              <button className="flex-1 py-2 bg-gray-100 text-text-primary text-xs font-bold rounded-lg">{t.offerCounter}</button>
              <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg">{t.offerDecline}</button>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// INBOX DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoInbox({ t }: { t: Record<string, string> }) {
  const threads = [
    { name: 'Sarah Johnson', subject: t.inboxSubject1, preview: t.inboxPreview1, time: t.inboxTime1, unread: true },
    { name: 'Marcus Weber', subject: t.inboxSubject2, preview: t.inboxPreview2, time: t.inboxTime2, unread: true },
    { name: 'Emily Chen', subject: t.inboxSubject3, preview: t.inboxPreview3, time: t.inboxTime3, unread: false },
    { name: 'James Smith', subject: t.inboxSubject4, preview: t.inboxPreview4, time: t.inboxTime4, unread: false },
  ]

  return (
    <DemoSection badge={t.demoBadge} hint={t.inboxHint}>
      <div className="p-4 space-y-1">
        {threads.map((thread, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${thread.unread ? 'bg-brand/[0.04]' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs flex-shrink-0">
              {thread.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm ${thread.unread ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                  {thread.name}
                </p>
                <span className="text-[10px] text-text-muted flex-shrink-0">{thread.time}</span>
              </div>
              <p className={`text-xs ${thread.unread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{thread.subject}</p>
              <p className="text-xs text-text-muted truncate">{thread.preview}</p>
            </div>
            {thread.unread && (
              <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </DemoSection>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS DEMO
// ═══════════════════════════════════════════════════════════════════════════
function DemoSettings({ t }: { t: Record<string, string> }) {
  return (
    <DemoSection badge={t.demoBadge} hint={t.settingsHint}>
      <div className="p-6 space-y-6">
        {/* Profile card */}
        <div className="bg-surface rounded-xl border border-border-default p-5">
          <h3 className="font-bold text-sm text-text-primary mb-4">{t.settingsProfile}</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
              <Camera size={24} className="text-brand/40" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Jane Smith</p>
              <p className="text-xs text-text-secondary">jane.smith@example.com</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FAFBFC] rounded-lg px-3 py-2">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{t.settingsPhone}</p>
              <p className="text-sm text-text-primary">+44 7700 900 123</p>
            </div>
            <div className="bg-[#FAFBFC] rounded-lg px-3 py-2">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">{t.settingsLanguage}</p>
              <p className="text-sm text-text-primary">English</p>
            </div>
          </div>
        </div>

        {/* Notification preferences */}
        <div className="bg-surface rounded-xl border border-border-default p-5">
          <h3 className="font-bold text-sm text-text-primary mb-3">{t.settingsNotifications}</h3>
          <div className="space-y-3">
            {[t.settingsNotifInquiry, t.settingsNotifViewing, t.settingsNotifOffer].map((label, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[Mail, CalendarDays, Banknote][i] && (() => {
                    const Icon = [Mail, CalendarDays, Banknote][i]!
                    return <Icon size={14} className="text-text-secondary" />
                  })()}
                  <span className="text-sm text-text-primary">{label}</span>
                </div>
                <div className="w-9 h-5 rounded-full bg-brand relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DemoSection>
  )
}
