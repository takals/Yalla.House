'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Send, BarChart3, ClipboardList, Users, Layout } from 'lucide-react'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ModeContent {
  headlinePrefix: string
  headlineWords: string[]
  headlineSuffix: string
  subline: string
  cta: string
  ctaHref: string
  stats: Array<{ value: string; label: string }>
  howTitle: string
  howSubtitle: string
  steps: Array<{ title: string; body: string }>
  whyTitle: string
  whyItems: Array<{ title: string; body: string }>
}

interface HomepageHeroProps {
  owner: ModeContent
  hunter: ModeContent
  toggleOwnerLabel: string
  toggleHunterLabel: string
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function HomepageHero({
  owner,
  hunter,
  toggleOwnerLabel,
  toggleHunterLabel,
}: HomepageHeroProps) {
  const [mode, setMode] = useState<'owner' | 'hunter'>('owner')
  const [wordIndex, setWordIndex] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [sectionVisible, setSectionVisible] = useState(true)

  const content = mode === 'owner' ? owner : hunter

  // ── Word crossfade (3.5s cycle) ────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const DISPLAY_MS = 3500
    const FADE_MS = 600

    const interval = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % content.headlineWords.length)
        setWordVisible(true)
      }, FADE_MS)
    }, DISPLAY_MS)

    return () => clearInterval(interval)
  }, [content.headlineWords.length, mode])

  // ── Mode switch with crossfade ─────────────────────────────────────────
  const switchMode = useCallback((newMode: 'owner' | 'hunter') => {
    if (newMode === mode) return
    setSectionVisible(false)
    setTimeout(() => {
      setMode(newMode)
      setWordIndex(0)
      setWordVisible(true)
      setSectionVisible(true)
    }, 400)
  }, [mode])

  const stepIcons = mode === 'owner'
    ? [<LayoutDashboard key="1" size={24} />, <Send key="2" size={24} />, <BarChart3 key="3" size={24} />]
    : [<ClipboardList key="1" size={24} />, <Users key="2" size={24} />, <Layout key="3" size={24} />]

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">

          {/* Toggle pills */}
          <div className="inline-flex items-center bg-white/[0.06] rounded-full p-1 mb-10">
            <button
              onClick={() => switchMode('owner')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                mode === 'owner'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-text-on-dark-secondary hover:text-white'
              }`}
            >
              {toggleOwnerLabel}
            </button>
            <button
              onClick={() => switchMode('hunter')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                mode === 'hunter'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-text-on-dark-secondary hover:text-white'
              }`}
            >
              {toggleHunterLabel}
            </button>
          </div>

          {/* Headline + subline + single CTA */}
          <div
            className="transition-opacity duration-[400ms] ease-in-out"
            style={{ opacity: sectionVisible ? 1 : 0 }}
          >
            <h1 className="text-display text-white mb-6">
              {content.headlinePrefix}
              <span
                className="inline-block transition-opacity duration-[600ms] ease-in-out text-brand"
                style={{ opacity: wordVisible ? 1 : 0 }}
              >
                {content.headlineWords[wordIndex]}
              </span>
              {content.headlineSuffix}
            </h1>

            <p className="text-lede text-text-on-dark-secondary max-w-2xl mx-auto mb-10">
              {content.subline}
            </p>

            <Link
              href={content.ctaHref}
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {content.cta} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-[400ms] ease-in-out"
            style={{ opacity: sectionVisible ? 1 : 0 }}
          >
            {content.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card-dark rounded-card-dark p-5 text-center shadow-dark-card"
              >
                <div className="text-2xl font-bold text-brand mb-1">{stat.value}</div>
                <div className="text-xs text-text-on-dark-muted leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="transition-opacity duration-[400ms] ease-in-out"
            style={{ opacity: sectionVisible ? 1 : 0 }}
          >
            <h2 className="text-title-1 text-white text-center mb-4">
              {content.howTitle}
            </h2>
            <p className="text-text-on-dark-secondary text-center mb-12 max-w-xl mx-auto">
              {content.howSubtitle}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {content.steps.map((step, i) => (
                <div
                  key={i}
                  className="bg-surface-dark rounded-card-dark p-6 group hover:bg-card-dark transition-[background-color] duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand">
                      {stepIcons[i]}
                    </div>
                    <span className="text-xs font-bold text-text-on-dark-muted uppercase tracking-widest">
                      Step {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY YALLA (mode-aware) ────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="transition-opacity duration-[400ms] ease-in-out"
            style={{ opacity: sectionVisible ? 1 : 0 }}
          >
            <h2 className="text-title-1 text-white text-center mb-12">
              {content.whyTitle}
            </h2>
            <div className="space-y-8">
              {content.whyItems.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 rounded-full bg-brand flex-shrink-0 self-stretch" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-text-on-dark-secondary leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
