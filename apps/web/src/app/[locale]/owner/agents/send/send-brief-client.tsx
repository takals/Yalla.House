'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Loader2, Shield, CheckCircle2,
  ChevronDown, Building2, Send, FileText,
  MessageSquare, PiggyBank, Lightbulb, Edit3,
  Lock, Info,
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
  currencySymbol: string
}

export function SendBriefClient({
  agents,
  listings,
  selectedListingId,
  isAuthenticated,
  translations: t,
  currencySymbol,
}: Props) {
  const { handleAuthRequired, showAuthGate } = useAuthAction()
  const [tier, setTier] = useState<Tier>('advisory')
  const [listingId, setListingId] = useState<string>(selectedListingId ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showListingPicker, setShowListingPicker] = useState(false)
  const [editingDraft, setEditingDraft] = useState(false)
  const [customDraft, setCustomDraft] = useState<string | null>(null)

  const tiers: { key: Tier; label: string; desc: string }[] = [
    { key: 'advisory', label: t.tierAdvisory ?? '', desc: t.tierAdvisoryDesc ?? '' },
    { key: 'assisted', label: t.tierAssisted ?? '', desc: t.tierAssistedDesc ?? '' },
    { key: 'managed', label: t.tierManaged ?? '', desc: t.tierManagedDesc ?? '' },
  ]

  const selectedListing = listings.find(l => l.id === listingId)

  // Build the draft brief based on selected tier
  const getDraftText = () => {
    if (customDraft !== null) return customDraft
    const intro = t.draftBriefIntro ?? ''
    const tierText = tier === 'advisory'
      ? (t.draftAdvisory ?? '')
      : tier === 'assisted'
        ? (t.draftAssisted ?? '')
        : (t.draftManaged ?? '')
    const closing = t.draftClosing ?? ''
    return `${intro}\n\n${tierText}\n\n${closing}`
  }

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
          notes: customDraft?.trim() || null,
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
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h3 className="font-bold text-text-primary text-xl mb-2">{t.successTitle}</h3>
          <p className="text-sm text-text-secondary mb-6">{t.successDesc}</p>
          <div className="space-y-3">
            <Link href="/owner/agents/tracking">
              <button className="w-full px-4 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-hover transition-colors text-sm">
                {t.viewTracking}
              </button>
            </Link>
            <Link href="/owner/agents/search">
              <button className="w-full px-4 py-3 bg-bg text-text-secondary font-semibold rounded-lg hover:bg-bg-muted transition-colors text-sm mt-3">
                {t.addMoreAgents}
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── Left Column: Selected Agents + Listing Picker ────────── */}
      <div className="lg:col-span-3 space-y-4">
        {/* Selected Agents */}
        <div className="bg-white rounded-2xl border border-border-default p-5">
          <h2 className="font-bold text-text-primary mb-3 text-sm flex items-center gap-2">
            <Building2 size={14} className="text-brand" />
            {t.selectedAgentsTitle}
          </h2>

          {agents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-text-secondary mb-3">{t.noAgentsSelected}</p>
              <Link href="/owner/agents/search">
                <button className="text-sm font-semibold text-brand">{t.selectAgentsLink}</button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-bg rounded-lg px-3 py-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <Building2 size={12} className="text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-xs text-text-primary truncate">{agent.agencyName}</p>
                        {agent.verifiedAt && <Shield size={10} className="text-green-600 flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted mt-2 text-center">
                {agents.length} {t.selectedAgentsTitle?.toLowerCase() ?? 'selected'}
              </p>
            </>
          )}
        </div>

        {/* Listing Picker */}
        {listings.length > 0 && (
          <div className="bg-white rounded-2xl border border-border-default p-5">
            <h2 className="font-bold text-text-primary mb-2 text-sm">{t.selectListing}</h2>
            <button
              onClick={() => setShowListingPicker(!showListingPicker)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-bg rounded-lg text-sm text-text-primary hover:bg-bg-muted transition-colors"
            >
              <span className="truncate text-xs">
                {selectedListing ? selectedListing.label : t.selectListing}
              </span>
              <ChevronDown size={14} className={`text-text-muted transition-transform ${showListingPicker ? 'rotate-180' : ''}`} />
            </button>

            {showListingPicker && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                <button
                  onClick={() => { setListingId(''); setShowListingPicker(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    !listingId ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-bg text-text-secondary'
                  }`}
                >
                  {t.selectListingHint}
                </button>
                {listings.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setListingId(l.id); setShowListingPicker(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      listingId === l.id ? 'bg-brand/10 text-brand font-semibold' : 'hover:bg-bg text-text-primary'
                    }`}
                  >
                    <span className="block truncate">{l.label}</span>
                    {l.price && <span className="text-text-secondary">{l.price}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Center Note */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
          <div className="flex items-start gap-2.5">
            <Lock size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-800 mb-1">{t.messageCenterNote ?? 'Your dedicated message centre'}</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">{t.messageCenterDesc ?? 'All agent responses go to your Yalla inbox — not your personal email. No spam, no cold calls. You stay in control of who can contact you.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Centre Column: Draft Brief ───────────────────────────── */}
      <div className="lg:col-span-6 space-y-4">
        {/* Draft Brief Card */}
        <div className="bg-white rounded-2xl border border-border-default">
          <div className="px-6 py-4 border-b border-border-default flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-brand" />
              <h2 className="font-bold text-text-primary">{t.draftBriefTitle ?? 'Your Draft Brief'}</h2>
            </div>
            <button
              onClick={() => {
                if (!editingDraft && customDraft === null) {
                  setCustomDraft(getDraftText())
                }
                setEditingDraft(!editingDraft)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              <Edit3 size={12} />
              {editingDraft ? (t.editDraftHint ?? 'Done editing') : (t.editDraftHint ?? 'Edit draft')}
            </button>
          </div>

          <div className="px-6 py-5">
            {editingDraft ? (
              <textarea
                value={customDraft ?? getDraftText()}
                onChange={e => setCustomDraft(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-bg rounded-xl text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow leading-relaxed"
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                {getDraftText().split('\n').map((line, i) => (
                  <p key={i} className={`text-sm leading-relaxed ${line.trim() ? 'text-text-primary mb-3' : 'mb-1'}`}>
                    {line || ' '}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collaboration Level — changes the draft */}
        <div className="bg-white rounded-2xl border border-border-default p-5">
          <h2 className="font-bold text-text-primary mb-1 text-sm flex items-center gap-2">
            <MessageSquare size={14} className="text-brand" />
            {t.tierTitle}
          </h2>
          <p className="text-xs text-text-secondary mb-3">{t.tierChangeHint ?? 'Selecting a level updates your draft brief above'}</p>

          <div className="grid grid-cols-3 gap-2">
            {tiers.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => {
                  setTier(key)
                  if (customDraft !== null) {
                    // Reset custom draft when tier changes so user sees the new template
                    setCustomDraft(null)
                  }
                }}
                className={`text-left p-3 rounded-xl border transition-all ${
                  tier === key
                    ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                    : 'border-border-default hover:border-border-dark'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    tier === key ? 'border-brand' : 'border-border-default'
                  }`}>
                    {tier === key && <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
                  </div>
                  <span className="font-semibold text-sm text-text-primary">{label}</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">{desc}</p>
              </button>
            ))}
          </div>
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
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? t.sending : (t.reviewBriefButton ?? t.sendBriefNow)}
        </button>

        {error && (
          <p className="text-xs text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* ── Right Column: Commission Info + Negotiation Tips ─────── */}
      <div className="lg:col-span-3 space-y-4">
        {/* Commission Guide */}
        <div className="bg-white rounded-2xl border border-border-default p-5">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={14} className="text-brand" />
            <h3 className="font-bold text-text-primary text-sm">{t.commissionTitle ?? 'Typical commission rates'}</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {t.commissionNote ?? `In the UK, estate agent fees typically range from 0.75% to 1.5% + VAT of the sale price for sole agency, or 2% to 3% + VAT for multi-agency. Online/hybrid agents often charge a fixed fee of ${currencySymbol}999–${currencySymbol}1,999.`}
          </p>
        </div>

        {/* Negotiation Leverage */}
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-green-700" />
            <h3 className="font-bold text-green-800 text-sm">{t.negotiateTitle ?? 'Your negotiation advantage'}</h3>
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            {t.negotiateDesc ?? 'Because you\'ve completed your Home Passport — professional photos, floor plan, EPC, description, and viewing availability — the agent saves significant time and marketing costs. This is real leverage to negotiate a lower commission rate or better terms.'}
          </p>
        </div>

        {/* No Obligation Info */}
        <div className="bg-bg rounded-2xl border border-border-default p-4">
          <div className="flex items-start gap-2.5">
            <Info size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-text-primary mb-1">{t.infoLabel}</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">{t.infoText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
