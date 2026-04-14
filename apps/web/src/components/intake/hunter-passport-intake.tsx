'use client'

import { useState, useCallback, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { ConversationalIntake, type IntakeFlowConfig } from '@/components/conversational-intake'
import { useVoiceRecognition } from '@/hooks/use-voice-recognition'
import { useIntakeMemory } from '@/hooks/use-intake-memory'
import { getHunterPassportFlow } from '@/lib/intake-flows/hunter-passport'

interface HunterPassportIntakeProps {
  userId: string
  existingProfile?: Record<string, unknown> | null
  userName?: string | null
  translations: Record<string, string>
}

export function HunterPassportIntake({
  userId,
  existingProfile = null,
  userName = null,
  translations,
}: HunterPassportIntakeProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceInput, setVoiceInput] = useState('')

  // Voice recognition
  const {
    isListening,
    isSupported: isVoiceSupported,
    transcript,
    toggleListening,
  } = useVoiceRecognition({
    language: 'en-GB',
    continuous: true,
    interimResults: true,
    onResult: (transcribed) => {
      setVoiceInput(transcribed)
    },
    onError: (error) => {
      console.error('Voice recognition error:', error)
    },
  })

  // Memory hook
  const { memories, isLoading: memoriesLoading, recallAll } = useIntakeMemory({
    flowId: 'hunter-passport',
    userId,
  })

  // Prepare existing data (profile + memories)
  const existingData = {
    ...existingProfile,
    ...Object.entries(recallAll()).reduce(
      (acc, [field, entry]) => {
        acc[field] = entry.value
        return acc
      },
      {} as Record<string, unknown>
    ),
  }

  // Build greeting with user context
  const buildGreeting = () => {
    const parts = [translations.greeting || 'Welcome to the Yalla Home Passport!']

    if (userName) {
      parts[0] = `Hi ${userName}! ${parts[0]}`
    }

    if (Object.keys(memories).length > 0) {
      parts.push(translations.welcomeBack || "I've remembered some of your preferences from before.")
    }

    return parts.join(' ')
  }

  // Clear voiceInput after it's been consumed
  useEffect(() => {
    if (voiceInput) {
      const timer = setTimeout(() => setVoiceInput(''), 100)
      return () => clearTimeout(timer)
    }
  }, [voiceInput])

  const handleComplete = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        // Save to intake API + memories
        const response = await fetch('/api/intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flowId: 'hunter-passport',
            data,
            messages: [], // Could track messages here if needed
            voiceUsed: voiceEnabled,
            fieldsFromMemory: Object.keys(memories).length,
            fieldsTotal: Object.keys(data).length,
          }),
        })

        if (!response.ok) {
          throw new Error(`Intake API error: ${response.statusText}`)
        }

        // Call parent onComplete handler if provided
        console.log('Hunter passport intake completed:', data)
      } catch (error) {
        console.error('Failed to save hunter passport intake:', error)
        throw error
      }
    },
    [voiceEnabled, memories]
  )

  const steps = getHunterPassportFlow(translations)

  const flowConfig: IntakeFlowConfig = {
    flowId: 'hunter-passport',
    steps,
    onComplete: handleComplete,
    existingData,
    externalInput: voiceEnabled ? voiceInput : undefined,
    translations: {
      greeting: buildGreeting(),
      placeholder: translations.placeholder || 'Type your answer...',
      send: translations.send || 'Send',
      reviewTitle: translations.reviewTitle || 'All set! Review your answers below.',
      reviewEditBtn: translations.reviewEditBtn || 'Edit',
      submitBtn: translations.submitBtn || 'Save Passport',
      progressLabel: (current, total) => `${current} of ${total}`,
      errorMsg: translations.errorMsg || 'Something went wrong. Please try again.',
    },
  }

  if (memoriesLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4764E]" />
          <p className="mt-4 text-[#5E6278]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <ConversationalIntake {...flowConfig} />

      {/* Voice toggle button */}
      <button
        onClick={() => {
          if (!isVoiceSupported) return
          setVoiceEnabled(!voiceEnabled)
          if (!voiceEnabled) toggleListening()
        }}
        className={`fixed bottom-20 right-6 flex items-center gap-2 px-4 py-3 rounded-full transition-all z-40 shadow-lg ${
          voiceEnabled && isListening
            ? 'bg-[#D4764E] text-white ring-4 ring-[#D4764E]/30 animate-pulse'
            : voiceEnabled
              ? 'bg-[#D4764E] text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-[#D4764E] hover:bg-orange-50'
        } ${!isVoiceSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
        title={!isVoiceSupported ? 'Voice not supported in this browser' : voiceEnabled ? 'Voice active — tap to disable' : 'Enable voice input'}
      >
        {voiceEnabled && isListening ? <Mic size={18} className="animate-pulse" /> : <Mic size={18} />}
        <span className="text-sm font-semibold">
          {voiceEnabled && isListening ? 'Listening...' : 'Voice AI'}
        </span>
      </button>
    </div>
  )
}
