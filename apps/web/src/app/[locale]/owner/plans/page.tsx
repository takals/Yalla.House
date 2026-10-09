import { createClient } from '@/lib/supabase/server'
import { Check } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CheckoutButton } from './checkout-button'
import { countryFromLocale } from '@/lib/detect-country'

interface Props {
  searchParams: Promise<{ listing_id?: string }>
}

export default async function PlansPage({ searchParams }: Props) {
  const { listing_id } = await searchParams
  const t = await getTranslations('ownerPlans')
  const locale = await getLocale()
  const countryCode = countryFromLocale(locale)
  const supabase = await createClient()
  // Preview phase: no auth gate. Plans page is publicly browsable.

  const { data: plans } = await (supabase.from('subscription_plans') as any)
    .select('id, name, name_de, amount, currency, features, stripe_price_id, period')
    .eq('target_role', 'owner')
    .eq('country_code', countryCode)
    .eq('is_active', true)
    .order('amount') as { data: Plan[] | null }

  return (
    <div className="max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-text-secondary">
            {t('pageDescription')}
          </p>
        </div>

        {/* No plans for this country yet. subscription_plans only had DE rows on
            13 Sep 2026; the UK page rendered an empty grid with no explanation.
            Say so honestly and keep the owner moving — the listing itself is free
            to create and the price is shown before anything is charged. */}
        {(plans ?? []).length === 0 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-border-default bg-surface p-8 text-center">
            <h2 className="text-lg font-bold text-text-primary">{t('noPlansTitle')}</h2>
            <p className="mt-2 text-sm text-text-secondary">{t('noPlansBody')}</p>
            <Link
              href="/owner/workspace"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t('noPlansCta')} →
            </Link>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(plans ?? []).map((plan, index) => {
            const isRecommended = index === 1
            const features = plan.features as string[]
            const priceDisplay = (plan.amount / 100).toLocaleString('de-DE', {
              style: 'currency',
              currency: plan.currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })
            const hasStripePrice = Boolean(plan.stripe_price_id)

            return (
              <div
                key={plan.id}
                className={`bg-surface rounded-card p-6 flex flex-col relative ${
                  isRecommended ? 'ring-2 ring-brand shadow-md' : 'border border-[#E4E6EF]'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-text-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {t('badgeRecommended')}
                  </span>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold">{plan.name_de ?? plan.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{priceDisplay}</span>
                    <span className="text-sm text-text-secondary">{t('labelOneTime')}</span>
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-[#3F4254]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {hasStripePrice ? (
                  <CheckoutButton planId={plan.id} listingId={listing_id} />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-xl font-bold text-sm bg-[#E4E6EF] text-text-secondary cursor-not-allowed"
                  >
                    {t('buttonSoonAvailable')}
                  </button>
                )}
              </div>
            )
          })}
        </div>

    </div>
  )
}

interface Plan {
  id: string
  name: string
  name_de: string | null
  amount: number
  currency: string
  features: unknown
  stripe_price_id: string | null
  period: string
}
