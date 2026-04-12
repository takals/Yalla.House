'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type IntakeSource = 'voice' | 'text' | 'click'

export interface IntakeMemoryEntry {
  field: string
  value: unknown
  source: IntakeSource
  confidence: number
  timestamp: string
}

export interface UseIntakeMemoryOptions {
  flowId: string // 'owner-brief' | 'hunter-passport' | 'agent-profile'
  userId: string
}

export interface UseIntakeMemoryReturn {
  memories: Record<string, IntakeMemoryEntry>
  isLoading: boolean
  remember: (
    field: string,
    value: unknown,
    source: IntakeSource,
    confidence?: number
  ) => Promise<void>
  recall: (field: string) => IntakeMemoryEntry | null
  recallAll: () => Record<string, IntakeMemoryEntry>
  forget: (field: string) => Promise<void>
  hasMemory: (field: string) => boolean
  getGreeting: () => string | null
}

// Confidence defaults by source
const CONFIDENCE_DEFAULTS: Record<IntakeSource, number> = {
  voice: 0.85,
  text: 0.95,
  click: 1.0,
}

export function useIntakeMemory({
  flowId,
  userId,
}: UseIntakeMemoryOptions): UseIntakeMemoryReturn {
  const [memories, setMemories] = useState<Record<string, IntakeMemoryEntry>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch existing memories on mount
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setIsLoading(true)

        const { data, error } = await (supabase
          .from('intake_memories')
          .select('*')
          .eq('flow_id', flowId)
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }) as any)

        if (error) {
          console.error('Failed to fetch intake memories:', error)
          setMemories({})
          return
        }

        // Transform database rows into memory map (most recent entry per field)
        const memoryMap: Record<string, IntakeMemoryEntry> = {}

        if (data && Array.isArray(data)) {
          for (const row of data as any[]) {
            const field = row.field as string

            if (!memoryMap[field]) {
              memoryMap[field] = {
                field,
                value: row.value,
                source: (row.source as IntakeSource) || 'text',
                confidence: row.confidence ?? 0.95,
                timestamp: row.created_at,
              }
            }
          }
        }

        setMemories(memoryMap)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchMemories()
  }, [flowId, userId, supabase])

  const remember = useCallback(
    async (
      field: string,
      value: unknown,
      source: IntakeSource,
      confidence?: number
    ) => {
      const finalConfidence = confidence ?? CONFIDENCE_DEFAULTS[source]
      const now = new Date().toISOString()

      // Optimistic update
      setMemories((prev) => ({
        ...prev,
        [field]: {
          field,
          value,
          source,
          confidence: finalConfidence,
          timestamp: now,
        },
      }))

      // Persist to database
      try {
        const { error } = await (supabase.from('intake_memories').insert([
          {
            flow_id: flowId,
            user_id: userId,
            field,
            value,
            source,
            confidence: finalConfidence,
            created_at: now,
          },
        ] as any) as any)

        if (error) {
          console.error(`Failed to remember field "${field}":`, error)
          // Rollback optimistic update
          setMemories((prev) => {
            const updated = { ...prev }
            delete updated[field]
            return updated
          })
        }
      } catch (err) {
        console.error(`Error storing memory for field "${field}":`, err)
        // Rollback optimistic update
        setMemories((prev) => {
          const updated = { ...prev }
          delete updated[field]
          return updated
        })
      }
    },
    [flowId, userId, supabase]
  )

  const recall = useCallback((field: string) => {
    return memories[field] ?? null
  }, [memories])

  const recallAll = useCallback(() => {
    return { ...memories }
  }, [memories])

  const forget = useCallback(
    async (field: string) => {
      // Optimistic update
      setMemories((prev) => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })

      // Soft-delete from database
      try {
        const now = new Date().toISOString()

        const { error } = await (supabase as any)
          .from('intake_memories')
          .update({ deleted_at: now })
          .eq('flow_id', flowId)
          .eq('user_id', userId)
          .eq('field', field)

        if (error) {
          console.error(`Failed to forget field "${field}":`, error)
          // Rollback: restore the memory
          setMemories((prev) => ({
            ...prev,
            [field]: memories[field]!,
          }))
        }
      } catch (err) {
        console.error(`Error deleting memory for field "${field}":`, err)
        // Rollback: restore the memory
        setMemories((prev) => ({
          ...prev,
          [field]: memories[field]!,
        }))
      }
    },
    [flowId, userId, supabase, memories]
  )

  const hasMemory = useCallback((field: string) => {
    return field in memories && memories[field] !== null
  }, [memories])

  const getGreeting = useCallback((): string | null => {
    if (Object.keys(memories).length === 0) {
      return null
    }

    // Example greeting logic
    const bedrooms = memories['bedrooms']?.value
    const location = memories['location']?.value
    const propertyType = memories['property_type']?.value

    if (!bedrooms && !location && !propertyType) {
      return 'Welcome back! Ready to continue?'
    }

    const parts: string[] = ['Welcome back!']

    if (location) {
      parts.push(`I remember you're interested in ${location}`)
    }

    if (bedrooms) {
      parts.push(`looking for ${bedrooms} bedrooms`)
    }

    if (propertyType) {
      parts.push(`and you want a ${propertyType}`)
    }

    return parts.join(', ').replace(/, and/, ' and') + '.'
  }, [memories])

  return {
    memories,
    isLoading,
    remember,
    recall,
    recallAll,
    forget,
    hasMemory,
    getGreeting,
  }
}
