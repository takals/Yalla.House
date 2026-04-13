'use client'

import { useState, useCallback, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { ConversationalIntake, type IntakeFlowConfig } from '@/components/conversational-intake'
import { useVoiceRecognition } from '@/hooks/use-voice-recognition'
import { useIntakeMemory } from '@/hooks/use-intake-memory'
import { getAgentProfileFlow } from '@/lib/intake-flows/agent-profile'

interface AgentProfileIntakeProps {
  userId: string
  existingProfile?: Record<string, unknown> | null
  translations: Record<string, string>
}

export function AgentProfileIntake({
  userId,
  existingProfile = null,
  translations,
}: AgentProfileIntakeProps) {
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
    flowId: 'agent-profile',
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
            flowId: 'agent-profile',
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

        console.log('Agent profile intake completed:', data)
      } catch (error) {
        console.error('Failed to save agent profile intake:', error)
        throw error
      }
    },
    [voiceEnabled, memories]
  )

  const steps = getAgentProfileFlow(translations)

  const flowConfig: IntakeFlowConfig = {
    flowId: 'agent-profile',
    steps,
    onComplete: handleComplete,
    existingData,
    externalInput: voiceEnabled ? voiceInput : undefined,
    translations: {
      greeting: translations.greeting || 'Welcome! Let\'s set up your agent profile.',
      placeholder: translations.placeholder || 'Type your answer...',
      send: translations.send || 'Send',
      reviewTitle: translations.reviewTitle || 'Great! Review your profile below.',
      reviewEditBtn: translations.reviewEditBtn || 'Edit',
      submitBtn: translations.submitBtn || 'Save Profile',
      progressLabel: (current, total) => `${current} of ${total}`,
      errorMsg: translations.errorMsg || 'Something went wrong. Please try again.',
    },
  }

  if (memoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4764E]" />
          <p className="mt-4 text-[#5E6278]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      <ConversationalIntake {...flowConfig} />

      {/* Voice toggle button (fixed position) */}
      {isVoiceSupported && (
        <button
          onClick={() => {
            setVoiceEnabled(!voiceEnabled)
            if (!voiceEnabled) {
              toggleListening()
            }
          }}
          className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full transition-all z-50 ${
            voiceEnabled
              ? 'bg-[#D4764E] text-white shadow-lg'
              : 'bg-[#F5F5F7] text-[#0F1117] border border-[#E2E4EB] hover:bg-[#E2E4EB]'
          }`}
          title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
        >
          {isListening ? <Mic size={20} /> : <MicOff size={20} />}
          <span className="text-sm font-medium">Voice AI</span>
        </button>
      )}

      {/* Voice indicator */}
      {voiceEnabled && isListening && (
        <div className="fixed bottom-20 right-6 bg-[#D4764E] text-white rounded-lg px-4 py-2 text-xs font-medium z-50 animate-pulse">
          Listening...
        </div>
      )}
    </div>
  )
}
