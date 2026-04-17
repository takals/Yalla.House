import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Users, LayoutDashboard, Star } from 'lucide-react'
import { ProviderJoinForm } from '@/components/provider-join-form'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('providerOnboarding')

  return {
    title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
    description: t('heroSubtitle'),
    openGraph: {
      type: 'website',
      title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
      description: t('heroSubtitle'),
      url: locale === 'en' ? 'https://yalla.house/en/providers/join' : 'https://yalla.house/providers/join',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

export default async function ProviderJoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('providerOnboarding')
  const isEN = locale === 'en'

  // Fetch categories for the form dropdown
  const supabase = await createClient()
  const { data: rawCategories } = await supabase
    .from('service_categories' as 'users')
    .select('id, slug, name_en, name_de')
    .order('sort_order')

  const cats = (rawCategories ?? []) as unknown as { id: string; slug: string; name_en: string; name_de: string }[]
  const categoryOptions = cats.map(c => ({
    value: c.id,
    label: isEN ? c.name_en : c.name_de,
  }))

  // Steps
  const steps = [
    { num: '01', title: t('step1Title'), body: t('step1Body') },
    { num: '02', title: t('step2Title'), body: t('step2Body') },
    { num: '03', title: t('step3Title'), body: t('step3Body') },
  ]

  // Benefits
  const benefits = [
    { icon: <CheckCircle2 size={22} />, title: t('benefit1Title'), body: t('benefit1Body') },
    { icon: <Users size={22} />, title: t('benefit2Title'), body: t('benefit2Body') },
    { icon: <LayoutDashboard size={22} />, title: t('benefit3Title'), body: t('benefit3Body') },
    { icon: <Star size={22} />, title: t('benefit4Title'), body: t('benefit4Body') },
  ]

  // Form translations for client component
  const formTranslations = {
    formTitle: t('formTitle'),
    formBusinessName: t('formBusinessName'),
    formEmail: t('formEmail'),
    formPhone: t('formPhone'),
    formWebsite: t('formWebsite'),
    formCategory: t('formCategory'),
    formAreas: t('formAreas'),
    formAccreditation: t('formAccreditation'),
    formAccreditationRef: t('formAccreditationRef'),
    formSubmit: t('formSubmit'),
    formSubmitting: t('formSubmitting'),
    successTitle: t('successTitle'),
    successBody: t('successBody'),
  }

  return (
    <main className="bg-page-dark min-h-screen">
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-display text-white">
            {t('heroTitle')}{' '}
            <span className="text-brand">{t('heroTitleAccent')}</span>
          </h1>
          <p className="mt-6 text-lede text-text-on-dark-secondary font-normal max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(step => (
              <div
                key={step.num}
                className="bg-surface-dark rounded-card-dark p-6 group hover:bg-card-dark transition-[background-color] duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center">
                    <span className="text-brand font-bold text-sm">{step.num}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS + FORM ────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <div>
            <h2 className="text-title-2 text-white mb-8">{t('benefitsTitle')}</h2>
            <div className="space-y-6">
              {benefits.map(b => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">{b.title}</h3>
                    <p className="text-sm text-text-on-dark-secondary leading-relaxed">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 md:p-8">
            <ProviderJoinForm
              categories={categoryOptions}
              translations={formTranslations}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
