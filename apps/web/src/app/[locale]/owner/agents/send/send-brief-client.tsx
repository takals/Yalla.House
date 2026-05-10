'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, Loader2, Shield, ArrowRight, CheckCircle2,
  ChevronDown, Building2, Send,
} from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'

interface Agent {
  id: string
  agencyName: string
  email: string | null
  phone: string | null
  postcode: string | null
  verifiedAt: string | null
}

interface ListingOption {
  id: string
  label: string
  price: string | null
  bedrooms: number | null
  propertyType: string | null
}

type Tier = 'advisory' | 'assisted' | 'managed'

interface Props {
  agents: Agent[]
  listings: ListingOption[]
  selectedListingId: string | null
  isAuthenticated: boolean
  translations: Record<string, string>
}

export function SendBriefClient({
  agents,
  listings,
  selectedListingId,
  isAuthenticated,
  translations: t,
}: Props) {
  const router = useRouter()
  const { handleAuthRequired, showAuthGate } = useAuthAction()
  const [tier, setTier] = useState<Tier>('advisory')
  const [notes, setNotes] = useState('')
  const [listingId, setListingId] = useState<string>(selectedListingId ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showListingPicker, setShowListingPicker] = useState(false)

  const tiers: { key: Tier; label: string; desc: string }[] = [
    { key: 'advisory', label: t.tierAdvisory ?? '', desc: t.tierAdvisoryDesc ?? '' },
    { key: 'assisted', label: t.tierAssisted ?? '', desc: t.tierAssistedDesc ?? '' },
    { key: 'managed', label: t.tierManaged ?? '', desc: t.tierManagedDesc ?? '' },
  ]

  const selectedListing = listings.find(l => l.id === listingId)

  async function handleSend() {
    if (!isAuthenticated) {
      showAuthGate()
      return
    }

    if (agents.length === 0) return

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/agents/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listingId || null,
          agentProfileIds: agents.map(a => a.id),
          tier,
          notes: notes.trim() || null,
        }),
      })

      const data = await res.json()

      if (handleAuthRequired(data)) return

      if (!res.ok) {
        throw new Error(data.error || t.errorSendFailed || 'Send failed')
      }

      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (t.errorGeneric ?? 'Something went wrong'))
    } finally {
      setSending(false)
    }
  }

  // ── Success State ──────────────────────────────────────────
  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6 text-center sticky top-8">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="font-bold text-text-primary text-lg mb-2">{t.successTitle}</h3>
        <p className="text-sm text-text-secondary mb-6">{t.successDesc}</p>
        <div className="space-y-3">
          <Link href="/owner/agents/tracking">
            <button className="w-full px-4 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors text-sm">
              {t.viewTracking}
            </button>
          </Link>
          <Link href="/owner/agents/search">
            <button className="w-full px-4 py-2.5 bg-bg text-text-secondary font-semibold rounded-lg hover:bg-bg-muted transition-colors text-sm mt-3">
              {t.addMoreAgents}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sticky top-8">
      {/* Selected Agents Card */}
      <div className="bg-white rounded-2xl border border-border-default p-5">
        <h2 className="font-bold text-text-primary mb-4 text-sm">{t.selectedAgentsTitle}</h2>

        {agents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-text-secondary mb-4">{t.noAgentsSelected}</p>
            <Link href="/owner/agents/search">
              <button className="text-sm font-semibold text-brand">{t.selectAgentsLink}</button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {agents.map(agent => (
                <div key={agent.id} className="bg-bg rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-text-primary truncate">{agent.agencyName}</p>
                      {agent.verifiedAt && <Shield size={12} className="text-green-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-text-secondary truncate">
                      {agent.email ?? agent.phone ?? agent.postcode ?? ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/owner/agents/search">
              <button className="w-full text-xs font-semibold text-text-secondary py-1.5 hover:text-text-primary transition-colors flex items-center justify-center gap-1">
                <ArrowRight size={12} />
                {t.addMoreAgents}
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Listing Picker */}
      {listings.length > 0 && (
        <div className="bg-white rounded-2xl border border-border-default p-5">
          <h2 className="font-bold text-text-primary mb-2 text-sm">{t.selectListing}</h2>
          <p className="text-xs text-text-secondary mb-3">{t.selectListingHint}</p>

          <button
            onClick={() => setShowListingPicker(!showListingPicker)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-bg rounded-lg text-sm text-text-primary hover:bg-bg-muted transition-colors"
          >
            <span className="truncate">
              {selectedListing ? selectedListing.label : t.selectListing}
            </span>
            <ChevronDown size={14} className={`text-text-muted transition-transform ${showListingPicker ? 'rotate-180' : ''}`} />
          </button>

          {showListingPicker && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {/* Option for no listing */}
              <button
                onClick={() => { setListingId(''); setShowListingPicker(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !listingId ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-bg text-text-secondary'
                }`}
              >
                {t.selectListingHint}
              </button>
              {listings.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setListingId(l.id); setShowListingPicker(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    listingId === l.id ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-bg text-text-primary'
                  }`}
                >
                  <span className="block truncate">{l.label}</span>
                  {l.price && (
                    <span className="text-xs text-text-secondary">{l.price}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tier Selector */}
      <div className="bg-white rounded-2xl border border-border-default p-5">
        <h2 className="font-bold text-text-primary mb-3 text-sm">{t.tierTitle}</h2>
        <div className="space-y-2">
          {tiers.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setTier(key)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                tier === key
                  ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                  : 'border-border-default hover:border-border-dark'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  tier === key ? 'border-brand' : 'border-border-default'
                }`}>
                  {tier === key && <div className="w-2 h-2 rounded-full bg-brand" />}
                </div>
                <span className="font-semibold text-sm text-text-primary">{label}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 ml-6">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-border-default p-5">
        <h2 className="font-bold text-text-primary mb-2 text-sm">{t.notesTitle}</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className="w-full px-3 py-2 bg-bg rounded-lg text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
        />
      </div>

      {/* Auth Gate Warning (for guests) */}
      {!isAuthenticated && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">{t.signInRequired}</p>
          <p className="text-xs text-amber-700">{t.signInDesc}</p>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={sending || agents.length === 0}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? t.sending : t.sendBriefNow}
      </button>

      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
