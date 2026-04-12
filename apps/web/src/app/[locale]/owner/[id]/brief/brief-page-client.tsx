'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Home, CheckCircle } from 'lucide-react'
import { BriefSendForm } from './brief-send-form'
import { OwnerBriefIntake } from '@/components/intake/owner-brief-intake'
import type { Database } from '@/types/database'

type ListingRow = Database['public']['Tables']['listings']['Row']
type AssignmentRow = Database['public']['Tables']['listing_agent_assignments']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type AgentProfileRow = Database['public']['Tables']['agent_profiles']['Row']

interface AgentWithProfile extends UserRow {
  profile?: AgentProfileRow | null
}

interface AssignmentWithAgent extends AssignmentRow {
  agent?: AgentWithProfile | null
}

interface OwnerBriefPageClientProps {
  userId: string
  listingId: string
  locale: string
  listing: ListingRow
  existingAssignments: AssignmentWithAgent[]
  matchedAgents: AgentWithProfile[]
  existingAgentIds: Set<string>
  briefSentDate: string | null
  formTranslations: Record<string, string>
  intakeTranslations: Record<string, string>
  translations: Record<string, string>
}

export function OwnerBriefPageClient({
  userId,
  listingId,
  locale,
  listing,
  existingAssignments,
  matchedAgents,
  existingAgentIds,
  briefSentDate,
  formTranslations,
  intakeTranslations,
  translations,
}: OwnerBriefPageClientProps) {
  const [mode, setMode] = useState<'classic' | 'chat'>('chat')

  if ((mode as any) === 'chat') {
    return (
      <OwnerBriefIntake
        userId={userId}
        listingId={listingId}
        translations={intakeTranslations}
      />
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setMode('chat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'chat'
              ? 'bg-[#D4764E] text-white'
              : 'bg-[#F5F5F7] text-[#0F1117] border border-[#E2E4EB] hover:bg-[#E2E4EB]'
          }`}
        >
          Chat with Yalla
        </button>
        <button
          onClick={() => setMode('classic')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'classic'
              ? 'bg-[#D4764E] text-white'
              : 'bg-[#F5F5F7] text-[#0F1117] border border-[#E2E4EB] hover:bg-[#E2E4EB]'
          }`}
        >
          Classic Form
        </button>
      </div>

      {/* Back link */}
      <Link
        href={`/${locale}/owner/${listingId}`}
        className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover mb-6 inline-block"
      >
        <ArrowLeft size={16} />
        {translations.backToListing}
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">
          {translations.pageTitle}
        </h1>
        <p className="text-[#5E6278]">
          {translations.pageDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column: Brief preview + assignments + form */}
        <div className="lg:col-span-2">
          {/* Brief Preview Card */}
          <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6 mb-8">
            <h2 className="text-lg font-bold text-[#0F1117] mb-4 flex items-center gap-2">
              <Home size={20} />
              {translations.sectionPropertySummary}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {translations.labelAddress}
                  </p>
                  <p className="text-sm font-medium text-[#0F1117]">
                    {listing.address_line1}
                    {listing.address_line2 && `, ${listing.address_line2}`}
                  </p>
                  <p className="text-sm text-[#5E6278]">
                    {listing.city} {listing.postcode}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1">
                    {translations.labelType}
                  </p>
                  <p className="text-sm font-medium text-[#0F1117]">
                    {listing.property_type || '-'}
                  </p>
                </div>

                {listing.bedrooms !== null && (
                  <div>
                    <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1">
                      {translations.labelBedrooms}
                    </p>
                    <p className="text-sm font-medium text-[#0F1117]">{listing.bedrooms}</p>
                  </div>
                )}

                {listing.bathrooms !== null && (
                  <div>
                    <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1">
                      {translations.labelBathrooms}
                    </p>
                    <p className="text-sm font-medium text-[#0F1117]">{listing.bathrooms}</p>
                  </div>
                )}

                {listing.size_sqm && (
                  <div>
                    <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1">
                      {translations.labelSize}
                    </p>
                    <p className="text-sm font-medium text-[#0F1117]">{listing.size_sqm} m²</p>
                  </div>
                )}

                {listing.sale_price && (
                  <div>
                    <p className="text-xs font-semibold text-[#5E6278] uppercase mb-1">
                      {translations.labelPrice}
                    </p>
                    <p className="text-sm font-medium text-[#0F1117]">
                      £{(listing.sale_price / 100).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {listing.description_de && (
                <div className="pt-4 border-t border-[#E2E4EB]">
                  <p className="text-xs font-semibold text-[#5E6278] uppercase mb-2">
                    {translations.labelDescription}
                  </p>
                  <p className="text-sm text-[#5E6278] line-clamp-3">{listing.description_de}</p>
                </div>
              )}

              {listing.seller_situation && (
                <div className="pt-4 border-t border-[#E2E4EB]">
                  <p className="text-xs font-semibold text-[#5E6278] uppercase mb-2">
                    {translations.labelSellerSituation}
                  </p>
                  <p className="text-sm text-[#5E6278]">{listing.seller_situation}</p>
                </div>
              )}

              {listing.preferred_completion && (
                <div className="pt-4 border-t border-[#E2E4EB]">
                  <p className="text-xs font-semibold text-[#5E6278] uppercase mb-2">
                    {translations.labelPreferredCompletion}
                  </p>
                  <p className="text-sm text-[#5E6278]">{listing.preferred_completion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Existing Assignments Section */}
          {existingAssignments.length > 0 && (
            <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6 mb-8">
              <h2 className="text-lg font-bold text-[#0F1117] mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                {translations.sectionCurrentAssignments}
              </h2>

              <div className="space-y-3">
                {existingAssignments.map(assignment => {
                  const statusKey = `assignmentStatus${assignment.status.charAt(0).toUpperCase()}${assignment.status.slice(1)}`
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-start justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E4EB]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0F1117]">
                          {assignment.agent?.full_name ?? translations.unknownAgent}
                        </p>
                        <p className="text-xs text-[#5E6278]">{assignment.agent?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: {
                              invited: '#DBEAFE',
                              accepted: '#DCFCE7',
                              active: '#DCFCE7',
                              paused: '#FEF3C7',
                              revoked: '#FEE2E2',
                            }[assignment.status] || '#F3F4F6',
                            color: {
                              invited: '#1E40AF',
                              accepted: '#166534',
                              active: '#166534',
                              paused: '#92400E',
                              revoked: '#991B1B',
                            }[assignment.status] || '#6B7280',
                          }}
                        >
                          {translations[statusKey] || assignment.status}
                        </span>
                        <span className="text-xs font-medium text-[#5E6278]">
                          {translations[`tier${assignment.tier.charAt(0).toUpperCase()}${assignment.tier.slice(1)}`] || assignment.tier}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Send Brief Form */}
          <BriefSendForm
            listingId={listingId}
            agents={matchedAgents.map((agent: any) => ({
              id: agent.id,
              full_name: agent.full_name || translations.unknownAgent,
              email: agent.email || '',
              agency_name: agent.profile?.agency_name || translations.unknownAgent,
              verified: !!agent.profile?.verified_at,
              tier: agent.profile?.subscription_tier || 'standard',
            }))}
            existingAssignmentAgentIds={Array.from(existingAgentIds)}
            translations={formTranslations as any}
          />
        </div>

        {/* Sidebar: Agents Grid */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-lg font-bold text-[#0F1117] mb-4">
              {translations.sectionAvailableAgents}
            </h2>

            {matchedAgents.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6 text-center">
                <p className="text-sm text-[#5E6278]">
                  {translations.noAgentsFound}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchedAgents.map(agent => (
                  <div
                    key={agent.id}
                    className={`bg-surface rounded-lg border p-4 transition-all ${
                      existingAgentIds.has(agent.id)
                        ? 'border-[#D9DCE4] opacity-60 pointer-events-none'
                        : 'border-[#E2E4EB] hover:border-[#C8CCD6]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#0F1117] mb-1">
                      {agent.full_name}
                    </p>
                    <p className="text-xs text-[#5E6278] mb-2">{agent.profile?.agency_name}</p>

                    {agent.profile?.verified_at && (
                      <div className="flex items-center gap-1 mb-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-[#059669]">
                          {translations.badgeVerified}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-[#999999] capitalize">
                      {agent.profile?.subscription_tier || 'standard'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {briefSentDate && (
              <div className="mt-6 p-4 bg-[#DCFCE7] rounded-lg border border-[#86EFAC]">
                <p className="text-xs font-semibold text-[#166534] uppercase mb-1 flex items-center gap-2">
                  <CheckCircle size={14} />
                  {translations.badgeBriefSent}
                </p>
                <p className="text-sm font-medium text-[#166534]">{briefSentDate}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
