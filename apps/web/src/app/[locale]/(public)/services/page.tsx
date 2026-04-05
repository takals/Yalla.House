import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface Addon {
  icon: string
  title: string
  description: string
  price: string
  badge?: string
}

export default async function ServicesPage() {
  const t = await getTranslations('services')

  return (
    <main className="bg-[#EDEEF2]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-5">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-[#656565] leading-relaxed max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── ADD-ON SERVICES GRID ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E2E4EB] rounded-full px-3.5 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-[#999]">
              {t('addonsTag')}
            </div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">
              {t('addonsTitle')}
            </h2>
            <p className="text-lg text-[#656565] leading-relaxed">
              {t('addonsSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(t.raw('addons') as Addon[]).map((addon: Addon, i: number) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] shadow-[0_2px_8px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] hover:translate-y-[-3px] transition-all p-6">
                <div className="text-4xl mb-4">{addon.icon}</div>
                <h3 className="font-bold text-[#0F1117] mb-2 text-base">
                  {addon.title}
                </h3>
                <p className="text-sm text-[#656565] leading-snug mb-4">
                  {addon.description}
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[#FFD400] text-lg">
                    {addon.price}
                  </span>
                  {addon.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF8D6] text-[#7A5F00]">
                      {addon.badge}
                    </span>
                  )}
                </div>
                <Link
                  href="#"
                  className="block mt-4 text-sm font-semibold text-[#FFD400] hover:text-[#E6C200] transition-colors"
                >
                  {t('addToListing')} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-y border-[#E2E4EB]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#EDEEF2] border border-[#E2E4EB] rounded-full px-3.5 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-[#999]">
              {t('pricingTag')}
            </div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">
              {t('pricingTitle')}
            </h2>
            <p className="text-lg text-[#656565] leading-relaxed">
              {t('pricingSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basis */}
            <div className="bg-white rounded-[20px] border border-[#E2E4EB] shadow-[0_2px_8px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] hover:translate-y-[-3px] transition-all p-8">
              <h3 className="font-bold text-xl text-[#0F1117] mb-2">
                {t('plans.basis.name')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#0F1117]">
                  {t('plans.basis.price')}
                </span>
                <span className="text-sm text-[#656565] ml-2">
                  {t('plans.basis.period')}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {(t.raw('plans.basis.features') as string[]).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#656565]">
                    <div className="w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#059669] font-bold text-xs">✓</span>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/owner/plans"
                className="block w-full text-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold text-sm py-3 rounded-xl transition-colors"
              >
                {t('plans.basis.cta')} →
              </Link>
            </div>

            {/* Professional — Featured */}
            <div className="bg-white rounded-[20px] border-2 border-[#FFD400] shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,.11),0_4px_12px_rgba(0,0,0,.06)] hover:translate-y-[-3px] transition-all p-8 relative lg:scale-105 lg:translate-y-[-1rem]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#FFF8D6] text-[#7A5F00] text-xs font-bold px-3 py-1 rounded-full">
                  {t('plans.professional.badge')}
                </span>
              </div>
              <h3 className="font-bold text-xl text-[#0F1117] mb-2 pt-4">
                {t('plans.professional.name')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#0F1117]">
                  {t('plans.professional.price')}
                </span>
                <span className="text-sm text-[#656565] ml-2">
                  {t('plans.professional.period')}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {(t.raw('plans.professional.features') as string[]).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#656565]">
                    <div className="w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#059669] font-bold text-xs">✓</span>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/owner/plans"
                className="block w-full text-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold text-sm py-3 rounded-xl transition-colors"
              >
                {t('plans.professional.cta')} →
              </Link>
            </div>

            {/* Komplett */}
            <div className="bg-white rounded-[20px] border border-[#E2E4EB] shadow-[0_2px_8px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] hover:translate-y-[-3px] transition-all p-8">
              <h3 className="font-bold text-xl text-[#0F1117] mb-2">
                {t('plans.komplett.name')}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#0F1117]">
                  {t('plans.komplett.price')}
                </span>
                <span className="text-sm text-[#656565] ml-2">
                  {t('plans.komplett.period')}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {(t.raw('plans.komplett.features') as string[]).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#656565]">
                    <div className="w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#059669] font-bold text-xs">✓</span>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/owner/plans"
                className="block w-full text-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold text-sm py-3 rounded-xl transition-colors"
              >
                {t('plans.komplett.cta')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON STATS ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#EDEEF2]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-[#E2E4EB] rounded-full px-3.5 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-[#999]">
              {t('comparisonTag')}
            </div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">
              {t('comparisonTitle')}
            </h2>
            <p className="text-lg text-[#656565] leading-relaxed">
              {t('comparisonSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Traditional */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-[0_2px_8px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] p-6">
              <div className="text-sm font-semibold text-[#656565] mb-3">
                {t('comparison.traditional')}
              </div>
              <div className="text-3xl font-extrabold text-[#DC2626] mb-2">
                {t('comparison.traditionalPrice')}
              </div>
              <div className="text-sm text-[#999]">
                {t('comparison.traditionalNote')}
              </div>
            </div>

            {/* Yalla */}
            <div className="bg-white rounded-2xl border-2 border-[#FFD400] shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFF8D6] px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-[#7A5F00]">Yalla.House</span>
              </div>
              <div className="text-sm font-semibold text-[#656565] mb-3 pt-2">
                {t('comparison.yalla')}
              </div>
              <div className="text-3xl font-extrabold text-[#FFD400] mb-2">
                {t('comparison.yallaPrice')}
              </div>
              <div className="text-sm text-[#999]">
                {t('comparison.yallaNote')}
              </div>
            </div>

            {/* Savings */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-[0_2px_8px_rgba(0,0,0,.08),0_1px_3px_rgba(0,0,0,.05)] p-6">
              <div className="text-sm font-semibold text-[#656565] mb-3">
                {t('comparison.savings')}
              </div>
              <div className="text-3xl font-extrabold text-[#16A34A] mb-2">
                {t('comparison.savingsPrice')}
              </div>
              <div className="text-sm text-[#999]">
                {t('comparison.savingsNote')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at center, #FFD400 0%, transparent 70%)',
        }}></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-white mb-4">
            {t('ctaBandTitle')}
          </h2>
          <p className="text-lg text-[rgba(255,255,255,.62)] leading-relaxed max-w-2xl mx-auto mb-8">
            {t('ctaBandSubtitle')}
          </p>
          <Link
            href="/owner/new"
            className="inline-block bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            {t('ctaBandCta')} →
          </Link>
        </div>
      </section>

    </main>
  )
}
