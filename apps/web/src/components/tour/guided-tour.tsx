'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Lightweight guided tour (coach marks). No dependency.
 *
 * - Auto-starts once per role per browser (localStorage), i.e. on the first
 *   visit to a dashboard — which is the first click after the public page.
 * - Anchors to elements carrying data-tour="<id>". If a target is missing or
 *   hidden (mobile sidebar closed), the step renders as a centred card instead
 *   of failing, so the copy is always delivered.
 * - Replay: any element can dispatch `yh:tour:start` on window.
 * - Explore-first: works for guests. The last step usually points at the
 *   action that will prompt sign-in.
 */
export interface TourStep {
  id: string
  target?: string       // data-tour id; omit for a centred card
  title: string
  body: string
}

interface Props {
  storageKey: string     // e.g. yh:tour:owner:v1
  steps: TourStep[]
  labels: { next: string; back: string; skip: string; done: string; progress: (n: number, total: number) => string }
  autoStart?: boolean
}

const PAD = 8

export function GuidedTour({ storageKey, steps, labels, autoStart = true }: Props) {
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const finish = useCallback((reason: 'done' | 'skip') => {
    try { localStorage.setItem(storageKey, reason) } catch { /* private mode */ }
    setOpen(false); setI(0)
  }, [storageKey])

  // Auto-start on first visit; replay on demand.
  useEffect(() => {
    if (!steps.length) return
    const start = () => { setI(0); setOpen(true) }
    let seen = 'done'
    try { seen = localStorage.getItem(storageKey) ?? '' } catch { seen = 'done' }
    let t: ReturnType<typeof setTimeout> | undefined
    if (autoStart && !seen) t = setTimeout(start, 900)
    window.addEventListener('yh:tour:start', start)
    return () => { if (t) clearTimeout(t); window.removeEventListener('yh:tour:start', start) }
  }, [storageKey, steps.length, autoStart])

  // Measure the current target; keep measuring on scroll/resize.
  const measure = useCallback(() => {
    const step = steps[i]
    if (!step?.target) { setRect(null); return }
    const el = document.querySelector<HTMLElement>(`[data-tour="${CSS.escape(step.target)}"]`)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    // Hidden (display:none / collapsed drawer) → fall back to centred card.
    if (r.width === 0 && r.height === 0) { setRect(null); return }
    setRect(r)
  }, [steps, i])

  useLayoutEffect(() => {
    if (!open) return
    const step = steps[i]
    const el = step?.target ? document.querySelector<HTMLElement>(`[data-tour="${CSS.escape(step.target)}"]`) : null
    el?.scrollIntoView({ block: 'center', inline: 'nearest' })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('scroll', measure, true)
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure, true) }
  }, [open, i, steps, measure])

  // Keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish('skip')
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function next() { if (i >= steps.length - 1) finish('done'); else setI(i + 1) }
  function back() { if (i > 0) setI(i - 1) }

  if (!open || !steps.length) return null
  const step = steps[i]!
  const isLast = i === steps.length - 1

  // Card placement: below the target if room, else above; clamp to viewport.
  let cardStyle: React.CSSProperties
  if (rect) {
    const vw = window.innerWidth, vh = window.innerHeight
    const cardW = Math.min(340, vw - 24)
    const below = rect.bottom + PAD + 12
    const above = vh - rect.top + PAD + 12
    const placeBelow = below + 180 < vh || rect.top < 220
    const left = Math.max(12, Math.min(rect.left, vw - cardW - 12))
    cardStyle = placeBelow
      ? { position: 'fixed', top: below, left, width: cardW }
      : { position: 'fixed', bottom: above, left, width: cardW }
  } else {
    cardStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(360px, calc(100vw - 24px))' }
  }

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-labelledby="yh-tour-title">
      {/* Spotlight: transparent box over the target, giant shadow darkens everything else. */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-xl transition-all duration-200"
          style={{
            top: rect.top - PAD, left: rect.left - PAD,
            width: rect.width + PAD * 2, height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15,17,23,0.55)',
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 bg-[rgba(15,17,23,0.55)]" />
      )}

      <div ref={cardRef} style={cardStyle}
           className="rounded-2xl bg-white p-5 shadow-2xl border border-border-default">
        <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-text-muted">
          {labels.progress(i + 1, steps.length)}
        </div>
        <h2 id="yh-tour-title" className="mt-1 text-base font-bold text-text-primary">{step.title}</h2>
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={() => finish('skip')}
                  className="text-xs font-semibold text-text-muted hover:text-text-secondary">{labels.skip}</button>
          <div className="flex-1" />
          {i > 0 && (
            <button type="button" onClick={back}
                    className="rounded-lg border border-border-default px-3 py-1.5 text-sm font-semibold text-text-secondary hover:bg-hover-bg">
              {labels.back}
            </button>
          )}
          <button type="button" onClick={next} autoFocus
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover">
            {isLast ? labels.done : labels.next}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Replay the tour for the current dashboard. */
export function startTour() {
  window.dispatchEvent(new Event('yh:tour:start'))
}
