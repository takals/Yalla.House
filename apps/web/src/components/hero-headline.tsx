'use client'

import { useState, useEffect } from 'react'

interface HeroHeadlineProps {
  /** e.g. "Your property " */
  prefix: string
  /** e.g. ["sale", "rental"] or ["Immobilienverkauf", "Vermietung"] */
  words: string[]
  /** e.g. ", under your control." */
  suffix: string
}

export default function HeroHeadline({ prefix, words, suffix }: HeroHeadlineProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const DISPLAY_MS = 3500
    const FADE_MS = 600

    const interval = setInterval(() => {
      // Fade out
      setVisible(false)

      // After fade-out completes, swap word and fade in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length)
        setVisible(true)
      }, FADE_MS)
    }, DISPLAY_MS)

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <h1 className="text-display text-white mb-6">
      {prefix}
      <span
        className="inline-block transition-opacity duration-[600ms] ease-in-out"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {words[index]}
      </span>
      {suffix}
    </h1>
  )
}
