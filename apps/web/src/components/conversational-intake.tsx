'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, Zap, FileText, Mic, CheckCheck } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface IntakeStepOptionGroup {
  groupLabel: string
  groupIcon?: string
  options: Array<{ value: string; label: string }>
}

export interface IntakeStep {
  id: string
  question: string
  type: 'text' | 'select' | 'multi-select' | 'number' | 'range' | 'toggle' | 'chips' | 'tagged-preferences'
  options?: Array<{ value: string; label: string }>
  /** Grouped options — for 'tagged-preferences' type */
  optionGroups?: IntakeStepOptionGroup[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    errorMsg?: string
  }
  followUp?: Array<{
    condition: (value: unknown) => boolean
    steps: IntakeStep[]
  }>
  helperText?: string
}

export interface IntakeFlowConfig {
  flowId: string
  steps: IntakeStep[]
  onComplete: (data: Record<string, unknown>) => void | Promise<void>
  onFieldUpdate?: (field: string, value: unknown) => void
  existingData?: Record<string, unknown>
  externalInput?: string
  translations: {
    greeting: string
    placeholder: string
    send: string
    reviewTitle: string
    reviewEditBtn: string
    submitBtn: string
    progressLabel: (current: number, total: number) => string
    errorMsg: string
  }
}

interface Message {
  id: string
  role: 'user' | 'yalla'
  content: string
  stepId?: string
  type?: 'text' | 'options'
}

// ─────────────────────────────────────────────────────────────────────
// ConversationalIntake Component
// ─────────────────────────────────────────────────────────────────────

export function ConversationalIntake({
  flowId,
  steps: initialSteps,
  onComplete,
  onFieldUpdate,
  existingData = {},
  externalInput,
  translations,
}: IntakeFlowConfig) {
  const [messages, setMessages] = useState<Message[]>([])
  // Restore from localStorage if available (survives auth round-trip)
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`yalla_intake_${flowId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          return { ...parsed, ...existingData }
        }
      } catch {}
    }
    return existingData
  })
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<IntakeStep[]>(initialSteps)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [briefOpen, setBriefOpen] = useState(false)
  // For multi-select/chips: track pending selections before confirming
  const [pendingMulti, setPendingMulti] = useState<string[]>([])
  // For tagged-preferences: track slug → sentiment
  const [pendingTags, setPendingTags] = useState<Record<string, 'want' | 'need' | 'dealbreaker'>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize: send greeting + first question
  useEffect(() => {
    const initMessages: Message[] = [
      { id: '0', role: 'yalla', content: translations.greeting },
    ]
    const firstUnansweredIdx = allSteps.findIndex(step => !(step.id in formData))
    if (firstUnansweredIdx !== -1) {
      setCurrentStepIndex(firstUnansweredIdx)
      const firstStep = allSteps[firstUnansweredIdx]
      if (firstStep) {
        initMessages.push({ id: '1', role: 'yalla', content: firstStep.question })
      }
    }
    setMessages(initMessages)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input
  useEffect(() => {
    if (!isThinking && !showReview) inputRef.current?.focus()
  }, [isThinking, showReview])

  // Voice input
  useEffect(() => {
    if (externalInput) setInput(externalInput)
  }, [externalInput])

  // Reset pending multi/tags when step changes
  useEffect(() => {
    setPendingMulti([])
    setPendingTags({})
  }, [currentStepIndex])

  const currentStep = allSteps[currentStepIndex]
  const isMultiStep = currentStep && (currentStep.type === 'multi-select' || currentStep.type === 'chips')
  const isTaggedStep = currentStep && currentStep.type === 'tagged-preferences'

  // Handle submitting an answer and advancing
  const handleAnswerSubmit = useCallback(async (answer: unknown) => {
    if (!currentStep) return

    // Format display text for user message
    let displayText = String(answer)
    if (Array.isArray(answer) && currentStep.options) {
      displayText = (answer as string[])
        .map(v => {
          if (v === '_none') return currentStep.options?.find(o => o.value === '_none')?.label || 'No preference'
          return currentStep.options?.find(o => o.value === v)?.label || v
        })
        .join(', ')
    } else if (currentStep.options) {
      const opt = currentStep.options.find(o => o.value === answer)
      if (opt) displayText = opt.label
    }

    setMessages(prev => [...prev, { id: String(Date.now()), role: 'user', content: displayText }])
    setInput('')
    setPendingMulti([])
    setIsThinking(true)

    const newFormData = { ...formData, [currentStep.id]: answer }
    setFormData(newFormData)
    // Notify parent of field update (for live passport card)
    if (onFieldUpdate) onFieldUpdate(currentStep.id, answer)
    // Persist to localStorage so data survives auth round-trip
    try { localStorage.setItem(`yalla_intake_${flowId}`, JSON.stringify(newFormData)) } catch {}

    // Follow-ups
    let followUpSteps: IntakeStep[] = []
    if (currentStep.followUp) {
      for (const fu of currentStep.followUp) {
        if (fu.condition(answer)) { followUpSteps = fu.steps; break }
      }
    }
    if (followUpSteps.length > 0) {
      setAllSteps(prev => [
        ...prev.slice(0, currentStepIndex + 1),
        ...followUpSteps,
        ...prev.slice(currentStepIndex + 1),
      ])
    }

    await new Promise(resolve => setTimeout(resolve, 600))

    const nextIdx = currentStepIndex + 1
    if (nextIdx < allSteps.length) {
      const nextStep = allSteps[nextIdx]
      if (nextStep) {
        setMessages(prev => [...prev, { id: String(Date.now() + 1), role: 'yalla', content: nextStep.question }])
        setCurrentStepIndex(nextIdx)
      }
    } else {
      setShowReview(true)
    }
    setIsThinking(false)
  }, [currentStep, currentStepIndex, formData, allSteps, flowId, onFieldUpdate])

  // Text input submit
  const handleSendMessage = () => {
    if (!input.trim() || !currentStep || isThinking) return
    const trimmed = input.trim()
    if (currentStep.validation?.required && !trimmed) return

    let answer: unknown = trimmed
    if (currentStep.type === 'number') {
      const num = parseInt(trimmed, 10)
      if (isNaN(num)) {
        setMessages(prev => [...prev, { id: String(Date.now()), role: 'yalla', content: 'Please enter a valid number.' }])
        return
      }
      answer = num
    }
    handleAnswerSubmit(answer)
  }

  // Single-select option click
  const handleOptionClick = (value: string) => {
    if (!currentStep || isThinking) return

    if (isMultiStep) {
      // "_none" / skip option: select only that and auto-submit
      if (value === '_none') {
        setPendingMulti(['_none'])
        handleAnswerSubmit(['_none'])
        return
      }
      // Toggle selection
      setPendingMulti(prev => {
        const filtered = prev.filter(v => v !== '_none') // remove _none if user picks something
        return filtered.includes(value)
          ? filtered.filter(v => v !== value)
          : [...filtered, value]
      })
    } else {
      // Single select — submit immediately
      handleAnswerSubmit(value)
    }
  }

  // Confirm multi-select
  const handleConfirmMulti = () => {
    if (pendingMulti.length > 0) handleAnswerSubmit(pendingMulti)
  }

  // Select all (for multi-select/chips — excludes _none options)
  const handleSelectAll = () => {
    if (!currentStep?.options) return
    const allValues = currentStep.options
      .filter(o => o.value !== '_none')
      .map(o => o.value)
    setPendingMulti(allValues)
  }

  // Cycle a tag through: off → want → need → dealbreaker → off
  const handleTagCycle = (slug: string) => {
    setPendingTags(prev => {
      const current = prev[slug]
      if (!current) return { ...prev, [slug]: 'want' }
      if (current === 'want') return { ...prev, [slug]: 'need' }
      if (current === 'need') return { ...prev, [slug]: 'dealbreaker' }
      // dealbreaker → remove
      const next = { ...prev }
      delete next[slug]
      return next
    })
  }

  // Confirm tagged preferences
  const handleConfirmTags = () => {
    const tagArray = Object.entries(pendingTags).map(([slug, sentiment]) => ({ slug, sentiment }))
    handleAnswerSubmit(tagArray)
  }

  // Go back to previous step
  const handleGoBack = () => {
    if (currentStepIndex <= 0) return
    const prevIdx = currentStepIndex - 1
    setCurrentStepIndex(prevIdx)
    setPendingMulti([])
    const prevStep = allSteps[prevIdx]
    if (prevStep) {
      setMessages(prev => [...prev, {
        id: String(Date.now()),
        role: 'yalla',
        content: prevStep.question,
      }])
    }
  }

  // Edit a field
  const handleEditField = (stepId: string) => {
    const stepIdx = allSteps.findIndex(s => s.id === stepId)
    if (stepIdx !== -1) {
      setShowReview(false)
      setBriefOpen(false)
      setCurrentStepIndex(stepIdx)
      const step = allSteps[stepIdx]
      if (step) {
        setMessages(prev => [...prev, { id: String(Date.now()), role: 'yalla', content: step.question }])
      }
    }
  }

  const [submitted, setSubmitted] = useState(false)

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onComplete(formData)
      setSubmitted(true)
      // Clear localStorage after successful save
      try { localStorage.removeItem(`yalla_intake_${flowId}`) } catch {}
    } catch (err) {
      console.error('Intake submission error:', err)
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'yalla', content: translations.errorMsg }])
    } finally {
      setSubmitting(false)
    }
  }

  // Share URLs for spread-the-word
  const shareText = 'I just set up my Home Passport on @YallaHouse \u2014 17,000+ verified agents, zero commission. Check it out!'
  const shareUrl = 'https://yalla.house/en/agents'
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`

  const completedCount = Object.keys(formData).length
  const totalCount = allSteps.length
  const progressPct = Math.round((completedCount / totalCount) * 100)

  // Format value for brief display
  const formatValue = (step: IntakeStep, value: unknown): string => {
    // Tagged preferences: [{slug, sentiment}]
    if (step.type === 'tagged-preferences' && Array.isArray(value)) {
      const tags = value as Array<{ slug: string; sentiment: string }>
      if (tags.length === 0) return 'No preferences set'
      // Find labels from optionGroups
      const allOpts = step.optionGroups?.flatMap(g => g.options) ?? []
      return tags.map(t => {
        const label = allOpts.find(o => o.value === t.slug)?.label ?? t.slug
        const badge = t.sentiment === 'need' ? '★' : t.sentiment === 'dealbreaker' ? '✕' : ''
        return badge ? `${label} ${badge}` : label
      }).join(', ')
    }
    if (Array.isArray(value)) {
      return value.map(v => {
        if (v === '_none') return step.options?.find(o => o.value === '_none')?.label || 'No preference'
        return step.options?.find(o => o.value === v)?.label || v
      }).join(', ')
    }
    const opt = step.options?.find(o => o.value === value)
    return opt ? opt.label : String(value ?? '—')
  }

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-64px)] relative">

      {/* ── TOP BAR: Progress + Review toggle ──────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-full max-w-xs h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#D4764E] transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{completedCount}/{totalCount}</span>
        </div>
        <button
          onClick={() => setBriefOpen(!briefOpen)}
          className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <FileText size={14} />
          {briefOpen ? 'Hide Brief' : 'Review My Passport'}
          {briefOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* ── BRIEF PANEL (slide-down overlay) ────────────────── */}
      {briefOpen && (
        <div className="absolute top-[53px] left-0 right-0 z-20 bg-[#0F1117] border-b border-white/10 shadow-2xl max-h-[60vh] overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Your Home Passport</h3>
              {completedCount === totalCount && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#D4764E] text-white text-xs font-semibold hover:bg-[#BF6840] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : translations.submitBtn}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSteps.map(step => {
                const value = formData[step.id]
                const isComplete = step.id in formData
                return (
                  <div key={step.id} className={`rounded-lg p-3 border transition-all ${
                    isComplete
                      ? 'border-[#D4764E]/30 bg-white/[0.04]'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                          {step.id.replace(/_/g, ' ')}
                        </div>
                        <div className={`text-sm font-medium ${isComplete ? 'text-white' : 'text-white/20'}`}>
                          {isComplete ? formatValue(step, value) : '—'}
                        </div>
                      </div>
                      {isComplete && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-[#D4764E]" />
                          <button
                            onClick={() => handleEditField(step.id)}
                            className="text-[10px] font-bold text-[#D4764E] hover:text-[#BF6840]"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT AREA ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'yalla' && (
                <div className="flex gap-3 max-w-md">
                  <div className="w-8 h-8 rounded-full bg-[#D4764E] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    Y
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-slate-900">
                    {msg.content}
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="bg-[#D4764E] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm text-white max-w-md">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4764E] flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-white animate-pulse" />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Review complete — pre-submit */}
          {showReview && !submitting && !submitted && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div className="space-y-3">
                  <div className="bg-emerald-50 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-emerald-800">
                    {translations.reviewTitle}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBriefOpen(true)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Review My Passport
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-[#D4764E] text-white text-sm font-medium hover:bg-[#BF6840] transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : translations.submitBtn}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved — spread the word */}
          {submitted && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-md">
                <div className="w-8 h-8 rounded-full bg-[#D4764E] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-2xl rounded-tl-md px-4 py-2.5 text-sm text-emerald-800 font-medium">
                    Your Home Passport is saved! We are matching you with agents in your area now.
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-md px-5 py-4 border border-slate-200">
                    <p className="text-sm font-bold text-slate-900 mb-2">Spread the word</p>
                    <p className="text-xs text-slate-500 mb-3">Help us grow and help others find great agents commission-free.</p>
                    <div className="flex flex-wrap gap-2">
                      <a href={twitterShareUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Post
                      </a>
                      <a href={facebookShareUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2] text-white text-xs font-semibold hover:bg-[#166FE5] transition-colors">
                        Facebook
                      </a>
                      <a href={whatsappShareUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20BD5A] transition-colors">
                        WhatsApp
                      </a>
                      <a href={linkedinShareUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A66C2] text-white text-xs font-semibold hover:bg-[#004182] transition-colors">
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── INPUT AREA ────────────────────────────────────────── */}
      {!showReview && currentStep && (
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          <div className="max-w-2xl mx-auto">

            {/* Chips / Options — horizontal wrap */}
            {['select', 'multi-select', 'chips'].includes(currentStep.type) && currentStep.options && (
              <div className="mb-3">
                {/* Select All + Back row for multi-select */}
                {isMultiStep && (
                  <div className="flex items-center justify-between mb-2">
                    {currentStepIndex > 0 ? (
                      <button
                        onClick={handleGoBack}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        <ChevronLeft size={14} /> Back
                      </button>
                    ) : <span />}
                    <button
                      onClick={handleSelectAll}
                      disabled={isThinking}
                      className="flex items-center gap-1 text-xs font-semibold text-[#D4764E] hover:text-[#BF6840] transition-colors disabled:opacity-40"
                    >
                      <CheckCheck size={14} /> Select All
                    </button>
                  </div>
                )}
                {/* Back button for single-select (no Select All needed) */}
                {!isMultiStep && currentStepIndex > 0 && (
                  <div className="mb-2">
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {currentStep.options.map(opt => {
                    const isNoneOption = opt.value === '_none'
                    const isSelected = isMultiStep
                      ? pendingMulti.includes(opt.value)
                      : false
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionClick(opt.value)}
                        disabled={isThinking}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#D4764E] border-[#D4764E] text-white shadow-sm'
                            : isNoneOption
                              ? 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-100 italic'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#D4764E] hover:bg-orange-50'
                        } disabled:opacity-40`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                {/* Confirm button for multi-select */}
                {isMultiStep && pendingMulti.length > 0 && !pendingMulti.includes('_none') && (
                  <button
                    onClick={handleConfirmMulti}
                    className="mt-3 px-5 py-2 rounded-xl bg-[#D4764E] text-white text-sm font-semibold hover:bg-[#BF6840] transition-colors"
                  >
                    Continue with {pendingMulti.length} selected
                  </button>
                )}
              </div>
            )}

            {/* Tagged preferences — grouped chips with sentiment cycling */}
            {isTaggedStep && currentStep.optionGroups && (
              <div className="mb-3 max-h-[45vh] overflow-y-auto">
                {/* Back + legend row */}
                <div className="flex items-center justify-between mb-3 sticky top-0 bg-white py-1 z-10">
                  {currentStepIndex > 0 ? (
                    <button
                      onClick={handleGoBack}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                  ) : <span />}
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D4764E]" /> Want</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Need</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> No-go</span>
                  </div>
                </div>

                {currentStep.optionGroups.map(group => (
                  <div key={group.groupLabel} className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {group.groupLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map(opt => {
                        const sentiment = pendingTags[opt.value]
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleTagCycle(opt.value)}
                            disabled={isThinking}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap select-none ${
                              sentiment === 'want'
                                ? 'bg-[#D4764E] border-[#D4764E] text-white'
                                : sentiment === 'need'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : sentiment === 'dealbreaker'
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#D4764E] hover:bg-orange-50'
                            } disabled:opacity-40`}
                          >
                            {opt.label}
                            {sentiment === 'need' && ' ★'}
                            {sentiment === 'dealbreaker' && ' ✕'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Confirm / skip */}
                <div className="flex items-center gap-3 mt-2 sticky bottom-0 bg-white py-2">
                  {Object.keys(pendingTags).length > 0 ? (
                    <button
                      onClick={handleConfirmTags}
                      className="px-5 py-2 rounded-xl bg-[#D4764E] text-white text-sm font-semibold hover:bg-[#BF6840] transition-colors"
                    >
                      Continue with {Object.keys(pendingTags).length} preferences
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAnswerSubmit([])}
                      className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Skip — no preferences
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Back button for text/number steps (when no option chips are shown) */}
            {!['select', 'multi-select', 'chips', 'tagged-preferences'].includes(currentStep.type) && currentStepIndex > 0 && (
              <div className="mb-2">
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              </div>
            )}

            {/* Text / number input */}
            {currentStep.helperText && (
              <p className="text-xs text-slate-400 mb-2">{currentStep.helperText}</p>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type={currentStep.type === 'number' ? 'number' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage() } }}
                placeholder={translations.placeholder}
                disabled={isThinking}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4764E]/40 focus:border-[#D4764E] disabled:opacity-40"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isThinking}
                className="w-10 h-10 rounded-xl bg-[#D4764E] text-white flex items-center justify-center hover:bg-[#BF6840] transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationalIntake
