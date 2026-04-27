'use client'

import { useTranslations } from 'next-intl'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('hunterError')

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface rounded-card p-10 text-center max-w-sm">
        <p className="font-bold mb-2">{t('title')}</p>
        <p className="text-sm text-text-secondary mb-4">{t('description')}</p>
        <button onClick={reset} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}
