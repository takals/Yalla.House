'use client'

import { useTranslations } from 'next-intl'
import { Calendar, Eye } from 'lucide-react'

interface Props {
  status: string
  slotCount: number
  listingId: string
}

export function StickyBookingBar({ status, slotCount, listingId }: Props) {
  const t = useTranslations('listingPage')
  const isUnderOffer = status === 'under_offer'

  function scrollToBooking() {
    const bookingSection = document.querySelector('[data-booking-slots]')
      ?? document.querySelector('[data-contact-card]')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-md border-b border-border-default shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: status */}
        <div className="flex items-center gap-3 min-w-0">
          {!isUnderOffer && (
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          {isUnderOffer && (
            <span className="flex h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
            {isUnderOffer ? t('barUnderOffer') : t('barLive')}
          </span>
          {slotCount > 0 && (
            <span className="text-xs text-text-secondary hidden sm:inline">
              {t('barSlotAvailable', { count: slotCount })}
            </span>
          )}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2">
          {!isUnderOffer && (
            <button
              onClick={scrollToBooking}
              className="flex items-center gap-2 bg-[#D4764E] hover:bg-brand-hover text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">{t('barBookViewing')}</span>
              <span className="sm:hidden">{t('barBookShort')}</span>
            </button>
          )}
          {isUnderOffer && (
            <button
              onClick={scrollToBooking}
              className="flex items-center gap-2 bg-[#0F1117] hover:bg-[#1C1F2E] text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">{t('barRegisterInterest')}</span>
              <span className="sm:hidden">{t('barInterestShort')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
