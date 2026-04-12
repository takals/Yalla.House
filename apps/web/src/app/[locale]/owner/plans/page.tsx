import { createClient } from '@/lib/supabase/server'
import { Check } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { CheckoutButton } from './checkout-button'

interface Props {
  searchParams: Promise<{ listing_id?: string }>
}

export default async function PlansPage({ searchParams }: Props) {
  const { listing_id } = await searchParams
  const t = await getTranslations('ownerPlans')
  const supabase = await createClient()
  // Preview phase: no auth gate. Plans page is publicly browsable.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plans } = await (supabase.from('subscription_plans') as any)
    .select('id, name, name_de, amount, currency, features, stripe_price_id, period')
    .eq('target_role', 'owner')
    .eq('country_code', 'DE')
    .eq('is_active', true)
    .order('amount') as { data: Plan[] | null }

  return (
    <div className="max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-[#5E6278]">
            {t('pageDescription')}
          </p>
        </div>

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
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-[#0F1117] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {t('badgeRecommended')}
                  </span>
                )}

                <div className="mb-5">
                  <h2 className="text-xl font-bold">{plan.name_de ?? plan.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{priceDisplay}</span>
                    <span className="text-sm text-[#5E6278]">{t('labelOneTime')}</span>
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
                    className="w-full py-3 rounded-xl font-bold text-sm bg-[#E4E6EF] text-[#5E6278] cursor-not-allowed"
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
