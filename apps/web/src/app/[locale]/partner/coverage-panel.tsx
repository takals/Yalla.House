'use client'

import { useState, useTransition } from 'react'
import { Check, MapPin } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { saveCoverageAction } from './actions'

interface Category {
  slug: string
  label: string
}

interface Props {
  categories: Category[]
  initialSelected: string[]
  initialPostcodes: string
  labels: Record<string, string>
}

/**
 * The two fields that decide whether a provider is sent work, edited in place.
 *
 * Replaces the /partner/profile page the dashboard linked to three times and
 * which never existed. Guests can fill this in; the sign-in modal appears when
 * they save.
 */
export function CoveragePanel({ categories, initialSelected, initialPostcodes, labels }: Props) {
  const { handleAuthRequired } = useAuthAction()
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [postcodes, setPostcodes] = useState(initialPostcodes)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function toggle(slug: string) {
    setSaved(false)
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveCoverageAction({ categories: selected, postcodes })
      if (handleAuthRequired(result)) return
      if (result && 'error' in result) {
        setError(result.error)
        return
      }
      setSaved(true)
    })
  }

  return (
    <div className="bg-surface rounded-2xl border border-border-default p-6 mb-8">
      <h2 className="text-lg font-bold mb-1">{labels.coverageTitle}</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-2xl">{labels.coverageHint}</p>

      {/* Services offered */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-text-secondary block mb-2.5">
          {labels.categoriesLabel}
        </span>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const on = selected.includes(cat.slug)
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggle(cat.slug)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                  on
                    ? 'bg-brand text-white border-brand'
                    : 'bg-bg text-text-secondary border-border-default hover:bg-hover-muted'
                }`}
              >
                {on && <Check size={14} />}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Coverage areas */}
      <div className="mb-6 max-w-md">
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary">{labels.postcodesLabel}</span>
          <div className="relative mt-1.5">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              value={postcodes}
              onChange={e => { setPostcodes(e.target.value); setSaved(false) }}
              placeholder={labels.postcodesPlaceholder}
              className="w-full border border-border-default rounded-lg pl-9 pr-3 py-2.5 text-sm bg-bg focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </label>
        <p className="text-xs text-text-muted mt-1.5">{labels.postcodesHint}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? labels.saving : labels.save}
        </button>
        {saved && !isPending && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
            <Check size={15} /> {labels.saved}
          </span>
        )}
        {error && (
          <span className="text-sm text-red-600" role="alert">{error}</span>
        )}
      </div>
    </div>
  )
}
