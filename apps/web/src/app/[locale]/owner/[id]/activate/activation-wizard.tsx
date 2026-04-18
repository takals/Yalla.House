'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Camera, CalendarPlus, Mail, Users, Globe, QrCode, Share2,
  PartyPopper, Check, ChevronRight, Rocket,
} from 'lucide-react'

type Translations = {
  [key: string]: string
  congratsTitle: string
  congratsSubtitle: string
  congratsBody: string
  letsGo: string
  stepPhotos: string
  stepPhotosDesc: string
  stepCalendar: string
  stepCalendarDesc: string
  stepEmail: string
  stepEmailDesc: string
  stepAgents: string
  stepAgentsDesc: string
  stepPortals: string
  stepPortalsDesc: string
  stepQR: string
  stepQRDesc: string
  stepSpread: string
  stepSpreadDesc: string
  skipForNow: string
  complete: string
  goToDashboard: string
  activationProgress: string
  stepsComplete: string
  allDone: string
  allDoneBody: string
  viewListing: string
}

interface Props {
  listingId: string
  listingTitle: string
  hasPhotos: boolean
  translations: Translations
  locale: string
}

interface ActivationStep {
  key: string
  icon: typeof Camera
  title: string
  description: string
  href: string
  completed: boolean
}

export function ActivationWizard({ listingId, listingTitle, hasPhotos, translations: t, locale }: Props) {
  const [showCongrats, setShowCongrats] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    if (hasPhotos) initial.add('photos')
    return initial
  })

  const prefix = locale === 'en' ? '/en' : ''

  const steps: ActivationStep[] = [
    {
      key: 'photos',
      icon: Camera,
      title: t.stepPhotos,
      description: t.stepPhotosDesc,
      href: `${prefix}/owner/${listingId}#photos`,
      completed: completedSteps.has('photos'),
    },
    {
      key: 'calendar',
      icon: CalendarPlus,
      title: t.stepCalendar,
      description: t.stepCalendarDesc,
      href: `${prefix}/owner/viewings`,
      completed: completedSteps.has('calendar'),
    },
    {
      key: 'email',
      icon: Mail,
      title: t.stepEmail,
      description: t.stepEmailDesc,
      href: `${prefix}/owner/settings`,
      completed: completedSteps.has('email'),
    },
    {
      key: 'agents',
      icon: Users,
      title: t.stepAgents,
      description: t.stepAgentsDesc,
      href: `${prefix}/owner/${listingId}/brief`,
      completed: completedSteps.has('agents'),
    },
    {
      key: 'portals',
      icon: Globe,
      title: t.stepPortals,
      description: t.stepPortalsDesc,
      href: `${prefix}/owner/${listingId}#portals`,
      completed: completedSteps.has('portals'),
    },
    {
      key: 'qr',
      icon: QrCode,
      title: t.stepQR,
      description: t.stepQRDesc,
      href: `${prefix}/p/${listingId}`,
      completed: completedSteps.has('qr'),
    },
    {
      key: 'spread',
      icon: Share2,
      title: t.stepSpread,
      description: t.stepSpreadDesc,
      href: `${prefix}/p/${listingId}`,
      completed: completedSteps.has('spread'),
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const allDone = completedCount === steps.length

  function markDone(key: string) {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  // ── Congratulations popup ────────────────────────────────────────
  if (showCongrats) {
    return (
      <div className="text-center py-8">
        {/* Celebration icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/10 rounded-full mb-6">
          <PartyPopper className="w-10 h-10 text-brand" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          {t.congratsTitle}
        </h1>

        <p className="text-lg text-text-secondary mb-2">
          {t.congratsSubtitle}
        </p>

        <div className="inline-block bg-brand/5 border border-brand/20 rounded-xl px-5 py-3 mb-6">
          <p className="font-semibold text-text-primary">{listingTitle}</p>
        </div>

        <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
          {t.congratsBody}
        </p>

        <button
          onClick={() => setShowCongrats(false)}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-xl transition-colors will-change-transform hover:-translate-y-0.5 text-lg"
        >
          <Rocket className="w-5 h-5" />
          {t.letsGo}
        </button>

        <div className="mt-4">
          <Link
            href={`${prefix}/owner`}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {t.skipForNow}
          </Link>
        </div>
      </div>
    )
  }

  // ── All done state ───────────────────────────────────────────────
  if (allDone) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          {t.allDone}
        </h1>

        <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
          {t.allDoneBody}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href={`${prefix}/p/${listingId}`}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {t.viewListing}
          </Link>
          <Link
            href={`${prefix}/owner`}
            className="inline-flex items-center gap-2 border border-[#E4E6EF] text-text-secondary font-semibold px-6 py-3 rounded-xl hover:bg-bg transition-colors"
          >
            {t.goToDashboard}
          </Link>
        </div>
      </div>
    )
  }

  // ── Activation steps ─────────────────────────────────────────────
  return (
    <div>
      {/* Progress header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t.activationProgress}
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-[#E4E6EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-text-secondary whitespace-nowrap">
            {t.stepsComplete.replace('{done}', String(completedCount)).replace('{total}', String(steps.length))}
          </span>
        </div>
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                step.completed
                  ? 'bg-green-50/50 border-green-200'
                  : 'bg-surface border-[#E4E6EF] hover:border-brand/30 hover:shadow-sm'
              }`}
            >
              {/* Step icon */}
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                step.completed
                  ? 'bg-green-100'
                  : 'bg-brand/5'
              }`}>
                {step.completed ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon className="w-5 h-5 text-brand" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  step.completed ? 'text-green-700 line-through' : 'text-text-primary'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Action */}
              {step.completed ? (
                <span className="flex-shrink-0 text-xs font-semibold text-green-600 px-3 py-1.5 bg-green-100 rounded-lg">
                  {t.complete}
                </span>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => markDone(step.key)}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {t.skipForNow}
                  </button>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-1 bg-brand hover:bg-brand-hover text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {step.title.split(' ')[0]}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href={`${prefix}/owner`}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {t.goToDashboard}
        </Link>
        <Link
          href={`${prefix}/p/${listingId}`}
          className="inline-flex items-center gap-2 border border-brand text-brand font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand/5 transition-colors"
        >
          {t.viewListing}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
