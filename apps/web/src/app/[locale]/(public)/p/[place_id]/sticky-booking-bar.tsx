'use client'

import { useState } from 'react'
import { Calendar, Eye } from 'lucide-react'

interface Props {
  status: string
  slotCount: number
  listingId: string
  locale: string
}

export function StickyBookingBar({ status, slotCount, listingId, locale }: Props) {
  const isDE = locale === 'de'
  const isUnderOffer = status === 'under_offer'

  function scrollToBooking() {
    // Try to scroll to booking slots first, fall back to contact form
    const bookingSection = document.querySelector('[data-booking-slots]')
      ?? document.querySelector('[data-contact-card]')
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-md border-b border-[#E2E4EB] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: status */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Live dot */}
          {!isUnderOffer && (
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          )}
          {isUnderOffer && (
            <span className="flex h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-[#0F1117] uppercase tracking-wide">
            {isUnderOffer
              ? (isDE ? 'Unter Angebot' : 'Under Offer')
              : (isDE ? 'Live' : 'Live')
            }
          </span>
          {slotCount > 0 && (
            <span className="text-xs text-[#5E6278] hidden sm:inline">
              {slotCount} {isDE ? (slotCount === 1 ? 'Termin verfügbar' : 'Termine verfügbar') : (slotCount === 1 ? 'slot available' : 'slots available')}
            </span>
          )}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2">
          {!isUnderOffer && (
            <button
              onClick={scrollToBooking}
              className="flex items-center gap-2 bg-[#D4764E] hover:bg-[#BF6840] text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">
                {isDE ? 'Besichtigung buchen' : 'Book a Viewing'}
              </span>
              <span className="sm:hidden">
                {isDE ? 'Buchen' : 'Book'}
              </span>
            </button>
          )}
          {isUnderOffer && (
            <button
              onClick={scrollToBooking}
              className="flex items-center gap-2 bg-[#0F1117] hover:bg-[#1C1F2E] text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">
                {isDE ? 'Interesse anmelden' : 'Register Interest'}
              </span>
              <span className="sm:hidden">
                {isDE ? 'Interesse' : 'Interest'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
