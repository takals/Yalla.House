'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle, CheckCircle2, ChevronDown, Zap } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface IntakeStep {
  id: string
  question: string
  type: 'text' | 'select' | 'multi-select' | 'number' | 'range' | 'toggle' | 'chips'
  options?: Array<{ value: string; label: string }>
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
  existingData = {},
  externalInput,
  translations,
}: IntakeFlowConfig) {
  const [messages, setMessages] = useState<Message[]>([])
  const [formData, setFormData] = useState<Record<string, unknown>>(existingData)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<IntakeStep[]>(initialSteps)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedBriefFields, setExpandedBriefFields] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize: send greeting + first question
  useEffect(() => {
    const initMessages = [
      {
        id: '0',
        role: 'yalla' as const,
        content: translations.greeting,
      },
    ]

    // Find first unanswered question
    const firstUnansweredIdx = allSteps.findIndex(
      step => !(step.id in formData)
    )
    if (firstUnansweredIdx !== -1) {
      setCurrentStepIndex(firstUnansweredIdx)
      const firstStep = allSteps[firstUnansweredIdx]
      if (firstStep) {
        initMessages.push({
          id: '1',
          role: 'yalla',
          content: firstStep.question,
        } as any)
      }
    }

    setMessages(initMessages)
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input after every response
  useEffect(() => {
    if (!isThinking && !showReview) {
      inputRef.current?.focus()
    }
  }, [isThinking, showReview])

  // Watch externalInput (e.g., voice transcript) and populate input field
  useEffect(() => {
    if (externalInput) {
      setInput(externalInput)
    }
  }, [externalInput])

  // Get current step
  const currentStep = allSteps[currentStepIndex]

  // Handle form updates and advance to next step
  const handleAnswerSubmit = async (answer: unknown) => {
    if (!currentStep) return

    // Add user message
    const userMsg: Message = {
      id: String(messages.length + 1),
      role: 'user',
      content: String(answer),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    // Update form data
    const newFormData = { ...formData, [currentStep.id]: answer }
    setFormData(newFormData)

    // Check for follow-ups
    let followUpSteps: IntakeStep[] = []
    if (currentStep.followUp) {
      for (const fu of currentStep.followUp) {
        if (fu.condition(answer)) {
          followUpSteps = fu.steps
          break
        }
      }
    }

    // Inject follow-up steps into allSteps if found
    if (followUpSteps.length > 0) {
      const newAllSteps = [
        ...allSteps.slice(0, currentStepIndex + 1),
        ...followUpSteps,
        ...allSteps.slice(currentStepIndex + 1),
      ]
      setAllSteps(newAllSteps)
    }

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Advance to next step
    const nextIdx = currentStepIndex + 1
    if (nextIdx < allSteps.length) {
      const nextStep = allSteps[nextIdx]
      if (nextStep) {
        const nextMsg: Message = {
          id: String(messages.length + 2),
          role: 'yalla',
          content: nextStep.question,
        } as any
        setMessages(prev => [...prev, nextMsg])
        setCurrentStepIndex(nextIdx)
      }
    } else {
      // All questions answered - show review
      setShowReview(true)
    }

    setIsThinking(false)
  }

  // Handle text input + Enter key
  const handleSendMessage = () => {
    if (!input.trim() || !currentStep || isThinking) return

    const trimmedInput = input.trim()

    // Validation
    if (currentStep.validation?.required && !trimmedInput) {
      setMessages(prev => [
        ...prev,
        {
          id: String(messages.length + 1),
          role: 'yalla',
          content: currentStep.validation?.errorMsg || 'This field is required.',
        },
      ])
      return
    }

    // Parse answer based on step type
    let answer: unknown = trimmedInput
    if (currentStep.type === 'number') {
      const num = parseInt(trimmedInput, 10)
      if (isNaN(num)) {
        setMessages(prev => [
          ...prev,
          {
            id: String(messages.length + 1),
            role: 'yalla',
            content: 'Please enter a valid number.',
          },
        ])
        return
      }
      answer = num
    }

    handleAnswerSubmit(answer)
  }

  // Handle option click
  const handleOptionClick = (value: string) => {
    if (!currentStep || isThinking) return

    if (currentStep.type === 'multi-select') {
      const current = (formData[currentStep.id] as string[]) || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      // Auto-submit if user has selected at least one
      if (updated.length > 0) {
        handleAnswerSubmit(updated)
      }
    } else {
      handleAnswerSubmit(value)
    }
  }

  // Handle field edit in brief card
  const handleEditField = (stepId: string) => {
    const stepIdx = allSteps.findIndex(s => s.id === stepId)
    if (stepIdx !== -1) {
      setShowReview(false)
      setCurrentStepIndex(stepIdx)
      setMessages(prev =>
        prev.filter(m => m.stepId !== stepId)
      )
    }
  }

  // Handle review + submit
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onComplete(formData)
    } catch (err) {
      console.error('Intake submission error:', err)
      setMessages(prev => [
        ...prev,
        {
          id: String(messages.length + 1),
          role: 'yalla',
          content: translations.errorMsg,
        },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  const completedCount = Object.keys(formData).length
  const totalCount = allSteps.length
  const progress = `${completedCount} of ${totalCount}`

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen overflow-hidden">
      {/* ── LEFT: Chat Panel ─────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col bg-surface border-r border-[#E2E4EB]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'yalla' && (
                <div className="flex gap-3 max-w-lg">
                  {/* Yalla avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#D4764E] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    Y
                  </div>
                  {/* Message bubble */}
                  <div className="bg-[#F5F5F7] rounded-2xl px-4 py-2.5 text-[0.9375rem] text-[#0F1117]">
                    {msg.content}
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="bg-[#D4764E] rounded-2xl px-4 py-2.5 text-[0.9375rem] text-white max-w-lg">
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
                <div className="bg-[#F5F5F7] rounded-2xl px-4 py-2.5 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#CCCCCC] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#CCCCCC] animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-[#CCCCCC] animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}

          {/* Review state message */}
          {showReview && !submitting && (
            <div className="flex justify-start">
              <div className="bg-[#E8F5E9] rounded-2xl px-4 py-2.5 text-[0.9375rem] text-[#2E7D32] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#2E7D32] flex-shrink-0" />
                {translations.reviewTitle}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Options (for select/multi-select/chips) */}
        {!showReview && currentStep && ['select', 'multi-select', 'chips'].includes(currentStep.type) && (
          <div className="px-6 pb-4 space-y-2 border-t border-[#E2E4EB]">
            {currentStep.options?.map(opt => {
              const isSelected = currentStep.type === 'multi-select'
                ? (formData[currentStep.id] as string[])?.includes(opt.value)
                : false
              return (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value)}
                  disabled={isThinking}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all text-[0.9375rem] font-medium ${
                    isSelected
                      ? 'bg-[#D4764E] border-[#D4764E] text-white'
                      : 'bg-white border-[#E2E4EB] text-[#0F1117] hover:border-[#D4764E] hover:bg-[rgba(212,118,78,0.05)]'
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Input area */}
        {!showReview && currentStep && (
          <div className="px-6 pb-6 border-t border-[#E2E4EB]">
            {currentStep.helperText && (
              <p className="text-[0.8125rem] text-[#5E6278] mb-2">{currentStep.helperText}</p>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type={currentStep.type === 'number' ? 'number' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={translations.placeholder}
                disabled={isThinking}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E4EB] bg-white text-[0.9375rem] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#D4764E] focus:ring-offset-1 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isThinking}
                className="w-10 h-10 rounded-xl bg-[#D4764E] text-white flex items-center justify-center hover:bg-[#BF6840] transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Review buttons */}
        {showReview && (
          <div className="px-6 pb-6 border-t border-[#E2E4EB] flex gap-3">
            <button
              onClick={() => setShowReview(false)}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E4EB] text-[0.9375rem] font-medium text-[#0F1117] hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4764E] text-white text-[0.9375rem] font-medium hover:bg-[#BF6840] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : translations.submitBtn}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Brief Card (sticky) ──────────────────────── */}
      <div className="hidden lg:flex flex-col gap-4 lg:col-span-1 h-full overflow-hidden">
        {/* Progress */}
        <div className="px-4 py-3 rounded-xl bg-[#F5F5F7] border border-[#E2E4EB]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.8125rem] font-semibold text-[#0F1117]">Progress</span>
            <span className="text-[0.8125rem] text-[#5E6278]">{progress}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#E2E4EB] overflow-hidden">
            <div
              className="h-full bg-[#D4764E] transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Brief card - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 rounded-xl bg-[#0F1117] border border-[rgba(255,255,255,0.1)]">
            <h3 className="text-white font-bold text-[0.9375rem] mb-4">Your Brief</h3>

            <div className="space-y-3">
              {allSteps.map(step => {
                const value = formData[step.id]
                const isComplete = step.id in formData
                const isExpanded = expandedBriefFields.has(step.id)

                return (
                  <div
                    key={step.id}
                    className="border border-[rgba(255,255,255,0.1)] rounded-lg p-3 bg-[rgba(255,255,255,0.02)] transition-all"
                  >
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedBriefFields)
                        if (newExpanded.has(step.id)) {
                          newExpanded.delete(step.id)
                        } else {
                          newExpanded.add(step.id)
                        }
                        setExpandedBriefFields(newExpanded)
                      }}
                      className="w-full text-left flex items-start justify-between gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.75rem] font-semibold text-[rgba(255,255,255,0.5)] uppercase tracking-wide mb-1">
                          {step.id.replace(/_/g, ' ')}
                        </div>
                        <div className={`text-[0.8125rem] font-medium truncate ${
                          isComplete
                            ? 'text-white'
                            : 'text-[rgba(255,255,255,0.3)]'
                        }`}>
                          {isComplete
                            ? Array.isArray(value)
                              ? value.join(', ')
                              : String(value)
                            : '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isComplete && <CheckCircle2 size={14} className="text-[#D4764E]" />}
                        {isExpanded && <ChevronDown size={14} className="text-[rgba(255,255,255,0.4)]" />}
                      </div>
                    </button>

                    {/* Expanded edit state */}
                    {isExpanded && (
                      <button
                        onClick={() => handleEditField(step.id)}
                        className="mt-2 w-full text-[0.75rem] font-semibold text-[#D4764E] hover:text-[#BF6840] py-1.5 px-2 rounded-md bg-[rgba(212,118,78,0.1)] transition-colors"
                      >
                        {translations.reviewEditBtn}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationalIntake
