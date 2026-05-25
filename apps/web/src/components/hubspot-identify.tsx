'use client'

import { useEffect } from 'react'
import { hubspot } from '@yalla/integrations'

type YallaUserRole = hubspot.YallaUserRole
type YallaLocale = hubspot.YallaLocale

interface Props {
  email: string
  /** Role hint from the section the user is currently viewing. */
  section?: string
  locale?: YallaLocale
}

const SECTION_TO_ROLE: Record<string, YallaUserRole> = {
  owner: 'owner',
  hunter: 'hunter',
  agent: 'agent',
  partner: 'partner',
  referrer: 'referrer',
  admin: 'admin',
}

/**
 * Fires HubSpot identifyUser() when the user lands on an authenticated page.
 *
 * Mount this once inside <DashboardShell>; no manual placement needed in role
 * layouts. The component renders nothing.
 *
 * Skips when:
 *  - server-side (no window)
 *  - HubSpot tracking script not loaded (no portal id env)
 *  - email empty (unauthenticated preview)
 */
export function HubSpotIdentify({ email, section, locale }: Props) {
  useEffect(() => {
    if (!email) return
    const role = section ? SECTION_TO_ROLE[section] : undefined
    hubspot.identifyUser({
      email,
      ...(role ? { role } : {}),
      ...(locale ? { locale } : {}),
    })
  }, [email, section, locale])

  return null
}
