'use client'

import { useState, useTransition } from 'react'
import { Check, X, Clock, Banknote, Home, User, Calendar, AlertCircle } from 'lucide-react'
import { updateOfferStatusAction } from './actions'

interface Offer {
  id: string
  listing_id: string
  hunter_id: string
  type: string | null
  amount: number | null
  currency: string
  status: string
  conditions: string | null
  finance_status: string | null
  move_in_date: string | null
  employment_type: string | null
  message: string | null
  created_at: string
  listing_title: string | null
  listing_city: string | null
  listing_postcode: string | null
  hunter_name: string | null
  hunter_email: string | null
}

type T = { [k: string]: string }

/** Safe translation lookup — never returns undefined */
function tx(t: T, key: string): string {
  return t[key] ?? key
}

interface Props {
  offers: Offer[]
  t: T
  locale: string
}

export function OffersClient({ offers, t, locale }: Props) {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

  const filtered = offers.filter(o => {
    if (filter === 'active') return ['submitted', 'under_review'].includes(o.status)
    if (filter === 'resolved') return ['accepted', 'declined', 'withdrawn', 'expired'].includes(o.status)
    return true
  })

  const activeCount = offers.filter(o => ['submitted', 'under_review'].includes(o.status)).length

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-4 mb-6">
        <FilterTab
          label={tx(t, 'filterAll')}
          count={offers.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterTab
          label={tx(t, 'filterActive')}
          count={activeCount}
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        />
        <FilterTab
          label={tx(t, 'filterResolved')}
          count={offers.length - activeCount}
          active={filter === 'resolved'}
          onClick={() => setFilter('resolved')}
        />
      </div>

      {/* Offers list */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-default p-12 text-center">
          <AlertCircle className="w-8 h-8 text-[#D9DCE4] mx-auto mb-3" />
          <p className="text-text-secondary font-medium">{tx(t, 'noOffers')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(offer => (
            <OfferCard key={offer.id} offer={offer} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterTab({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-[#0F1117] text-white'
          : 'bg-transparent text-text-secondary hover:bg-[#F1F3F5]'
      }`}
    >
      {label} <span className="ml-1 opacity-60">{count}</span>
    </button>
  )
}

function OfferCard({ offer, t, locale }: { offer: Offer; t: T; locale: string }) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(offer.status)

  const isActionable = ['submitted', 'under_review'].includes(localStatus)
  const amount = offer.amount
    ? new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
        style: 'currency',
        currency: offer.currency || 'EUR',
        maximumFractionDigits: 0,
      }).format(offer.amount / 100)
    : null

  const dateStr = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(offer.created_at))

  function handleAction(status: 'accepted' | 'declined') {
    startTransition(async () => {
      const result = await updateOfferStatusAction(offer.id, status)
      if (result.success) {
        setLocalStatus(status)
      }
    })
  }

  return (
    <div className={`bg-surface rounded-2xl border border-border-default overflow-hidden ${isPending ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
            <Banknote className="w-4 h-4 text-[#D4764E]" />
          </div>
          <div>
            <p className="font-bold text-text-primary text-sm">
              {offer.listing_title ?? offer.listing_postcode}
            </p>
            <p className="text-xs text-text-secondary">
              {offer.listing_postcode} {offer.listing_city}
            </p>
          </div>
        </div>
        <OfferStatusBadge status={localStatus} t={t} />
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {amount && (
            <Detail icon={Banknote} label={tx(t, 'amount')} value={amount} highlight />
          )}
          <Detail
            icon={User}
            label={tx(t, 'from')}
            value={offer.hunter_name ?? offer.hunter_email ?? '—'}
          />
          <Detail icon={Clock} label={tx(t, 'submitted')} value={dateStr} />
          {offer.type && (
            <Detail
              icon={Home}
              label={tx(t, 'type')}
              value={offer.type === 'sale_offer' ? tx(t, 'typeSale') : tx(t, 'typeRental')}
            />
          )}
        </div>

        {/* Finance & conditions */}
        {offer.finance_status && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-1">{tx(t, 'finance')}</p>
            <FinanceBadge status={offer.finance_status} t={t} />
          </div>
        )}

        {offer.conditions && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-1">{tx(t, 'conditions')}</p>
            <p className="text-sm text-text-primary">{offer.conditions}</p>
          </div>
        )}

        {offer.message && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-1">{tx(t, 'message')}</p>
            <p className="text-sm text-text-primary bg-[#FAFBFC] rounded-lg p-3 border border-border-default">
              {offer.message}
            </p>
          </div>
        )}

        {/* Rental-specific fields */}
        {offer.move_in_date && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-1">{tx(t, 'moveInDate')}</p>
            <p className="text-sm text-text-primary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-secondary" />
              {new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
                day: '2-digit', month: 'long', year: 'numeric',
              }).format(new Date(offer.move_in_date))}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isActionable && (
        <div className="px-5 py-3 border-t border-border-default bg-[#FAFBFC] flex gap-3">
          <button
            onClick={() => handleAction('accepted')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            {tx(t, 'accept')}
          </button>
          <button
            onClick={() => handleAction('declined')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            {tx(t, 'decline')}
          </button>
        </div>
      )}
    </div>
  )
}

function Detail({ icon: Icon, label, value, highlight }: {
  icon: React.ElementType; label: string; value: string; highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-secondary mb-0.5 flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p className={`text-sm font-semibold ${highlight ? 'text-[#D4764E]' : 'text-text-primary'}`}>
        {value}
      </p>
    </div>
  )
}

function OfferStatusBadge({ status, t }: { status: string; t: T }) {
  const styles: Record<string, string> = {
    submitted: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-500',
    expired: 'bg-gray-100 text-gray-400',
  }

  const labels: Record<string, string> = {
    submitted: tx(t, 'statusSubmitted'),
    under_review: tx(t, 'statusUnderReview'),
    accepted: tx(t, 'statusAccepted'),
    declined: tx(t, 'statusDeclined'),
    withdrawn: tx(t, 'statusWithdrawn'),
    expired: tx(t, 'statusExpired'),
  }

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[status] ?? styles.submitted}`}>
      {labels[status] ?? status}
    </span>
  )
}

function FinanceBadge({ status, t }: { status: string; t: T }) {
  const styles: Record<string, string> = {
    cash: 'bg-green-100 text-green-700',
    mortgage_approved: 'bg-green-100 text-green-700',
    mortgage_pending: 'bg-yellow-100 text-yellow-700',
    not_specified: 'bg-gray-100 text-gray-500',
  }

  const labels: Record<string, string> = {
    cash: tx(t, 'financeCash'),
    mortgage_approved: tx(t, 'financeMortgageApproved'),
    mortgage_pending: tx(t, 'financeMortgagePending'),
    not_specified: tx(t, 'financeNotSpecified'),
  }

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? styles.not_specified}`}>
      {labels[status] ?? status}
    </span>
  )
}
