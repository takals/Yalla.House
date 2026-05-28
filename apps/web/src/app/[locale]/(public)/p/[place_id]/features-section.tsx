'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, X, Loader2, Sparkles } from 'lucide-react'
import { toggleListingTagAction } from './actions'

interface Tag {
  id: string
  slug: string
  category: string
  label_en: string
  label_de: string
  icon: string
  active: boolean
}

interface Props {
  listingId: string
  tags: Tag[]
  locale: string
  isOwner: boolean
  translations: Record<string, string>
}

const CATEGORY_ORDER = [
  'outdoor', 'building', 'parking', 'energy', 'lifestyle',
  'community', 'safety', 'accessibility', 'pets', 'rental',
]

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Property features displayed as toggle pills.
 * Owners can toggle features on/off; visitors see active features only.
 */
export function FeaturesSection({ listingId, tags, locale, isOwner, translations: t }: Props) {
  const [tagState, setTagState] = useState<Record<string, boolean>>(() => {
    const state: Record<string, boolean> = {}
    for (const tag of tags) state[tag.id] = tag.active
    return state
  })
  const [pending, startTransition] = useTransition()
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const activeTags = tags.filter(tag => tagState[tag.id])
  const inactiveTags = tags.filter(tag => !tagState[tag.id])

  // Group by category for owner view
  const groupedTags = CATEGORY_ORDER.reduce<Record<string, Tag[]>>((acc, cat) => {
    const catTags = tags.filter(tag => tag.category === cat)
    if (catTags.length > 0) acc[cat] = catTags
    return acc
  }, {})

  function handleToggle(tagId: string, newState: boolean) {
    setTogglingId(tagId)
    setTagState(prev => ({ ...prev, [tagId]: newState }))

    startTransition(async () => {
      const result = await toggleListingTagAction(listingId, tagId, newState)
      if ('error' in result) {
        // Revert on error
        setTagState(prev => ({ ...prev, [tagId]: !newState }))
      }
      setTogglingId(null)
    })
  }

  const label = (tag: Tag) => locale === 'de' ? tag.label_de : tag.label_en

  // ── Public view: just show active tags as pills ──
  if (!isOwner) {
    if (activeTags.length === 0) return null
    return (
      <div className="flex flex-wrap gap-2">
        {activeTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-800 text-xs font-semibold rounded-full border border-green-200"
          >
            <Check size={12} />
            {label(tag)}
          </span>
        ))}
      </div>
    )
  }

  // ── Owner view: toggle pills grouped by category ──
  return (
    <div className="space-y-4">
      {/* Active tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleToggle(tag.id, false)}
              disabled={pending && togglingId === tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-800 text-xs font-semibold rounded-full border border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors group disabled:opacity-50"
            >
              {pending && togglingId === tag.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <Check size={12} className="group-hover:hidden" />
                  <X size={12} className="hidden group-hover:block" />
                </>
              )}
              {label(tag)}
            </button>
          ))}
        </div>
      )}

      {/* Add features button / expanded list */}
      {!showAll ? (
        <button
          onClick={() => setShowAll(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand/10 text-brand text-xs font-bold rounded-lg hover:bg-brand/20 transition-colors"
        >
          <Plus size={14} />
          {tr(t, 'featuresAddMore')} ({inactiveTags.length})
        </button>
      ) : (
        <div className="space-y-4 bg-bg rounded-xl border border-border-default p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles size={12} className="text-brand" />
              {tr(t, 'featuresAvailable')}
            </p>
            <button
              onClick={() => setShowAll(false)}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              {tr(t, 'featuresCollapse')}
            </button>
          </div>
          {CATEGORY_ORDER.map(cat => {
            const catTags = groupedTags[cat]
            if (!catTags) return null
            const catInactive = catTags.filter(tag => !tagState[tag.id])
            if (catInactive.length === 0) return null
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-text-secondary mb-2 capitalize">
                  {tr(t, `featuresCat_${cat}`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {catInactive.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleToggle(tag.id, true)}
                      disabled={pending && togglingId === tag.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-secondary text-xs font-medium rounded-full border border-border-default hover:bg-brand/10 hover:text-brand hover:border-brand/30 transition-colors disabled:opacity-50"
                    >
                      {pending && togglingId === tag.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      {label(tag)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
