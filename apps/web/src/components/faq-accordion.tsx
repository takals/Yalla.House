'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

interface FaqAccordionProps {
  sections: FaqSection[]
}

export default function FaqAccordion({ sections }: FaqAccordionProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  function toggle(key: string) {
    setOpenKey(prev => (prev === key ? null : key))
  }

  return (
    <div className="space-y-12">
      {sections.map((section, sIdx) => (
        <div key={sIdx}>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-6">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, qIdx) => {
              const key = `${sIdx}-${qIdx}`
              const isOpen = openKey === key
              return (
                <div
                  key={key}
                  className="bg-surface-dark rounded-card-dark border border-white/[0.06] overflow-hidden transition-[border-color] duration-300 hover:border-white/[0.12]"
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-white leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`flex-shrink-0 text-text-on-dark-muted transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-text-on-dark-secondary leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
