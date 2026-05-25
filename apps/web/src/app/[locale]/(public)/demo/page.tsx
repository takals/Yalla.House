import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DemoRequestForm } from '@/components/demo-request-form'

export const metadata: Metadata = {
  title: 'Demo anfragen — Yalla.House',
  description: 'Vereinbaren Sie ein 20-minütiges Gespräch mit unserem Team.',
}

const locales = ['de', 'en'] as const
type Locale = (typeof locales)[number]

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = (locales as readonly string[]).includes(raw) ? (raw as Locale) : 'de'

  const t = await getTranslations('demoForm')

  const translations = {
    formTitle: t('formTitle'),
    firstName: t('firstName'),
    lastName: t('lastName'),
    email: t('email'),
    phone: t('phone'),
    company: t('company'),
    role: t('role'),
    roleOwner: t('roleOwner'),
    roleHunter: t('roleHunter'),
    roleAgent: t('roleAgent'),
    roleOther: t('roleOther'),
    message: t('message'),
    messagePlaceholder: t('messagePlaceholder'),
    submit: t('submit'),
    submitting: t('submitting'),
    successTitle: t('successTitle'),
    successBody: t('successBody'),
    errorInvalid: t('errorInvalid'),
    errorGeneric: t('errorGeneric'),
    privacyNote: t('privacyNote'),
  }

  return (
    <main className="min-h-screen bg-page-dark text-white">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('pageHeading')}</h1>
          <p className="text-base text-text-on-dark-secondary">{t('pageLead')}</p>
        </div>

        <div className="bg-surface-dark border border-white/[0.08] rounded-card-dark p-6 sm:p-8">
          <DemoRequestForm locale={locale} translations={translations} />
        </div>
      </div>
    </main>
  )
}
