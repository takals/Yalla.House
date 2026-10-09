'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShieldCheck, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthGate } from '@/components/auth-gate-provider'

export interface SuggestedAgent {
  agent_id: string
  agency_name: string | null
  matched_prefixes: string[]
  regions: string[] | null
  is_verified: boolean
  is_claimed: boolean
  has_email: boolean
}

/**
 * Agents whose coverage overlaps the hunter's passport areas. The hunter picks
 * which ones receive their brief; /api/agents/connect creates the assignments
 * (status 'invited', initiated_by 'hunter') — the same path the manual postcode
 * search uses. Guests can see the list; sending is the action that asks for sign-in.
 */
export function SuggestedAgents({ agents, isGuest }: { agents: SuggestedAgent[]; isGuest: boolean }) {
  const t = useTranslations('hunterAgents')
  const router = useRouter()
  const { showAuthGate } = useAuthGate()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const all = selected.size === agents.length && agents.length > 0

  async function send() {
    if (isGuest) { showAuthGate(); return }
    if (selected.size === 0) return
    setSending(true); setError(null)
    try {
      const res = await fetch('/api/agents/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentProfileIds: Array.from(selected) }),
      })
      if (res.status === 401) { showAuthGate(); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'connect failed')
      setSent(data.connected ?? selected.size)
      setSelected(new Set())
      router.refresh()   // the invited agents now appear in the assignments list above
    } catch {
      setError(t('suggestedError'))
    } finally {
      setSending(false)
    }
  }

  if (sent !== null) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-card p-5 flex items-start gap-3">
        <CheckCircle2 size={18} className="text-green-700 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-green-900">{t('suggestedSent', { n: sent })}</p>
          <p className="text-green-800 mt-0.5">{t('suggestedSentDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-card p-6 border border-border-default">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="font-semibold">{t('suggestedTitle', { n: agents.length })}</h3>
        <button type="button" onClick={() => setSelected(all ? new Set() : new Set(agents.map(a => a.agent_id)))}
                className="text-xs font-semibold text-brand hover:text-brand-hover">
          {all ? t('clearAll') : t('selectAll')}
        </button>
      </div>
      <p className="text-sm text-text-secondary mb-4">{t('suggestedDesc')}</p>

      <ul className="divide-y divide-border-default mb-4">
        {agents.map(a => (
          <li key={a.agent_id}>
            <label className="flex items-start gap-3 py-3 cursor-pointer">
              <input type="checkbox" checked={selected.has(a.agent_id)} onChange={() => toggle(a.agent_id)}
                     className="mt-1 h-4 w-4 accent-brand" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-text-primary truncate">{a.agency_name ?? t('unknownAgency')}</span>
                  {a.is_verified && (
                    <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                      <ShieldCheck size={11} /> {t('verified')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                  <MapPin size={11} className="flex-shrink-0" />
                  {t('matchedIn', { areas: a.matched_prefixes.join(', ') })}
                  {a.regions?.length ? <span className="text-text-muted"> · {a.regions.slice(0, 2).join(', ')}</span> : null}
                </p>
              </div>
            </label>
          </li>
        ))}
      </ul>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button type="button" onClick={send} disabled={sending || (!isGuest && selected.size === 0)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover disabled:opacity-50 transition-colors">
        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        {isGuest ? t('sendBriefSignIn') : t('sendBriefTo', { n: selected.size })}
      </button>
      <p className="text-xs text-text-muted mt-2">{t('suggestedNote')}</p>
    </div>
  )
}
