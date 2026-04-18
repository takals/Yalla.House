'use client'

import { useState, useRef, useCallback } from 'react'
import { Mail, MessageSquare, ChevronDown, ChevronUp, RotateCcw, Save } from 'lucide-react'
import {
  saveCustomTemplateAction,
  resetTemplateAction,
  toggleTemplateChannelAction,
} from './actions'

interface Template {
  id: string
  eventType: string
  channel: 'email' | 'sms'
  subject: string | null
  bodyTemplate: string
  isActive: boolean
  isCustom: boolean
}

interface Props {
  listingId: string
  templates: Template[]
  labels: Record<string, string>
}

interface TemplateState {
  subject: string
  body: string
  isActive: boolean
  isCustom: boolean
}

const VARIABLES = [
  '{{recipientName}}',
  '{{listingTitle}}',
  '{{listingCity}}',
  '{{viewingDate}}',
  '{{viewingTime}}',
  '{{videoLink}}',
  '{{dashboardUrl}}',
]

const SAMPLE_DATA: Record<string, string> = {
  '{{recipientName}}': 'Alex Johnson',
  '{{listingTitle}}': '3-bed flat in Camden',
  '{{listingCity}}': 'London',
  '{{viewingDate}}': '24 Apr 2026',
  '{{viewingTime}}': '14:00',
  '{{videoLink}}': 'https://meet.yalla.house/abc123',
  '{{dashboardUrl}}': 'https://yalla.house/owner',
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  const newValue = value.substring(0, start) + text + value.substring(end)
  // Set cursor position after inserted text
  requestAnimationFrame(() => {
    textarea.selectionStart = start + text.length
    textarea.selectionEnd = start + text.length
    textarea.focus()
  })
  return newValue
}

function renderPreview(template: string): string {
  let result = template
  for (const [variable, sample] of Object.entries(SAMPLE_DATA)) {
    result = result.replaceAll(variable, sample)
  }
  return result
}

// Group templates by eventType
function groupByEvent(templates: Template[]): Map<string, Template[]> {
  const map = new Map<string, Template[]>()
  for (const t of templates) {
    const existing = map.get(t.eventType) ?? []
    existing.push(t)
    map.set(t.eventType, existing)
  }
  return map
}

export function TemplateEditor({ listingId, templates, labels }: Props) {
  // Build initial state map keyed by `${eventType}_${channel}`
  const initialState: Record<string, TemplateState> = {}
  for (const t of templates) {
    const key = `${t.eventType}_${t.channel}`
    initialState[key] = {
      subject: t.subject ?? '',
      body: t.bodyTemplate,
      isActive: t.isActive,
      isCustom: t.isCustom,
    }
  }

  const [state, setState] = useState<Record<string, TemplateState>>(initialState)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<Record<string, 'email' | 'sms'>>({})
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set())
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const eventGroups = groupByEvent(templates)

  const toggleExpanded = useCallback((eventType: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventType)) {
        next.delete(eventType)
      } else {
        next.add(eventType)
      }
      return next
    })
  }, [])

  const getTab = (eventType: string): 'email' | 'sms' => {
    return activeTab[eventType] ?? 'email'
  }

  const updateField = (
    eventType: string,
    channel: 'email' | 'sms',
    field: 'subject' | 'body',
    value: string
  ) => {
    const key = `${eventType}_${channel}`
    setState((prev) => {
      const current = prev[key] ?? { subject: '', body: '', isActive: true, isCustom: false }
      return { ...prev, [key]: { ...current, [field]: value } as TemplateState }
    })
    // Clear saved state when editing
    setSavedKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const handleInsertVariable = (eventType: string, channel: 'email' | 'sms', variable: string) => {
    const key = `${eventType}_${channel}`
    const textarea = textareaRefs.current[key]
    if (textarea) {
      const newValue = insertAtCursor(textarea, variable)
      updateField(eventType, channel, 'body', newValue)
    } else {
      // Fallback: append to end
      const current = state[key]?.body ?? ''
      updateField(eventType, channel, 'body', current + variable)
    }
  }

  const handleToggleActive = async (eventType: string) => {
    // Toggle all channels for this event
    const channels: Array<'email' | 'sms'> = ['email', 'sms']
    const firstKey = `${eventType}_email`
    const newActive = !(state[firstKey]?.isActive ?? true)

    for (const channel of channels) {
      const key = `${eventType}_${channel}`
      setState((prev) => {
        const current = prev[key] ?? { subject: '', body: '', isActive: true, isCustom: false }
        return { ...prev, [key]: { ...current, isActive: newActive } }
      })

      await toggleTemplateChannelAction({
        listingId,
        eventType,
        channel,
        isActive: newActive,
      })
    }
  }

  const handleSave = async (eventType: string, channel: 'email' | 'sms') => {
    const key = `${eventType}_${channel}`
    const current = state[key]
    if (!current) return

    setSavingKeys((prev) => new Set(prev).add(key))

    const result = await saveCustomTemplateAction({
      listingId,
      eventType,
      channel,
      subject: channel === 'email' ? current.subject : undefined,
      bodyTemplate: current.body,
    })

    setSavingKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })

    if ('success' in result) {
      setState((prev) => {
        const current = prev[key] ?? { subject: '', body: '', isActive: true, isCustom: false }
        return { ...prev, [key]: { ...current, isCustom: true } }
      })
      setSavedKeys((prev) => new Set(prev).add(key))
      setTimeout(() => {
        setSavedKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }, 2000)
    }
  }

  const handleReset = async (eventType: string, channel: 'email' | 'sms') => {
    if (!confirm(labels.resetConfirm)) return

    const key = `${eventType}_${channel}`

    const result = await resetTemplateAction({
      listingId,
      eventType,
      channel,
    })

    if ('success' in result) {
      // Find the original default template
      const original = templates.find(
        (t) => t.eventType === eventType && t.channel === channel
      )
      setState((prev) => ({
        ...prev,
        [key]: {
          subject: original?.subject ?? '',
          body: original?.bodyTemplate ?? '',
          isActive: prev[key]?.isActive ?? true,
          isCustom: false,
        },
      }))
    }
  }

  return (
    <div className="space-y-4">
      {Array.from(eventGroups.entries()).map(([eventType]) => {
        const isExpanded = expandedEvents.has(eventType)
        const tab = getTab(eventType)
        const emailKey = `${eventType}_email`
        const smsKey = `${eventType}_sms`
        const currentKey = `${eventType}_${tab}`
        const currentState = state[currentKey]
        const isActive = state[emailKey]?.isActive ?? true
        const isSaving = savingKeys.has(currentKey)
        const isSaved = savedKeys.has(currentKey)
        const isCustom = state[currentKey]?.isCustom ?? false

        return (
          <div
            key={eventType}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            {/* Card Header */}
            <button
              type="button"
              onClick={() => toggleExpanded(eventType)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">
                    {labels[`event_${eventType}`] ?? eventType}
                  </span>
                  {isCustom && (
                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#D4764E]">
                      {labels.customBadge}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isActive ? labels.active : labels.inactive}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {labels[`eventDesc_${eventType}`] ?? ''}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {/* Active toggle */}
                <div
                  role="switch"
                  aria-checked={isActive}
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleActive(eventType)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleToggleActive(eventType)
                    }
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    isActive ? 'bg-[#D4764E]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {/* Card Body */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-5 py-4">
                {/* Channel Tabs */}
                <div className="flex gap-1 mb-4 rounded-lg bg-gray-100 p-1 w-fit">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab((prev) => ({ ...prev, [eventType]: 'email' }))
                    }
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === 'email'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {labels.emailTab}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab((prev) => ({ ...prev, [eventType]: 'sms' }))
                    }
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === 'sms'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {labels.smsTab}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Editor */}
                  <div className="space-y-3">
                    {/* Subject (email only) */}
                    {tab === 'email' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {labels.subjectLabel}
                        </label>
                        <input
                          type="text"
                          value={currentState?.subject ?? ''}
                          onChange={(e) =>
                            updateField(eventType, tab, 'subject', e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#D4764E] focus:outline-none focus:ring-1 focus:ring-[#D4764E]/30"
                        />
                      </div>
                    )}

                    {/* Variable insertion bar */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {labels.variablesLabel}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {VARIABLES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleInsertVariable(eventType, tab, v)}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Body textarea */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {labels.bodyLabel}
                      </label>
                      <textarea
                        ref={(el) => {
                          textareaRefs.current[currentKey] = el
                        }}
                        value={currentState?.body ?? ''}
                        onChange={(e) =>
                          updateField(eventType, tab, 'body', e.target.value)
                        }
                        rows={6}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 font-mono placeholder-gray-400 focus:border-[#D4764E] focus:outline-none focus:ring-1 focus:ring-[#D4764E]/30 resize-y"
                      />
                      {/* SMS character count */}
                      {tab === 'sms' && (
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-xs ${
                              (currentState?.body?.length ?? 0) > 160
                                ? 'text-red-600 font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {currentState?.body?.length ?? 0} {labels.charCount}
                          </span>
                          {(currentState?.body?.length ?? 0) > 160 && (
                            <span className="text-xs text-red-500">
                              {labels.charWarning}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {labels.previewLabel}
                    </label>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 min-h-[180px]">
                      {tab === 'email' && currentState?.subject && (
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          <span className="text-xs font-medium text-gray-500">
                            {labels.subjectLabel}:
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">
                            {renderPreview(currentState.subject)}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {renderPreview(currentState?.body ?? '')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleReset(eventType, tab)}
                    disabled={!isCustom}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {labels.reset}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave(eventType, tab)}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-lg bg-[#D4764E] px-4 py-2 text-xs font-medium text-white hover:bg-[#BF6840] transition-colors disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSaving
                      ? labels.saving
                      : isSaved
                        ? labels.saved
                        : labels.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
