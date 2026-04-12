# Hook Usage Examples

Real-world integration patterns for the three intake hooks.

## Example 1: Multi-Step Voice Intake Form

A complete hunter passport intake flow with voice, memory, and parsing.

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVoiceRecognition, useIntakeMemory, useSmartParser } from '@/hooks'

interface Step {
  id: string
  type: 'location' | 'bedrooms' | 'budget' | 'property-type'
  label: string
  description?: string
}

const STEPS: Step[] = [
  {
    id: '1',
    type: 'location',
    label: 'Where are you looking?',
    description: 'Tell us the area or postcode',
  },
  {
    id: '2',
    type: 'bedrooms',
    label: 'How many bedrooms?',
    description: 'Say a number, e.g., "two" or "2"',
  },
  {
    id: '3',
    type: 'budget',
    label: 'What\'s your budget?',
    description: 'E.g., "under 500k" or "up to 2000 a month"',
  },
  {
    id: '4',
    type: 'property-type',
    label: 'What type of property?',
    description: 'Flat, terraced, detached, etc.',
  },
]

export function HunterIntakeFlow({ userId }: { userId: string }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const currentStep = STEPS[stepIndex]
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
    language: 'en-GB',
  })

  const { memories, remember, getGreeting } = useIntakeMemory({
    flowId: 'hunter-passport',
    userId,
  })

  const { parseIntakeResponse } = useSmartParser()

  // Show greeting on first load
  useEffect(() => {
    if (stepIndex === 0) {
      const greeting = getGreeting()
      if (greeting) {
        console.log('Greeting:', greeting)
      }
    }
  }, [stepIndex, getGreeting])

  const handleSubmitStep = async () => {
    const textToAnalyze = transcript.trim()
    if (!textToAnalyze) return

    const results = parseIntakeResponse(textToAnalyze, {
      id: currentStep.id,
      type: currentStep.type,
      label: currentStep.label,
    })

    // Store results
    for (const result of results) {
      await remember(result.field, result.value, 'voice', result.confidence)
    }

    // Move to next step
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">All set!</h2>
        <p>
          We found {Object.keys(memories).length} preferences from your answers.
        </p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(memories, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`h-2 flex-1 rounded ${
              idx < stepIndex
                ? 'bg-green-500'
                : idx === stepIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div>
        <h2 className="text-xl font-bold mb-2">{currentStep.label}</h2>
        {currentStep.description && (
          <p className="text-gray-600 text-sm">{currentStep.description}</p>
        )}
      </div>

      {/* Voice indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-4 py-2 rounded font-semibold transition ${
            isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isListening ? 'Listening...' : 'Start Recording'}
        </button>
      </div>

      {/* Transcript display */}
      {transcript && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            You said:
          </p>
          <p className="text-lg text-blue-800">{transcript}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmitStep}
        disabled={!transcript}
        className={`px-6 py-3 rounded font-semibold transition ${
          transcript
            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>

      {/* Progress text */}
      <p className="text-sm text-gray-500 text-center">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
    </div>
  )
}
```

---

## Example 2: Smart Text Parser with Memory Fallback

A form that intelligently extracts data from free-form text and remembers values.

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useIntakeMemory, useSmartParser } from '@/hooks'

export function SmartPropertySearch({ userId }: { userId: string }) {
  const [userInput, setUserInput] = useState('')
  const [parsedData, setParsedData] = useState<Record<string, unknown>>({})

  const { recall, remember } = useIntakeMemory({
    flowId: 'property-search',
    userId,
  })

  const { parseIntakeResponse } = useSmartParser()

  const handleAnalyze = async () => {
    const results = parseIntakeResponse(userInput, {
      id: 'search',
      type: 'bedrooms',
      label: 'Property Search',
    })

    const data: Record<string, unknown> = {}

    for (const result of results) {
      data[result.field] = result.value
      await remember(result.field, result.value, 'text', result.confidence)
    }

    setParsedData(data)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">
          Describe what you're looking for
        </label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="E.g., I'm looking for a 2-bed flat in East London with parking, max £600k"
          className="w-full h-32 p-3 border rounded"
        />
      </div>

      <button
        onClick={handleAnalyze}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Analyze
      </button>

      {Object.keys(parsedData).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold mb-3">Parsed Information:</h3>
          <div className="space-y-2">
            {Object.entries(parsedData).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">{key}:</span>
                <span className="text-gray-600">
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show remembered values */}
      <details className="mt-6 p-3 bg-gray-50 rounded cursor-pointer">
        <summary className="font-semibold">Previous answers</summary>
        <div className="mt-3 space-y-2">
          {['location', 'bedrooms', 'budget'].map((field) => {
            const memory = recall(field)
            return memory ? (
              <div key={field} className="text-sm">
                <span className="font-semibold">{field}:</span>{' '}
                {String(memory.value)} ({Math.round(memory.confidence * 100)}%)
              </div>
            ) : null
          })}
        </div>
      </details>
    </div>
  )
}
```

---

## Example 3: Real-time Voice Feedback

A component that gives real-time feedback as the user speaks.

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVoiceRecognition, useSmartParser } from '@/hooks'

export function VoiceFeedback() {
  const [feedback, setFeedback] = useState<string>('')
  const [recognizedFields, setRecognizedFields] = useState<string[]>([])

  const { isListening, transcript, startListening } = useVoiceRecognition({
    onResult: (text, isFinal) => {
      if (!isFinal) {
        // Live parsing of interim results
        analyzeSpeech(text)
      }
    },
  })

  const { parseIntakeResponse } = useSmartParser()

  const analyzeSpeech = (text: string) => {
    if (!text.trim()) {
      setFeedback('')
      return
    }

    const results = parseIntakeResponse(text, {
      id: 'analyze',
      type: 'bedrooms',
      label: 'Analysis',
    })

    if (results.length === 0) {
      setFeedback('Listening for property details...')
    } else {
      const fields = results.map((r) => r.field)
      setRecognizedFields(fields)
      setFeedback(
        `Got it! I found: ${fields.join(', ')}`
      )
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={startListening}
        className={`px-4 py-2 rounded font-semibold ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-blue-500 text-white'
        }`}
      >
        {isListening ? 'Recording...' : 'Start'}
      </button>

      {transcript && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-900">Heard:</p>
          <p className="text-blue-800">{transcript}</p>
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">{feedback}</p>
        </div>
      )}

      {recognizedFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recognizedFields.map((field) => (
            <span
              key={field}
              className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm"
            >
              ✓ {field}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Example 4: Progressive Disclosure with Memory

Show different form sections based on what's already been remembered.

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useIntakeMemory } from '@/hooks'

export function ProgressiveForm({ userId }: { userId: string }) {
  const { memories, remember, recallAll } = useIntakeMemory({
    flowId: 'owner-brief',
    userId,
  })

  const handlePropertyAddress = async (address: string) => {
    await remember('address', address, 'text')
  }

  const handleAskingPrice = async (price: number) => {
    await remember('asking_price', price, 'click')
  }

  // Only show "selling reason" section if we have address
  const hasAddress = 'address' in memories

  return (
    <form className="space-y-6 max-w-2xl">
      {/* Section 1: Basic details */}
      <section className="p-4 border rounded">
        <h3 className="font-bold mb-3">Property Details</h3>
        <input
          type="text"
          placeholder="Property address"
          onBlur={(e) => handlePropertyAddress(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
      </section>

      {/* Section 2: Selling reason (conditional) */}
      {hasAddress && (
        <section className="p-4 border border-green-300 bg-green-50 rounded animate-in">
          <h3 className="font-bold mb-3">Why are you selling?</h3>
          <select className="w-full p-2 border rounded">
            <option>Moving</option>
            <option>Downsizing</option>
            <option>Upsizing</option>
            <option>Investment</option>
          </select>
        </section>
      )}

      {/* Section 3: Price (conditional) */}
      {hasAddress && (
        <section className="p-4 border rounded">
          <h3 className="font-bold mb-3">Asking Price</h3>
          <input
            type="number"
            placeholder="£"
            onBlur={(e) => handleAskingPrice(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </section>
      )}

      {/* Summary of remembered data */}
      <details className="p-3 bg-gray-50 rounded">
        <summary className="cursor-pointer font-semibold">
          Saved ({Object.keys(memories).length})
        </summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(recallAll(), null, 2)}
        </pre>
      </details>
    </form>
  )
}
```

---

## Example 5: Testing the Hooks

Unit test examples for all three hooks.

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useVoiceRecognition,
  useIntakeMemory,
  useSmartParser,
} from '@/hooks'

describe('useVoiceRecognition', () => {
  it('detects browser support', () => {
    const { result } = renderHook(() => useVoiceRecognition())
    expect(typeof result.current.isSupported).toBe('boolean')
  })

  it('calls onResult with transcripts', async () => {
    const onResult = jest.fn()
    const { result } = renderHook(() =>
      useVoiceRecognition({ onResult })
    )

    act(() => {
      result.current.startListening()
    })

    expect(result.current.isListening).toBe(true)
  })
})

describe('useIntakeMemory', () => {
  it('remembers user input', async () => {
    const { result } = renderHook(() =>
      useIntakeMemory({
        flowId: 'test-flow',
        userId: 'test-user',
      })
    )

    await act(async () => {
      await result.current.remember('location', 'E3', 'text', 0.95)
    })

    expect(result.current.hasMemory('location')).toBe(true)
    expect(result.current.recall('location')?.value).toBe('E3')
  })

  it('generates personalized greetings', async () => {
    const { result } = renderHook(() =>
      useIntakeMemory({
        flowId: 'hunter-passport',
        userId: 'test-user',
      })
    )

    await act(async () => {
      await result.current.remember('location', 'East London', 'text')
      await result.current.remember('bedrooms', 2, 'voice')
    })

    const greeting = result.current.getGreeting()
    expect(greeting).toContain('East London')
    expect(greeting).toContain('2')
  })
})

describe('useSmartParser', () => {
  it('parses bedroom count', () => {
    const { result } = renderHook(() => useSmartParser())

    const parsed = result.current.parseIntakeResponse(
      'I need a 2-bed flat',
      {
        id: '1',
        type: 'bedrooms',
        label: 'Bedrooms',
      }
    )

    expect(parsed).toContainEqual(
      expect.objectContaining({
        field: 'bedrooms',
        value: 2,
      })
    )
  })

  it('parses UK postcodes', () => {
    const { result } = renderHook(() => useSmartParser())

    const parsed = result.current.parseIntakeResponse(
      'Looking in SW1A 1AA area',
      {
        id: '1',
        type: 'location',
        label: 'Location',
      }
    )

    expect(parsed).toContainEqual(
      expect.objectContaining({
        field: 'location',
        value: 'SW1',
      })
    )
  })

  it('parses budget values', () => {
    const { result } = renderHook(() => useSmartParser())

    const parsed = result.current.parseIntakeResponse(
      'Max £500,000',
      {
        id: '1',
        type: 'budget',
        label: 'Budget',
      }
    )

    expect(parsed).toContainEqual(
      expect.objectContaining({
        field: 'budget',
        value: 500000,
      })
    )
  })
})
```

---

## Performance Considerations

1. **Voice Recognition**: Debounces interim updates at 100ms to prevent UI thrashing
2. **Memory Fetches**: Fetched once on mount, subsequent updates are optimistic
3. **Parser**: Zero memory cost—pure function, no state
4. **Confidence**: High confidence (0.95+) for exact matches; lower (0.7) for incidental mentions

---

## Accessibility Notes

- Voice recognition provides real-time transcript feedback
- All buttons labeled clearly
- Memory recall enables screen-reader friendly summaries
- Parser output includes confidence scores for user review

---

## Production Checklist

- [ ] Supabase table created: `intake_memories` with proper indexes
- [ ] User authentication integrated with `useIntakeMemory`
- [ ] Web Speech API fallback plan for unsupported browsers
- [ ] Analytics tracking added to remember/recall calls
- [ ] Error boundaries added around voice components
- [ ] Confidence thresholds adjusted based on domain data
- [ ] i18n strings added for voice/parser feedback
