'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Loader2, Shield, CheckCircle2,
  ChevronDown, Building2, Send,
  MessageSquare, PiggyBank, Lightbulb,
  Lock, Info, Users, BarChart3, BadgeCheck, Banknote,
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
  address: string
  price: string | null
  bedrooms: number | null
  propertyType: string | null
  city: string | null
  postcode: string | null
}

type Tier = 'advisory' | 'assisted' | 'managed'

interface Props {
  agents: Agent[]
  listings: ListingOption[]
  selectedListingId: string | null
  isAuthenticated: boolean
  translations: Record<string, string>
  currencySymbol: string
  ownerName: string
  agentCount: number
}

export function SendBriefClient({
  agents,
  listings,
  selectedListingId,
  isAuthenticated,
  translations: t,
  currencySymbol,
  ownerName,
  agentCount,
}: Props) {
  const { handleAuthRequired, showAuthGate } = useAuthAction()
  const [tier, setTier] = useState<Tier>('advisory')
  const [listingId, setListingId] = useState<string>(selectedListingId ?? '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showListingPicker, setShowListingPicker] = useState(false)

  const tiers: { key: Tier; label: string; desc: string }[] = [
    { key: 'advisory', label: t.tierAdvisory ?? 'Advisory', desc: t.tierAdvisoryDesc ?? '' },
    { key: 'assisted', label: t.tierAssisted ?? 'Assisted', desc: t.tierAssistedDesc ?? '' },
    { key: 'managed', label: t.tierManaged ?? 'Managed', desc: t.tierManagedDesc ?? '' },
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
          notes: null,
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

        {/* Collaboration Level — changes the preview */}
        <div className="bg-white rounded-2xl border border-border-default p-5">
          <h2 className="font-bold text-text-primary mb-1 text-sm flex items-center gap-2">
            <MessageSquare size={14} className="text-brand" />
            {t.tierTitle}
          </h2>
          <p className="text-xs text-text-secondary mb-3">{t.tierChangeHint ?? 'Selecting a level updates the preview'}</p>

          <div className="space-y-2">
            {tiers.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setTier(key)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
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
                <p className="text-[11px] text-text-secondary leading-snug pl-[18px]">{desc}</p>
              </button>
            ))}
          </div>
        </div>

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

      {/* ── Centre Column: Branded Email Preview ───────────────── */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white rounded-2xl border border-border-default">
          <div className="px-6 py-4 border-b border-border-default">
            <h2 className="font-bold text-text-primary text-sm">{t.draftBriefTitle ?? 'Email Preview'}</h2>
            <p className="text-[11px] text-text-muted mt-0.5">This is what agents will receive</p>
          </div>

          {/* Email template preview */}
          <div className="p-4">
            <div className="bg-[#EDEEF2] rounded-xl overflow-hidden shadow-sm">
              {/* ── Orange header ──────────────────────────── */}
              <div className="bg-[#D4764E] px-6 py-4 flex items-center justify-between">
                <span className="text-lg font-extrabold text-white tracking-tight">Yalla.House</span>
                <span className="text-[10px] font-semibold text-white/75 uppercase tracking-widest">
                  {t.previewPropertyCollaboration ?? 'Property Collaboration'}
                </span>
              </div>

              {/* ── White content area ─────────────────────── */}
              <div className="bg-white mx-0">
                <div className="px-6 py-6 space-y-4">
                  {/* Greeting */}
                  <p className="text-base font-medium text-[#0F1117]">
                    {t.previewGreeting ?? 'Hi [Agent Name],'}
                  </p>

                  {/* Tier-specific intro */}
                  <p className="text-sm text-[#5E6278] leading-relaxed">
                    {tier === 'advisory' && (t.previewAdvisoryIntro ? t.previewAdvisoryIntro.replace('__OWNER__', ownerName) : `${ownerName} has invited you to provide expert advisory support for the sale of their property through Yalla.House.`)}
                    {tier === 'assisted' && (t.previewAssistedIntro ? t.previewAssistedIntro.replace('__OWNER__', ownerName) : `${ownerName} has invited you to collaborate on the sale of their property through Yalla.House using the Assisted collaboration model.`)}
                    {tier === 'managed' && (t.previewManagedIntro ? t.previewManagedIntro.replace('__OWNER__', ownerName) : `${ownerName} has invited you to discuss a full-service sales collaboration through Yalla.House regarding the sale of their property.`)}
                  </p>

                  {/* Scope section */}
                  <div>
                    <p className="text-sm text-[#5E6278] mb-2">
                      {tier === 'advisory' && (t.previewAdvisoryScope ?? 'The owner is looking for guidance with:')}
                      {tier === 'assisted' && (t.previewAssistedScope ?? 'The owner is looking for support with:')}
                      {tier === 'managed' && (t.previewManagedScope ?? 'The owner is currently exploring agent-led support for:')}
                    </p>
                    <ul className="space-y-1 pl-4">
                      {tier === 'advisory' && (
                        <>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAdvisoryItem1 ?? 'pricing strategy and market positioning,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAdvisoryItem2 ?? 'marketing recommendations,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAdvisoryItem3 ?? 'and negotiation advice when offers come in.'}</li>
                        </>
                      )}
                      {tier === 'assisted' && (
                        <>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAssistedItem1 ?? 'managing buyer enquiries,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAssistedItem2 ?? 'coordinating viewings,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewAssistedItem3 ?? 'and handling day-to-day communication,'}</li>
                        </>
                      )}
                      {tier === 'managed' && (
                        <>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewManagedItem1 ?? 'buyer communication,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewManagedItem2 ?? 'viewings,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewManagedItem3 ?? 'negotiation,'}</li>
                          <li className="text-sm text-[#5E6278] list-disc">{t.previewManagedItem4 ?? 'and overall transaction management.'}</li>
                        </>
                      )}
                    </ul>
                    {tier === 'advisory' && (
                      <p className="text-xs text-[#999] italic mt-2">{t.previewAdvisoryOwnerNote ?? 'The owner will manage viewings, buyer enquiries, and day-to-day communication directly.'}</p>
                    )}
                    {tier === 'assisted' && (
                      <p className="text-xs text-[#999] italic mt-2">{t.previewAssistedOwnerNote ?? 'while retaining control over negotiation and final decision-making.'}</p>
                    )}
                    {tier === 'managed' && (
                      <p className="text-xs text-[#999] italic mt-2">{t.previewManagedMultiAgent ?? 'The owner may be speaking with multiple agents before deciding how they would like to proceed.'}</p>
                    )}
                  </div>

                  {/* ── Property Overview Card ─────────────────── */}
                  <div className="bg-[#F5F5FA] rounded-lg p-4">
                    <h3 className="text-xs font-bold text-[#0F1117] uppercase tracking-wider mb-3">
                      {t.previewPropertyOverview ?? 'Property Overview'}
                    </h3>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-[#E2E4EB]/50">
                          <td className="py-1.5 text-[#5E6278]">{t.previewAddress ?? 'Address'}</td>
                          <td className="py-1.5 font-semibold text-right">{selectedListing?.address ?? '—'}</td>
                        </tr>
                        <tr className="border-b border-[#E2E4EB]/50">
                          <td className="py-1.5 text-[#5E6278]">{t.previewEstimatedValue ?? 'Estimated Value'}</td>
                          <td className="py-1.5 font-semibold text-right">{selectedListing?.price ?? 'Price on application'}</td>
                        </tr>
                        <tr className="border-b border-[#E2E4EB]/50">
                          <td className="py-1.5 text-[#5E6278]">{t.previewPropertyType ?? 'Property Type'}</td>
                          <td className="py-1.5 font-semibold text-right capitalize">{selectedListing?.propertyType ?? '—'}</td>
                        </tr>
                        <tr className="border-b border-[#E2E4EB]/50">
                          <td className="py-1.5 text-[#5E6278]">{t.previewSellerTimeline ?? 'Seller Timeline'}</td>
                          <td className="py-1.5 font-semibold text-right">Flexible</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-[#5E6278]">{t.previewViewingReadiness ?? 'Viewing Readiness'}</td>
                          <td className="py-1.5 font-semibold text-right">Preparing</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Workspace section */}
                  <div>
                    <p className="text-sm text-[#5E6278] mb-2">
                      {t.previewWorkspaceIntro ?? 'The property workspace is already active within Yalla.House and includes:'}
                    </p>
                    <ul className="space-y-1 pl-4">
                      <li className="text-sm text-[#5E6278] list-disc">{t.previewWorkspaceItem1 ?? 'the live property listing,'}</li>
                      <li className="text-sm text-[#5E6278] list-disc">{t.previewWorkspaceItem2 ?? 'media and property information,'}</li>
                      <li className="text-sm text-[#5E6278] list-disc">{t.previewWorkspaceItem3 ?? 'seller availability,'}</li>
                      <li className="text-sm text-[#5E6278] list-disc">{t.previewWorkspaceItem4 ?? 'buyer activity tracking,'}</li>
                      <li className="text-sm text-[#5E6278] list-disc">{t.previewWorkspaceItem5 ?? 'and structured communication tools.'}</li>
                    </ul>
                    <p className="text-sm text-[#5E6278] mt-3">
                      {t.previewTransparency ?? 'This allows both sides to collaborate transparently while keeping the process organised for the owner and interested buyers.'}
                    </p>
                  </div>

                  {/* Competitor count */}
                  {agentCount > 1 && (
                    <p className="text-sm font-semibold text-[#D4764E]">
                      You are currently one of {agentCount} agents invited to participate.
                    </p>
                  )}

                  {/* CTA button */}
                  <div className="text-center pt-2">
                    <span className="inline-block px-6 py-3 bg-[#D4764E] text-white font-bold text-sm rounded-lg">
                      {t.previewCta ?? 'Open Listing & Collaboration Workspace'} →
                    </span>
                  </div>

                  {/* Sign-off */}
                  <div className="pt-2">
                    <p className="text-sm text-[#5E6278]">{t.previewSignoff ?? 'Best regards,'}</p>
                    <p className="text-sm font-semibold text-[#0F1117]">{t.previewTeam ?? 'The Yalla.House Team'}</p>
                  </div>
                </div>

                {/* ── Benefit section ──────────────────────── */}
                <div className="border-t border-[#E2E4EB] px-6 py-5">
                  <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-3">
                    {t.previewBenefitHeading ?? 'WHY AGENTS CHOOSE YALLA.HOUSE'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
                        <Users size={14} className="text-[#D4764E]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F1117]">{t.previewBenefit1Title ?? 'Qualified Leads'}</p>
                        <p className="text-[11px] text-[#5E6278]">{t.previewBenefit1Desc ?? 'Every lead is a motivated seller with a prepared listing.'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
                        <Banknote size={14} className="text-[#D4764E]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F1117]">{t.previewBenefit2Title ?? 'Transparent Pricing'}</p>
                        <p className="text-[11px] text-[#5E6278]">{t.previewBenefit2Desc ?? 'You set your terms. No hidden platform fees.'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
                        <BarChart3 size={14} className="text-[#D4764E]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F1117]">{t.previewBenefit3Title ?? 'Full Dashboard'}</p>
                        <p className="text-[11px] text-[#5E6278]">{t.previewBenefit3Desc ?? 'Manage your pipeline, viewings, and communication in one place.'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
                        <BadgeCheck size={14} className="text-[#D4764E]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F1117]">{t.previewBenefit4Title ?? 'Verified Profiles'}</p>
                        <p className="text-[11px] text-[#5E6278]">{t.previewBenefit4Desc ?? 'Build trust with a verified agent profile on the platform.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Footer ──────────────────────────────── */}
                <div className="bg-[#F5F5FA] border-t border-[#E2E4EB] px-6 py-3 text-center">
                  <p className="text-[11px] text-[#D4764E] font-medium">
                    Services · About · FAQ · <span className="font-bold">yalla.house</span>
                  </p>
                  <p className="text-[10px] text-[#999] mt-1">
                    Yalla.House Ltd — Flat-fee property platform
                  </p>
                </div>
              </div>
            </div>
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
