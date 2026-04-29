'use client'

import { ReactNode } from 'react'

/**
 * Wrapper for demo/example content shown to guests and new users.
 * Provides a consistent "guided demo" treatment:
 * - Muted opacity
 * - "Example" badge
 * - Optional helper text
 * - Dashed border option
 */
interface DemoSectionProps {
  children: ReactNode
  /** Badge text, e.g. "Example" or "Demo" */
  badge?: string
  /** Helper text below the badge explaining what the user sees */
  hint?: string
  /** Use dashed border instead of solid */
  dashed?: boolean
  /** Additional CSS classes */
  className?: string
}

export function DemoSection({ children, badge, hint, dashed, className = '' }: DemoSectionProps) {
  return (
    <div
      className={[
        'relative rounded-xl overflow-hidden',
        dashed ? 'border-2 border-dashed border-brand/20' : 'border border-border-default',
        className,
      ].join(' ')}
    >
      {/* Badge + hint bar */}
      {(badge || hint) && (
        <div className="bg-gradient-to-r from-brand/[0.06] to-transparent px-4 py-2.5 flex items-center gap-3 border-b border-brand/10">
          {badge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-1 rounded-full whitespace-nowrap">
              {badge}
            </span>
          )}
          {hint && (
            <span className="text-xs text-text-secondary leading-snug">{hint}</span>
          )}
        </div>
      )}

      {/* Muted demo content */}
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
    </div>
  )
}

/**
 * A single demo card within a DemoSection — for individual items
 * like a listing card, message thread, or viewing request.
 */
interface DemoCardProps {
  children: ReactNode
  className?: string
}

export function DemoCard({ children, className = '' }: DemoCardProps) {
  return (
    <div className={`bg-surface rounded-lg border border-border-default p-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * CTA overlay that sits on top of demo content, prompting action.
 * Shows above the muted demo content layer.
 */
interface DemoCTAProps {
  title: string
  description?: string
  buttonText: string
  buttonHref: string
  icon?: ReactNode
}

export function DemoCTA({ title, description, buttonText, buttonHref, icon }: DemoCTAProps) {
  return (
    <div className="relative z-10 -mt-24 mb-4 mx-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border-2 border-brand/20 p-6 text-center shadow-lg">
        {icon && <div className="mb-3">{icon}</div>}
        <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-text-secondary mb-4 max-w-md mx-auto">{description}</p>
        )}
        <a
          href={buttonHref}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-xl transition-all will-change-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          {buttonText}
        </a>
      </div>
    </div>
  )
}
