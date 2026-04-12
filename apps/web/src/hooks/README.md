# Yalla.House React Hooks

Three production-quality hooks for intake flows, voice input, and intelligent data extraction.

## Installation

All hooks are available from `@/hooks`:

```typescript
import {
  useVoiceRecognition,
  useIntakeMemory,
  useSmartParser,
} from '@/hooks'
```

---

## useVoiceRecognition

Browser-native Web Speech API wrapper for real-time voice transcription.

### API

```typescript
interface UseVoiceRecognitionOptions {
  language?: string              // default 'en-GB'
  continuous?: boolean           // default true (auto-restart)
  interimResults?: boolean       // default true (show live transcription)
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

interface UseVoiceRecognitionReturn {
  isListening: boolean           // Currently recording
  isSupported: boolean           // Browser supports Web Speech API
  transcript: string             // Current interim text (debounced ~100ms)
  finalTranscript: string        // Last finalized speech
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
}
```

### Features

- Auto-detects browser support (Chrome, Edge, Safari, Firefox with polyfill)
- Graceful permission handling (not-allowed, no-speech, network errors)
- Auto-restart in continuous mode (until explicitly stopped)
- Debounced interim updates to prevent flickering
- Automatic cleanup on unmount
- Ref-based recognition instance to avoid re-creation

### Example

```typescript
'use client'

import { useVoiceRecognition } from '@/hooks'

export function SearchByVoice() {
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    language: 'en-GB',
    onResult: (text, isFinal) => {
      if (isFinal) {
        console.log('Final:', text)
      }
    },
    onError: (error) => {
      console.error('Voice error:', error)
    },
  })

  if (!isSupported) {
    return <p>Voice input not supported on this browser</p>
  }

  return (
    <div>
      <button
        onClick={isListening ? stopListening : startListening}
        className={isListening ? 'recording' : ''}
      >
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      {transcript && <p>You said: {transcript}</p>}
    </div>
  )
}
```

### Browser Support

- Chrome 25+
- Edge 79+
- Safari 14.1+
- Firefox (experimental, requires polyfill)

---

## useIntakeMemory

Persistent user memory for intake flows — remembers previously entered data so returning users don't repeat themselves.

### API

```typescript
interface UseIntakeMemoryOptions {
  flowId: string  // 'owner-brief' | 'hunter-passport' | 'agent-profile'
  userId: string  // Current user ID from auth
}

interface IntakeMemoryEntry {
  field: string
  value: unknown
  source: 'voice' | 'text' | 'click'
  confidence: number  // 0-1
  timestamp: string   // ISO 8601
}

interface UseIntakeMemoryReturn {
  memories: Record<string, IntakeMemoryEntry>
  isLoading: boolean
  remember: (
    field: string,
    value: unknown,
    source: 'voice' | 'text' | 'click',
    confidence?: number
  ) => Promise<void>
  recall: (field: string) => IntakeMemoryEntry | null
  recallAll: () => Record<string, IntakeMemoryEntry>
  forget: (field: string) => Promise<void>
  hasMemory: (field: string) => boolean
  getGreeting: () => string | null  // Personalized greeting if memories exist
}
```

### Features

- Supabase-backed storage in `intake_memories` table
- Optimistic UI updates with rollback on error
- Automatic confidence scoring by source (voice: 0.85, text: 0.95, click: 1.0)
- Most recent entry per field (keyed by creation timestamp)
- Soft-delete support (sets `deleted_at`)
- Personalized greeting generation from stored memories
- Type-safe with full TypeScript support

### Example

```typescript
'use client'

import { useIntakeMemory } from '@/hooks'
import { useEffect } from 'react'

export function HunterPassportForm() {
  const userId = 'user-123' // from auth context
  const { memories, remember, recall, isLoading, getGreeting } = useIntakeMemory({
    flowId: 'hunter-passport',
    userId,
  })

  useEffect(() => {
    // On mount, show greeting if memories exist
    const greeting = getGreeting()
    if (greeting) {
      console.log(greeting)
      // e.g., "Welcome back! I remember you're interested in East London, looking for 2 bedrooms..."
    }
  }, [getGreeting])

  const handleLocationChange = async (location: string) => {
    await remember('location', location, 'text')
  }

  const handleVoiceLocation = async (location: string) => {
    await remember('location', location, 'voice', 0.9)
  }

  const previousLocation = recall('location')

  return (
    <div>
      {isLoading && <p>Loading your preferences...</p>}
      {previousLocation && (
        <p>
          Last location: {previousLocation.value} (
          {Math.round(previousLocation.confidence * 100)}% confident)
        </p>
      )}
      <input
        onChange={(e) => handleLocationChange(e.target.value)}
        placeholder="Where are you looking?"
      />
    </div>
  )
}
```

### Database Schema

Required table `intake_memories`:

```sql
CREATE TABLE intake_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  field TEXT NOT NULL,
  value JSONB,
  source TEXT CHECK (source IN ('voice', 'text', 'click')),
  confidence NUMERIC(3,2) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (flow_id, user_id, field) -- most recent per field
);

CREATE INDEX idx_intake_memories_user_flow ON intake_memories(user_id, flow_id, deleted_at);
```

---

## useSmartParser

Pattern-matching parser for extracting structured data from free-text intake responses.

### API

```typescript
export interface StepConfig {
  id: string
  type:
    | 'bedrooms'
    | 'budget'
    | 'location'
    | 'property-type'
    | 'timeline'
    | 'finance'
    | 'must-haves'
    | 'intent'
    | string
  label: string
  expectedType?: string
}

export interface ParseResult {
  field: string
  value: unknown
  confidence: number  // 0-1
}

export function parseIntakeResponse(
  text: string,
  currentStep: StepConfig,
  allSteps?: StepConfig[]
): ParseResult[]

export function useSmartParser() {
  return { parseIntakeResponse }
}
```

### Features

- Pattern matching for UK property terms:
  - **Bedrooms**: "2 bed", "two bedroom", "3br" → extracts number
  - **Budget**: "under 500k", "£450,000", "max 2000 pcm" → normalizes to pence/pounds
  - **Location**: "East London", "E3", postcodes ("SW1A 1AA" → "SW1") → extracts area code
  - **Property types**: "flat", "terraced", "semi", "detached", "new build", "period"
  - **Timeline**: "asap", "3 months", "next year", "no rush"
  - **Finance**: "cash buyer", "mortgage approved", "MIP"
  - **Must-haves**: "garden", "parking", "balcony", "near station"
  - **Intent**: "buying", "renting", "selling"
- Confidence scoring (0-1, where 1.0 is 100% certain)
- Bonus field detection: scans for fields not currently active
- Normalizes values to expected format (e.g., "500k" → 500000)
- Type-safe TypeScript with full pattern matcher exports

### Example

```typescript
'use client'

import { useSmartParser } from '@/hooks'

export function IntakeStep() {
  const { parseIntakeResponse } = useSmartParser()

  const handleUserInput = (userText: string) => {
    const results = parseIntakeResponse(userText, {
      id: 'step-1',
      type: 'location',
      label: 'Where are you looking?',
    })

    results.forEach((result) => {
      console.log(`${result.field}: ${result.value} (confidence: ${result.confidence})`)
      // Example output:
      // location: SW1 (confidence: 0.95)
      // bedrooms: 2 (confidence: 0.7)  — bonus field from "looking for a 2-bed in SW1"
    })
  }

  return (
    <textarea
      onBlur={(e) => handleUserInput(e.target.value)}
      placeholder="Tell me about what you're looking for..."
    />
  )
}
```

### Example Outputs

**Input:** "I'm looking for a 2-bed flat in East London, max £600k"

```javascript
[
  { field: 'location', value: 'E', confidence: 0.95 },
  { field: 'bedrooms', value: 2, confidence: 0.9 },
  { field: 'property_type', value: 'flat', confidence: 0.85 },
  { field: 'budget', value: 600000, confidence: 0.85 },
]
```

**Input:** "Renting, need garden and parking, flexible on timeline"

```javascript
[
  { field: 'intent', value: 'renting', confidence: 0.95 },
  { field: 'must_haves', value: ['garden', 'parking'], confidence: 0.8 },
]
```

---

## Integration Example: Full Intake Flow

```typescript
'use client'

import { useVoiceRecognition, useIntakeMemory, useSmartParser } from '@/hooks'
import { useState } from 'react'

export function FullIntakeFlow({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState<'location' | 'bedrooms'>('location')
  const [userInput, setUserInput] = useState('')

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition()
  const { remember, recall, getGreeting } = useIntakeMemory({
    flowId: 'hunter-passport',
    userId,
  })
  const { parseIntakeResponse } = useSmartParser()

  const handleSubmit = async () => {
    const textToAnalyze = userInput || transcript
    const results = parseIntakeResponse(textToAnalyze, {
      id: currentStep,
      type: currentStep as any,
      label: `What's your ${currentStep}?`,
    })

    for (const result of results) {
      const source = userInput ? 'text' : 'voice'
      await remember(result.field, result.value, source, result.confidence)
    }

    setUserInput('')
    setCurrentStep(currentStep === 'location' ? 'bedrooms' : 'location')
  }

  return (
    <div>
      <h2>{getGreeting() || 'Welcome to your search!'}</h2>

      <div>
        <label>What's your {currentStep}?</label>

        {/* Text input option */}
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Tell me about your ${currentStep}...`}
        />

        {/* Voice input option */}
        <button onClick={isListening ? stopListening : startListening}>
          {isListening ? 'Stop recording' : 'Speak'}
        </button>

        {transcript && <p>Heard: {transcript}</p>}

        {/* Show previous answer */}
        {recall(currentStep) && (
          <p>Last answer: {recall(currentStep)!.value}</p>
        )}

        <button onClick={handleSubmit}>Next</button>
      </div>
    </div>
  )
}
```

---

## Testing

All hooks are designed for easy testing:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useIntakeMemory } from '@/hooks'

it('remembers user input', async () => {
  const { result } = renderHook(() =>
    useIntakeMemory({ flowId: 'test', userId: 'test-user' })
  )

  await act(async () => {
    await result.current.remember('location', 'E3', 'text')
  })

  expect(result.current.hasMemory('location')).toBe(true)
  expect(result.current.recall('location')!.value).toBe('E3')
})
```

---

## Performance Notes

- **useVoiceRecognition**: Minimal memory footprint; cleanup on unmount prevents double-registration
- **useIntakeMemory**: Fetches on mount; subsequent updates are optimistic with fallback
- **useSmartParser**: Zero runtime cost (pure function); memoized via useMemo in hook wrapper

All three are suitable for production use in high-traffic intake flows.
