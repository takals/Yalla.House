import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ChevronLeft, Check, X } from 'lucide-react'
import { ProposalForm } from './proposal-form'
import { fromMinorUnits } from '@yalla/integrations'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AssignmentDetailPage({ params }: Props) {
  const t = await getTranslations('agentAssignments')
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch the assignment with full details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select(`
      id,
      status,
      tier,
      can_edit_listing,
      can_manage_viewings,
      can_negotiate,
      can_message_buyers,
      fee_type,
      fee_amount,
      notes,
      created_at,
      accepted_at,
      listing:listings(
        id,
        title,
        address_line1,
        address_line2,
        city,
        postcode,
        property_type,
        bedrooms,
        bathrooms,
        size_sqm,
        sale_price,
        rent_price,
        intent,
        description_de,
        seller_situation,
        preferred_completion,
        status,
        currency,
        listing_media(id, url, thumb_url, is_primary, sort_order)
      ),
      owner:users!owner_id(id, full_name, email)
    `)
    .eq('id', id)
    .eq('agent_id', userId)
    .single()

  if (!assignment) {
    redirect('/agent/assignments')
  }

  const listing = assignment.listing
  const owner = assignment.owner
  const ownerFirstName = owner?.full_name?.split(' ')[0] ?? 'Owner'

  // Find primary photo
  const primaryPhoto = listing?.listing_media?.find(
    (m: any) => m.is_primary
  ) as any | undefined

  // Format price
  const price =
    listing?.intent === 'sale'
      ? listing?.sale_price
      : listing?.rent_price
  const currency = listing?.currency || 'EUR'
  const formattedPrice = price
    ? new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(fromMinorUnits(price, currency))
    : null

  const TierBadge = ({ tier }: { tier: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      advisory: { bg: '#DBEAFE', text: '#1E40AF', label: 'Advisory' },
      assisted: { bg: '#FFF5EE', text: '#8B4513', label: 'Assisted' },
      managed: { bg: '#DCFCE7', text: '#166534', label: 'Managed' },
    }
    const c = config[tier] || config.advisory
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      invited: { bg: '#FFF5EE', text: '#8B4513', label: 'Invitation Pending' },
      accepted: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
      active: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
      revoked: { bg: '#FEE2E2', text: '#991B1B', label: 'Revoked' },
      paused: { bg: '#E5E7EB', text: '#4B5563', label: 'Paused' },
    }
    const c = config[status] || config.accepted
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    )
  }

  const PermissionGrid = ({
    can_edit_listing,
    can_manage_viewings,
    can_negotiate,
    can_message_buyers,
  }: {
    can_edit_listing: boolean
    can_manage_viewings: boolean
    can_negotiate: boolean
    can_message_buyers: boolean
  }) => {
    const permissions = [
      { label: 'Edit Listing', value: can_edit_listing },
      { label: 'Manage Viewings', value: can_manage_viewings },
      { label: 'Negotiate', value: can_negotiate },
      { label: 'Message Buyers', value: can_message_buyers },
    ]

    return (
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E2E4EB]">
        {permissions.map((perm) => (
          <div key={perm.label} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{
                backgroundColor: perm.value ? '#DCFCE7' : '#F3F4F6',
                color: perm.value ? '#166534' : '#D1D5DB',
              }}
            >
              {perm.value ? (
                <Check size={12} />
              ) : (
                <X size={12} />
              )}
            </div>
            <span className="text-xs text-[#5E6278]">{perm.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Back button */}
      <Link
        href="/agent/assignments"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Briefs
      </Link>

      {/* Status banner if not invited */}
      {assignment.status !== 'invited' && (
        <div
          className="mb-6 rounded-xl p-4 border"
          style={{
            backgroundColor:
              assignment.status === 'accepted' || assignment.status === 'active'
                ? '#DCFCE7'
                : '#FEE2E2',
            borderColor:
              assignment.status === 'accepted' || assignment.status === 'active'
                ? '#BBF7D0'
                : '#FECACA',
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{
              color:
                assignment.status === 'accepted' ||
                assignment.status === 'active'
                  ? '#166534'
                  : '#991B1B',
            }}
          >
            {assignment.status === 'accepted' || assignment.status === 'active'
              ? <>
                  <Check size={16} className="inline mr-2" />
                  You've accepted this brief
                </>
              : `This brief has been ${assignment.status}`}
          </p>
        </div>
      )}

      {/* Main property card */}
      <div className="bg-surface rounded-2xl border border-[#E2E4EB] overflow-hidden mb-6">
        {/* Primary photo */}
        {primaryPhoto ? (
          <div
            className="h-64 bg-[#EDEEF2] overflow-hidden"
            style={{
              backgroundImage: `url(${primaryPhoto.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="h-64 bg-[#EDEEF2] flex items-center justify-center">
            <svg className="w-16 h-16 text-[#D9DCE4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2.5-5L12 3l6.5 4 2.5 5m0 0l-1 3h-2m2-3h-4m0 0l-1-3-6.5-4L3 7m0 0l1 3h2m-2-3h4" />
            </svg>
          </div>
        )}

        <div className="p-6">
          {/* Title and address */}
          <h1 className="text-2xl font-bold text-[#0F1117] mb-2">
            {listing?.title || `${listing?.address_line1}, ${listing?.city}`}
          </h1>
          <p className="text-[#5E6278] mb-4">
            {listing?.address_line1}
            {listing?.address_line2 && `, ${listing?.address_line2}`}
            <br />
            {listing?.postcode} {listing?.city}
          </p>

          {/* Key details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-[#E2E4EB]">
            <div>
              <p className="text-xs text-[#5E6278] mb-1">Property Type</p>
              <p className="font-semibold text-[#0F1117]">
                {listing?.property_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5E6278] mb-1">Bedrooms</p>
              <p className="font-semibold text-[#0F1117]">
                {listing?.bedrooms}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5E6278] mb-1">Bathrooms</p>
              <p className="font-semibold text-[#0F1117]">
                {listing?.bathrooms}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5E6278] mb-1">Size</p>
              <p className="font-semibold text-[#0F1117]">
                {listing?.size_sqm} m²
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <p className="text-xs text-[#5E6278] mb-1">
              {listing?.intent === 'sale' ? 'Sale Price' : 'Monthly Rent'}
            </p>
            <p className="text-3xl font-bold text-brand">
              {formattedPrice || '—'}
              {listing?.intent === 'rent' && formattedPrice && (
                <span className="text-sm font-normal text-[#5E6278]">/mo</span>
              )}
            </p>
          </div>

          {/* Description */}
          {listing?.description_de && (
            <div className="mb-6">
              <h3 className="font-semibold text-[#0F1117] mb-2">Description</h3>
              <p className="text-sm text-[#5E6278] leading-relaxed">
                {listing.description_de}
              </p>
            </div>
          )}

          {/* Seller situation and timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listing?.seller_situation && (
              <div>
                <p className="text-xs text-[#5E6278] mb-1">Seller Situation</p>
                <p className="text-sm font-medium text-[#0F1117]">
                  {listing.seller_situation}
                </p>
              </div>
            )}
            {listing?.preferred_completion && (
              <div>
                <p className="text-xs text-[#5E6278] mb-1">
                  Preferred Completion
                </p>
                <p className="text-sm font-medium text-[#0F1117]">
                  {listing.preferred_completion}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment details and owner info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Assignment details */}
        <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6">
          <h3 className="font-semibold text-[#0F1117] mb-4">Assignment Details</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#5E6278] mb-1">Service Tier</p>
              <TierBadge tier={assignment.tier} />
            </div>

            <div>
              <p className="text-xs text-[#5E6278] mb-2">Your Permissions</p>
              <PermissionGrid
                can_edit_listing={assignment.can_edit_listing}
                can_manage_viewings={assignment.can_manage_viewings}
                can_negotiate={assignment.can_negotiate}
                can_message_buyers={assignment.can_message_buyers}
              />
            </div>
          </div>
        </div>

        {/* Owner info */}
        <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6">
          <h3 className="font-semibold text-[#0F1117] mb-4">Owner</h3>
          <div>
            <p className="text-sm text-[#0F1117] font-medium mb-1">
              {ownerFirstName}
            </p>
            <p className="text-xs text-[#5E6278]">Property owner</p>
          </div>
        </div>
      </div>

      {/* Proposal form (only if invited) */}
      {assignment.status === 'invited' && (
        <ProposalForm
          assignmentId={id}
          listingIntent={listing?.intent || 'sale'}
        />
      )}
    </div>
  )
}
