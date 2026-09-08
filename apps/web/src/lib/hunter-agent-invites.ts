import { createServiceClient } from '@/lib/supabase/server'
import { sendHunterBriefEmail, type EmailLocale } from '@/lib/resend'
import { getCountryConfig } from '@/lib/country-config'

const BASE_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://yalla.house'

/**
 * When a hunter sends their brief to agents, tell the agents.
 *
 * Until this existed, /api/agents/connect wrote agent_hunter_assignments and
 * stopped. Agents only saw invites in their dashboard — and almost none of the
 * ~30k collected agents have claimed a profile, so the brief reached nobody.
 *
 * DARK BY DEFAULT. Sends nothing unless HUNTER_AGENT_INVITE_EMAILS=on. The
 * agents' addresses were collected from public directories, so switching this on
 * requires the legitimate-interest assessment to be signed off first; the email
 * carries the Article 14 source line for that reason.
 *
 * Guardrails, all enforced here:
 *  - rate limit per hunter (agent:invite, 50/day) via check_rate_limit
 *  - blocked_agents honoured
 *  - one email per (hunter, agent) ever: hunter_consent_log 'brief_emailed'
 *  - never throws; the connect response must not depend on email delivery
 */
export async function notifyInvitedAgents(hunterId: string, agentIds: string[]): Promise<void> {
  if (process.env['HUNTER_AGENT_INVITE_EMAILS'] !== 'on') {
    console.info(`[hunter-invites] dark: would have notified ${agentIds.length} agent(s) for hunter ${hunterId}`)
    return
  }
  if (!agentIds.length) return

  const db = createServiceClient()
  try {
    // Rate limit: one bucket per hunter per day. Limits emails, not assignments.
    const { data: rl } = await (db.rpc as any)('check_rate_limit', {
      p_scope: 'agent:invite', p_key: `user:${hunterId}`, p_limit: 50, p_window_seconds: 86400,
    })
    if (rl && rl.allowed === false) {
      console.warn(`[hunter-invites] rate limited hunter ${hunterId}`)
      return
    }

    const [{ data: hunterUser }, { data: hp }, { data: agents }, { data: blocked }, { data: already }] = await Promise.all([
      (db.from('users') as any).select('full_name').eq('id', hunterId).maybeSingle(),
      (db.from('hunter_profiles') as any)
        .select('intent, target_areas, budget_min, budget_max, property_types, min_bedrooms, timeline')
        .eq('user_id', hunterId).maybeSingle(),
      (db.from('agent_profiles') as any)
        .select('user_id, email, agency_name, claimed_at, country_code, data_source')
        .in('user_id', agentIds)
        .eq('do_not_contact', false),   // objections are honoured here and in matching
      (db.from('blocked_agents') as any).select('agent_id').eq('hunter_id', hunterId),
      (db.from('hunter_consent_log') as any)
        .select('agent_id').eq('hunter_id', hunterId).eq('event_type', 'brief_emailed').in('agent_id', agentIds),
    ])
    if (!hp) return

    const skip = new Set<string>([
      ...((blocked ?? []) as { agent_id: string }[]).map(b => b.agent_id),
      ...((already ?? []) as { agent_id: string }[]).map(a => a.agent_id),
    ])

    // Areas are stored as postcode prefixes ('ig', 'e', '10'); render their labels.
    const prefixes: string[] = Array.isArray(hp.target_areas) ? hp.target_areas.map((x: unknown) => String(x)) : []
    const countryCode = prefixes.length && prefixes.every(p => /^\d/.test(p)) ? 'DE' : 'GB'
    const regions = getCountryConfig(countryCode)?.regions ?? []
    const areas = prefixes.map(p => ({
      name: regions.find(r => r.prefix.toLowerCase() === p.toLowerCase())?.label ?? p.toUpperCase(),
    }))
    const locale: EmailLocale = countryCode === 'DE' ? 'de-DE' : 'en-GB'
    const firstName = (hunterUser?.full_name as string | undefined)?.split(' ')[0] || (locale === 'de-DE' ? 'Ein Suchender' : 'A buyer')

    const results = await Promise.allSettled(
      ((agents ?? []) as Array<{ user_id: string; email: string | null; agency_name: string | null; claimed_at: string | null; data_source: string | null }>)
        .filter(a => a.email && !skip.has(a.user_id))
        .map(async a => {
          const source = a.data_source ?? (locale === 'de-DE' ? 'einem öffentlichen Verzeichnis' : 'a public directory')
          const sourceNote = locale === 'de-DE'
            ? `Ihre E-Mail-Adresse stammt aus dem öffentlichen Eintrag Ihres Büros bei ${source} und wird nur genutzt, um Anfragen von Suchenden weiterzuleiten, deren Suche zu Ihrem Gebiet passt. Löschung jederzeit: privacy@yalla.house.`
            : `Your email address was taken from your agency's public listing on ${source} and is used only to pass on enquiries from buyers whose search matches your coverage. Ask us to remove it at any time: privacy@yalla.house.`
          await sendHunterBriefEmail({
            agentEmail: a.email!,
            agentName: a.agency_name,
            hunterFirstName: firstName,
            intent: hp.intent ?? 'buy',
            areas,
            budgetMin: hp.budget_min ?? null,
            budgetMax: hp.budget_max ?? null,
            currency: countryCode === 'DE' ? 'EUR' : 'GBP',
            propertyTypes: hp.property_types ?? null,
            bedroomsMin: hp.min_bedrooms ?? null,
            timeline: hp.timeline ?? null,
            matchId: `${hunterId}:${a.user_id}`,
            countryCode,
            locale,
            ctaUrl: a.claimed_at ? `${BASE_URL}/agent/briefs` : `${BASE_URL}/agent/profile`,
            sourceNote,
          })
          await (db.from('hunter_consent_log') as any)
            .insert({ hunter_id: hunterId, agent_id: a.user_id, event_type: 'brief_emailed' })
          return a.user_id
        }),
    )
    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.length - sent
    console.info(`[hunter-invites] hunter ${hunterId}: sent ${sent}, failed ${failed}, skipped ${skip.size}`)
  } catch (err) {
    console.error('[hunter-invites] failed', err)
  }
}
