'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical, Save, Loader2, X, HelpCircle, Pencil } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface Props {
  listingId: string
  initialFaqs: FaqItem[]
  translations: Record<string, string>
}

export function FaqEditor({ listingId, initialFaqs, translations: t }: Props) {
  const router = useRouter()
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFaq = useCallback(() => {
    if (faqs.length >= 20) return
    setFaqs(prev => [...prev, { question: '', answer: '' }])
  }, [faqs.length])

  const removeFaq = useCallback((index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateFaq = useCallback((index: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, [field]: value } : faq))
  }, [])

  const handleSave = useCallback(async () => {
    // Filter out empty pairs
    const cleaned = faqs.filter(f => f.question.trim() && f.answer.trim())
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/listings/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, faqs: cleaned }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }

      setFaqs(cleaned)
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }, [faqs, listingId, router])

  const handleCancel = useCallback(() => {
    setFaqs(initialFaqs)
    setEditing(false)
    setError(null)
  }, [initialFaqs])

  // Read-only view with edit button
  if (!editing) {
    return (
      <div>
        {faqs.length > 0 ? (
          <div className="space-y-2 mb-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface rounded-lg border border-border-default p-3">
                <p className="text-xs font-semibold text-text-primary mb-1">{faq.question}</p>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl border-2 border-dashed border-border-default p-6 text-center mb-3">
            <HelpCircle size={24} className="text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-secondary mb-1">{t.faqEmptyOwner ?? 'No FAQs yet'}</p>
            <p className="text-[11px] text-text-muted">{t.faqEmptyHint ?? 'Add common questions to reduce repetitive enquiries'}</p>
          </div>
        )}
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand hover:text-brand-hover bg-brand/5 hover:bg-brand/10 rounded-lg transition-colors"
        >
          {faqs.length > 0 ? <Pencil size={13} /> : <Plus size={13} />}
          {faqs.length > 0 ? (t.faqEdit ?? 'Edit FAQs') : (t.faqAdd ?? 'Add FAQs')}
        </button>
      </div>
    )
  }

  // Editor view
  return (
    <div>
      <div className="space-y-3 mb-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border-default p-3 relative group">
            <button
              onClick={() => removeFaq(i)}
              className="absolute top-2 right-2 p-1 text-text-muted hover:text-red-500 transition-colors"
              title={t.faqRemove ?? 'Remove'}
            >
              <Trash2 size={13} />
            </button>
            <div className="pr-6 space-y-2">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                placeholder={t.faqQuestionPlaceholder ?? 'Question...'}
                className="w-full text-xs font-semibold text-text-primary bg-transparent border-b border-border-default focus:border-brand outline-none pb-1 placeholder:text-text-muted"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                placeholder={t.faqAnswerPlaceholder ?? 'Answer...'}
                rows={2}
                className="w-full text-xs text-text-secondary bg-transparent border-b border-border-default focus:border-brand outline-none resize-none placeholder:text-text-muted leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>

      {faqs.length < 20 && (
        <button
          onClick={addFaq}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-text-secondary hover:text-brand border border-dashed border-border-default hover:border-brand rounded-lg transition-colors mb-3"
        >
          <Plus size={13} />
          {t.faqAddAnother ?? 'Add question'}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {t.faqSave ?? 'Save'}
        </button>
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary rounded-lg transition-colors"
        >
          <X size={13} />
          {t.faqCancel ?? 'Cancel'}
        </button>
      </div>
    </div>
  )
}
