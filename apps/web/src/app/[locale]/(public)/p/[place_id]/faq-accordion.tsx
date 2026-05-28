'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  faqs: FaqItem[]
  translations: {
    title: string
  }
}

export function FaqAccordion({ faqs, translations: t }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (faqs.length === 0) return null

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className="bg-surface rounded-xl border border-border-default overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-hover-muted transition-colors"
            >
              <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-0">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{faq.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
