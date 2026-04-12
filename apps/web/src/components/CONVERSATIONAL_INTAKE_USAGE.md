# ConversationalIntake Component — Usage Guide

## Overview
A production-ready, reusable conversational form component for Next.js 14 that replaces traditional multi-step forms with a chat-based interface. Supports Owner Brief, Hunter Passport, and Agent Profile flows.

## Location
`/src/components/conversational-intake.tsx` (503 lines, single-file, production-quality)

## Quick Start

```tsx
'use client'

import { ConversationalIntake } from '@/components/conversational-intake'

export function HunterPassportPage() {
  const handleComplete = async (data) => {
    // Send to server action
    await savePassportAction(data)
  }

  return (
    <ConversationalIntake
      flowId="hunter-passport"
      steps={[
        {
          id: 'intent',
          question: 'What are you looking for?',
          type: 'select',
          options: [
            { value: 'primary', label: 'Primary residence' },
            { value: 'investment', label: 'Investment property' },
          ],
        },
        {
          id: 'budget_min',
          question: 'What's your minimum budget?',
          type: 'number',
          validation: { required: true },
        },
      ]}
      onComplete={handleComplete}
      existingData={{ intent: 'primary' }} // For returning users
      translations={{
        greeting: 'Welcome! Let's build your home passport.',
        placeholder: 'Type your answer...',
        send: 'Send',
        reviewTitle: 'Review your brief',
        reviewEditBtn: 'Edit',
        submitBtn: 'Submit Brief',
        progressLabel: (current, total) => `${current} of ${total}`,
        errorMsg: 'Something went wrong. Please try again.',
      }}
    />
  )
}
```

## Component Architecture

### Props (IntakeFlowConfig)
- **flowId**: string — Identifier (e.g., 'owner-brief', 'hunter-passport', 'agent-profile')
- **steps**: IntakeStep[] — Question definitions
- **onComplete**: function — Callback with collected data; can be async
- **existingData?**: object — Pre-fill for returning users
- **translations**: object — All UI strings (greeting, placeholder, buttons, etc.)

### Step Definition (IntakeStep)
```typescript
{
  id: 'budget_range',                      // Matches field name in output
  question: 'What's your budget?',         // Displayed in chat
  type: 'number',                          // text | select | multi-select | number | range | toggle | chips
  options?: [                              // For select/multi-select/chips only
    { value: 'value', label: 'Display' }
  ],
  validation?: {
    required?: boolean,
    min?: number,
    max?: number,
    pattern?: string,
    errorMsg?: string,
  },
  followUp?: [                             // Conditional sub-questions
    {
      condition: (answer) => answer === 'investment',
      steps: [ /* nested steps */ ]
    }
  ],
  helperText?: 'Hint shown above input'
}
```

## UI Layout

### Desktop (lg and up)
- **Left panel** (2/3): Chat conversation
  - Yalla messages (orange "Y" avatar, light grey bubble)
  - User replies (right-aligned, orange bubble)
  - Auto-scrolling message area
  - Input with send button
  - Option buttons for select/multi-select types
  - "Yalla is thinking" indicator

- **Right panel** (1/3, sticky): Brief Card
  - Progress bar (X of Y completed)
  - Live field list with checkmarks
  - Clickable fields for inline edit
  - Dark card (#0F1117) with white text

### Mobile (< lg)
- Panels stack vertically
- Chat on top, brief card scrolls below
- Full-width input at bottom

## Key Features

### 1. Multi-step Flow
- Questions advance automatically after answer
- Supports unlimited steps
- Progress tracking in live brief card

### 2. Smart Input Parsing
```typescript
type: 'text'          // Accepts any string
type: 'number'        // Auto-validates integer input
type: 'select'        // Click option or type to match
type: 'multi-select'  // Multiple selections, auto-submit when > 0
type: 'chips'         // Visual chip buttons
type: 'range'         // Min/max number inputs (future)
type: 'toggle'        // Yes/No toggle (future)
```

### 3. Conditional Follow-ups
When a user answers, automatically inject follow-up questions based on condition:
```typescript
followUp: [
  {
    condition: (value) => value === 'investment',
    steps: [
      {
        id: 'expected_roi',
        question: 'What ROI do you target?',
        type: 'number',
      }
    ]
  }
]
```

### 4. Inline Field Editing
Click any field in the Brief Card to re-open that question in the chat and update the answer.

### 5. Review & Submit
After all questions answered:
- Show "Review your brief" summary
- Brief card shows all filled fields with edit buttons
- Submit button calls onComplete with full data object
- Loading state while submitting

### 6. Validation
- Required fields
- Min/max for numbers
- Custom error messages
- All caught before submission

## Color Tokens Used

From `tailwind.config.ts`:
- `#D4764E` — Brand orange (buttons, avatars, highlights)
- `#0F1117` — Dark sidebar (brief card background)
- `#FFFFFF` — Chat surface
- `#E2E4EB` — Border light
- `#F5F5F7` — Background soft (Yalla message bubble)
- `#5E6278` — Text secondary

All hardcoded in component to ensure consistency with Yalla.House brand.

## Output Format

`onComplete` receives a flat object:
```typescript
{
  intent: 'primary',
  budget_min: 250000,
  budget_max: 500000,
  target_areas: ['East London', 'Zone 2'],
  property_types: ['flat', 'terraced'],
  min_bedrooms: 2,
  must_haves: ['Balcony', 'Near station'],
  dealbreakers: ['No auctions'],
  finance_status: 'mortgage_approved',
  timeline: '3m',
}
```

## TypeScript Support
- Full `strict` mode
- Exported `IntakeStep` and `IntakeFlowConfig` types for use in config files
- Type-safe callback with `Record<string, unknown>`

## Responsive & Accessible
- Mobile-first Tailwind classes
- Keyboard navigation (Enter to send)
- Focus management (input auto-focused after each message)
- ARIA labels for icons
- Auto-scroll to latest message

## Performance
- No external dependencies beyond React + Lucide
- Single component file (503 lines) — no sub-components
- Efficient re-renders via controlled state
- Message list doesn't re-render entire history on each update

## Next Steps (When Integrating)

1. **Create flow config file** (e.g., `src/lib/intake-flows/hunter-passport.ts`)
   - Define all steps with options and validations
   - Keep configs DRY with shared translations

2. **Server action for onComplete**
   ```typescript
   // app/[locale]/hunter/passport/actions.ts
   'use server'
   export async function savePassportAction(data: Record<string, unknown>) {
     const supabase = createClient()
     await supabase.from('hunter_passports').insert({ ...data })
   }
   ```

3. **Wire into page**
   ```typescript
   // app/[locale]/hunter/passport/page.tsx
   import { ConversationalIntake } from '@/components/conversational-intake'
   import { hunterPassportFlow } from '@/lib/intake-flows/hunter-passport'

   export default function PassportPage() {
     return <ConversationalIntake {...hunterPassportFlow} />
   }
   ```

## Known Limitations / Future Enhancements

- `type: 'range'` (min/max inputs) — skeleton, not wired
- `type: 'toggle'` (yes/no) — skeleton, not wired
- File uploads — not currently supported
- Date picker — not currently supported
- Multi-language i18n — all strings in translations object; can integrate with next-intl

## Testing the Component

```tsx
// Minimal example
<ConversationalIntake
  flowId="test"
  steps={[
    { id: 'name', question: 'What's your name?', type: 'text' },
    { id: 'age', question: 'How old are you?', type: 'number' },
  ]}
  onComplete={(data) => console.log(data)}
  translations={{
    greeting: 'Hello!',
    placeholder: 'Type...',
    send: 'Send',
    reviewTitle: 'Review',
    reviewEditBtn: 'Edit',
    submitBtn: 'Done',
    progressLabel: (c, t) => `${c}/${t}`,
    errorMsg: 'Error',
  }}
/>
```

---

**Component built:** April 2026  
**Location:** `/sessions/tender-sleepy-mayer/mnt/Yalla.House/apps/web/src/components/conversational-intake.tsx`
