'use client'

import { useState } from 'react'
import { ProfileForm } from './profile-form'
import { AgentProfileIntake } from '@/components/intake/agent-profile-intake'

interface AgentProfilePageClientProps {
  userId: string
  profile?: Record<string, unknown> | null
  translations: Record<string, string>
  pageTitle: string
  pageDescription: string
}

export function AgentProfilePageClient({
  userId,
  profile,
  translations,
  pageTitle,
  pageDescription,
}: AgentProfilePageClientProps) {
  const [mode, setMode] = useState<'classic' | 'chat'>('chat')

  const modeToggle = (
    <div className="mb-6 flex gap-2">
      <button
        onClick={() => setMode('chat')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          mode === 'chat'
            ? 'bg-brand text-white'
            : 'bg-hover-bg text-text-primary border border-border-default hover:bg-[#E2E4EB]'
        }`}
      >
        Chat with Yalla
      </button>
      <button
        onClick={() => setMode('classic')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          mode === 'classic'
            ? 'bg-brand text-white'
            : 'bg-hover-bg text-text-primary border border-border-default hover:bg-[#E2E4EB]'
        }`}
      >
        Classic Form
      </button>
    </div>
  )

  if ((mode as any) === 'chat') {
    return (
      <div className="max-w-5xl">
        {modeToggle}
        <AgentProfileIntake
          userId={userId}
          existingProfile={profile}
          translations={translations}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {modeToggle}

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{pageTitle}</h1>
        <p className="text-text-secondary text-sm">{pageDescription}</p>
      </div>

      <ProfileForm profile={profile as any} />
    </div>
  )
}
