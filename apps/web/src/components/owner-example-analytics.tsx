'use client'

import Link from 'next/link'
import {
  Eye, MessageCircle, TrendingUp, CalendarDays,
  Heart, CheckCircle2, Circle, ChevronRight,
  AlertCircle, Lightbulb, Shield, Share2,
  Camera, FileText, Zap, Sparkles, ArrowRight,
} from 'lucide-react'

interface ExampleAnalyticsProps {
  t: Record<string, string>
  locale: string
}

export function OwnerExampleAnalytics({ t, locale }: ExampleAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Quick stats row */}
      <StatsRow t={t} />

      {/* Two-col layout: main + sidebar */}
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

      {/* CTA */}
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS ROW
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
// ACTIVITY FEED
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
// VIEWING CALENDAR
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
// OFFERS
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
// BUYER MESSAGES
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
// LISTING STATUS
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
// HOME PASSPORT
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
// TASK CHECKLIST
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
        <span className="text-xs text-text-secondary">{tasks.filter(tk => tk.done).length}/{tasks.length}</span>
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
// ANALYTICS CARD
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
// AI TIPS
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
