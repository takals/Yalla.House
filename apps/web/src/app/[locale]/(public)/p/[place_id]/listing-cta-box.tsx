'use client'

import { Calendar, MessageCircle, Shield, Lock } from 'lucide-react'

interface Props {
  listingId: string
  placeId: string
  slotCount: number
  status: string
  salePrice: string | null
  rentPrice: string | null
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Top-right CTA box — the main conversion element for home hunters.
 * Shows price, Book a Viewing + Message Owner buttons, and slot availability.
 */
export function ListingCtaBox({
  listingId,
  placeId,
  slotCount,
  status,
  salePrice,
  rentPrice,
  translations: t,
}: Props) {
  const isUnderOffer = status === 'under_offer'

  // Both CTAs scroll, signed in or not. Sending someone to a login screen
  // before they've seen the calendar loses the page and the intent with it —
  // they pick a slot first, and the sign-in modal appears when they confirm.
  function handleBookViewing() {
    const target = document.querySelector('[data-booking-slots]')
      ?? document.querySelector('[data-contact-card]')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function handleMessageOwner() {
    const target = document.querySelector('[data-contact-card]')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-default shadow-lg p-6 space-y-4">
      {/* Price */}
      <div>
        {salePrice && (
          <p className="text-2xl font-extrabold text-text-primary">{salePrice}</p>
        )}
        {rentPrice && (
          <p className="text-2xl font-extrabold text-text-primary">
            {rentPrice} <span className="text-sm font-medium text-text-secondary">/ {tr(t, 'perMonth')}</span>
          </p>
        )}
      </div>

      {/* Slot availability indicator */}
      {!isUnderOffer && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-text-secondary">
            {slotCount > 0
              ? tr(t, 'ctaSlotsAvailable').replace('{count}', String(slotCount))
              : tr(t, 'ctaNoSlots')}
          </span>
        </div>
      )}

      {isUnderOffer && (
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-amber-700">{tr(t, 'barUnderOffer')}</span>
        </div>
      )}

      {/* Primary CTA: Book a Viewing */}
      {!isUnderOffer && (
        <button
          onClick={handleBookViewing}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          <Calendar size={16} />
          {tr(t, 'ctaBookViewing')}
        </button>
      )}

      {/* Secondary CTA: Message Owner */}
      <button
        onClick={handleMessageOwner}
        className="w-full flex items-center justify-center gap-2 bg-bg hover:bg-hover-muted text-text-primary font-semibold py-3 rounded-xl transition-colors text-sm border border-border-default"
      >
        <MessageCircle size={16} />
        {tr(t, 'ctaMessageOwner')}
      </button>

      {/* Trust signals — in-app messaging */}
      <div className="pt-3 border-t border-border-default space-y-2">
        <div className="flex items-start gap-2">
          <Lock size={13} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {tr(t, 'contactInAppOnly')}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Shield size={13} className="text-text-secondary mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {tr(t, 'contactPrivacy')}
          </p>
        </div>
      </div>
    </div>
  )
}
