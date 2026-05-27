'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, X, ChevronRight } from 'lucide-react'

interface ActionHint {
  text: string
  action?: { label: string; href: string }
}

interface Props {
  /** Unique key for this page — used to persist dismissal */
  pageKey: string
  /** Hint title */
  title: string
  /** List of action hints for this page */
  hints: ActionHint[]
  /** Dismiss button label */
  dismissLabel?: string
}

/**
 * Dismissible onboarding banner that shows contextual action hints.
 * Persists dismissal per page via localStorage.
 */
export function ActionHintBanner({ pageKey, title, hints, dismissLabel }: Props) {
  const storageKey = `yalla_hint_dismissed_${pageKey}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show if not yet dismissed
    try {
      if (!localStorage.getItem(storageKey)) {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [storageKey])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(storageKey, '1') } catch {}
  }

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-brand/10 via-brand/5 to-transparent border border-brand/20 rounded-xl p-4 mb-6 relative animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-brand/10 text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={16} className="text-brand" />
        </div>
        <p className="text-sm font-bold text-text-primary">{title}</p>
      </div>

      {/* Hints list */}
      <div className="space-y-2 ml-10">
        {hints.map((hint, i) => (
          <div key={i} className="flex items-start gap-2">
            <ChevronRight size={14} className="text-brand flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary leading-snug">
              {hint.text}
              {hint.action && (
                <a
                  href={hint.action.href}
                  className="ml-1 text-brand hover:text-brand-hover font-semibold inline-flex items-center gap-0.5 transition-colors"
                >
                  {hint.action.label}
                  <ChevronRight size={12} />
                </a>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Dismiss text */}
      <button
        onClick={dismiss}
        className="mt-3 ml-10 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        {dismissLabel ?? 'Got it, don’t show again'}
      </button>
    </div>
  )
}
