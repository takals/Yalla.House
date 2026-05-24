import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { HunterAgentSearchClient } from './hunter-agent-search-client'

export default async function HunterAgentSearchPage() {
  const t = await getTranslations('hunterAgentSearch')

  const translationKeys = [
    'pageTitle', 'pageDescription', 'searchPlaceholder', 'searchButton',
    'searching', 'resultCount', 'resultCountPlural', 'noResults',
    'noResultsHint', 'expandArea', 'expandWide',
    'invalidPostcode', 'invalidPostcodeHint',
    'enterPostcodePrompt', 'enterPostcodeHint',
    'verifiedBadge', 'matchScoreLabel', 'serviceTypesLabel',
    'coverageLabel', 'phoneLabel', 'emailLabel',
    'websiteLabel', 'addressLabel', 'postcodeLabel', 'sourceLabel',
    'verifiedLabel', 'selectButton', 'deselectButton',
    'selectedCount', 'connectButton',
    'selectAll', 'deselectAll', 'viewProfile',
    'radiusDistrict', 'radiusArea', 'radiusWide',
    'dataNote', 'back', 'errorGeneric', 'tryAgain',
    'loadingAgents', 'phoneAvailable', 'emailAvailable',
  ] as const
  const translations: Record<string, string> = {}
  for (const key of translationKeys) {
    translations[key] = t(key)
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/hunter/agents"
          className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} />
          {t('back')}
        </Link>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight mb-1">
          {t('pageTitle')}
        </h1>
        <p className="text-sm text-text-secondary">{t('pageDescription')}</p>
      </div>

      {/* Client Component — handles search, results, selection */}
      <HunterAgentSearchClient translations={translations} />
    </div>
  )
}
