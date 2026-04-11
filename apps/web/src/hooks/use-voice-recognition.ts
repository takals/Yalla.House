'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseVoiceRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  finalTranscript: string
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}

const INTERIM_DEBOUNCE_MS = 100

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    language = 'en-GB',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')

  const recognitionRef = useRef<InstanceType<
    typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition
  > | null>(null)
  const interimTimeoutRef = useRef<NodeJS.Timeout>()
  const shouldListenRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
        : null

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language

    let interimTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          setFinalTranscript((prev) => prev + transcript + ' ')
          onResult?.(transcript, true)
        } else {
          interimTranscript += transcript
        }
      }

      // Debounce interim updates
      if (interimTimeoutRef.current) {
        clearTimeout(interimTimeoutRef.current)
      }

      if (interimTranscript) {
        interimTimeoutRef.current = setTimeout(() => {
          setTranscript(interimTranscript)
          onResult?.(interimTranscript, false)
        }, INTERIM_DEBOUNCE_MS)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = event.error || 'Unknown error'

      if (errorMessage === 'not-allowed') {
        onError?.('Microphone permission denied')
      } else if (errorMessage === 'no-speech') {
        onError?.('No speech detected')
      } else if (errorMessage === 'network') {
        onError?.('Network error')
      } else {
        onError?.(errorMessage)
      }

      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)

      // Auto-restart if continuous mode is enabled and we're still supposed to listen
      if (shouldListenRef.current && continuous) {
        try {
          recognition.start()
        } catch {
          // Recognition may already be in the process of starting
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (interimTimeoutRef.current) {
        clearTimeout(interimTimeoutRef.current)
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Already stopped
        }
      }
    }
  }, [continuous, interimResults, language, onResult, onError])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      return
    }

    shouldListenRef.current = true
    setTranscript('')
    setFinalTranscript('')

    try {
      recognitionRef.current.start()
    } catch (error) {
      // May already be running
      if ((error as any)?.message?.includes('already started')) {
        setIsListening(true)
      }
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return
    }

    shouldListenRef.current = false

    try {
      recognitionRef.current.stop()
    } catch {
      // Already stopped
    }

    setIsListening(false)
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    isSupported,
    transcript,
    finalTranscript,
    startListening,
    stopListening,
    toggleListening,
  }
}
