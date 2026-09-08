'use client'

import { useTranslations } from 'next-intl'
import { GuidedTour, type TourStep } from './guided-tour'

/**
 * Per-role step definitions. Targets are data-tour ids set in DashboardShell:
 *   nav:<href>  — a sidebar item
 *   main        — the content area
 *   account     — the avatar / account area
 * Copy lives under messages.tour.<role>.<step>.{title,body}.
 */
const STEPS: Record<string, { id: string; target?: string }[]> = {
  owner: [
    { id: 'welcome',   target: 'main' },
    { id: 'workspace', target: 'nav:/owner/workspace' },
    { id: 'listings',  target: 'nav:/owner/listings' },
    { id: 'calendar',  target: 'nav:/owner/calendar' },
    { id: 'plans',     target: 'nav:/owner/plans' },
  ],
  hunter: [
    { id: 'welcome',  target: 'main' },
    { id: 'search',   target: 'nav:/hunter/search' },
    { id: 'passport', target: 'nav:/hunter/passport' },
    { id: 'viewings', target: 'nav:/hunter/viewings' },
    { id: 'inbox',    target: 'nav:/hunter/inbox' },
  ],
  agent: [
    { id: 'welcome',     target: 'main' },
    { id: 'assignments', target: 'nav:/agent/assignments' },
    { id: 'briefs',      target: 'nav:/agent/briefs' },
    { id: 'profile',     target: 'nav:/agent/profile' },
  ],
  partner: [
    { id: 'welcome',  target: 'main' },
    { id: 'requests', target: 'nav:/partner/requests' },
  ],
}

export function RoleTour({ role }: { role: string }) {
  const t = useTranslations('tour')
  const defs = STEPS[role]
  if (!defs) return null

  const steps: TourStep[] = defs.map(d => ({
    id: d.id, target: d.target,
    title: t(`${role}.${d.id}.title`),
    body: t(`${role}.${d.id}.body`),
  }))

  return (
    <GuidedTour
      storageKey={`yh:tour:${role}:v1`}
      steps={steps}
      labels={{
        next: t('next'), back: t('back'), skip: t('skip'), done: t('done'),
        // ICU placeholders are formatted by next-intl, not by string replace.
        progress: (n, total) => t('progress', { n, total }),
      }}
    />
  )
}
