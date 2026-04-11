import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

interface SessionData {
  id: string
  user_id: string
  flow_id: string
  voice_used: boolean
  fields_from_memory: number
  fields_total: number
  duration_seconds: number
  field_values: Record<string, string | number | boolean>
  field_sequence: string[]
  dropped_at_field?: string
  created_at: string
}

interface PatternAnalysis {
  flowId: string
  commonValues: Record<string, { value: string | number | boolean; count: number }[]>
  commonSequence: string[]
  dropOffPoint: { field: string; abandonmentRate: number } | null
  voiceCorrectionFields: string[]
  totalSessions: number
  completedSessions: number
  abandonmentRate: number
}

export const analyzeIntakePatterns = inngest.createFunction(
  { id: 'intake.patterns.analyze', retries: 2 },
  { event: 'intake/patterns.analyze' },
  async ({ event, step }) => {
    const { flowId } = event.data
    const db = createServiceClient()

    // Fetch all sessions for this flow
    const { data: sessions, error: fetchError } = await (db as any)
      .from('intake_sessions')
      .select('*')
      .eq('flow_id', flowId)
      .order('created_at', { ascending: false })

    if (fetchError || !sessions || sessions.length === 0) {
      return {
        flowId,
        skipped: true,
        reason: 'no sessions found',
      }
    }

    const analysis = await step.run('analyze-patterns', () => {
      const commonValues: Record<string, Map<string, number>> = {}
      const sequenceMap = new Map<string, number>()
      const dropOffPoints: Record<string, number> = {}
      const voiceCorrectionFields = new Set<string>()

      let completedCount = 0

      for (const session of sessions as SessionData[]) {
        const fieldValues = session.field_values || {}
        const fieldSequence = session.field_sequence || []
        const voiceUsed = session.voice_used || false

        // Count field values
        for (const [field, value] of Object.entries(fieldValues)) {
          if (!commonValues[field]) {
            commonValues[field] = new Map()
          }
          const key = String(value)
          commonValues[field].set(key, (commonValues[field].get(key) || 0) + 1)
        }

        // Track field sequences
        if (fieldSequence.length > 1) {
          for (let i = 0; i < fieldSequence.length - 1; i++) {
            const transition = `${fieldSequence[i]} -> ${fieldSequence[i + 1]}`
            sequenceMap.set(transition, (sequenceMap.get(transition) || 0) + 1)
          }
        }

        // Track drop-off points
        if (session.dropped_at_field) {
          dropOffPoints[session.dropped_at_field] =
            (dropOffPoints[session.dropped_at_field] || 0) + 1
        } else {
          completedCount += 1
        }

        // Track voice correction (voice used but edited later)
        if (voiceUsed && fieldSequence.length > 0) {
          // Mark all fields that were corrected after voice input
          voiceCorrectionFields.add(`voice_corrections_${fieldSequence[0]}`)
        }
      }

      // Convert maps to sorted arrays
      const commonValuesResult: Record<
        string,
        { value: string | number | boolean; count: number }[]
      > = {}

      for (const [field, valueMap] of Object.entries(commonValues)) {
        commonValuesResult[field] = Array.from(valueMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      }

      // Find most common transition sequence
      const sortedTransitions = Array.from(sequenceMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 1)
      const commonSequence = sortedTransitions[0]
        ? sortedTransitions[0][0].split(' -> ')
        : []

      // Find drop-off point with highest abandonment rate
      let dropOffPoint: { field: string; abandonmentRate: number } | null = null
      let maxAbandonmentRate = 0

      for (const [field, count] of Object.entries(dropOffPoints)) {
        const rate = count / sessions.length
        if (rate > maxAbandonmentRate) {
          maxAbandonmentRate = rate
          dropOffPoint = { field, abandonmentRate: rate }
        }
      }

      const abandonmentRate = sessions.length > 0 ? 1 - completedCount / sessions.length : 0

      return {
        flowId,
        commonValues: commonValuesResult,
        commonSequence,
        dropOffPoint,
        voiceCorrectionFields: Array.from(voiceCorrectionFields),
        totalSessions: sessions.length,
        completedSessions: completedCount,
        abandonmentRate,
      } as PatternAnalysis
    })

    // Upsert results into intake_patterns table
    const { error: upsertError } = await (db as any).from('intake_patterns').upsert({
      flow_id: flowId,
      common_value: JSON.stringify(analysis.commonValues),
      common_sequence: analysis.commonSequence,
      drop_off_point: analysis.dropOffPoint?.field || null,
      drop_off_abandonment_rate: analysis.dropOffPoint?.abandonmentRate || 0,
      voice_correction_fields: analysis.voiceCorrectionFields,
      total_sessions: analysis.totalSessions,
      completed_sessions: analysis.completedSessions,
      abandonment_rate: analysis.abandonmentRate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'flow_id', ignoreDuplicates: false })

    if (upsertError) {
      throw new Error(`Failed to upsert intake patterns: ${upsertError.message}`)
    }

    return {
      flowId,
      status: 'analyzed',
      totalSessions: analysis.totalSessions,
      completedSessions: analysis.completedSessions,
      abandonmentRate: analysis.abandonmentRate,
      dropOffField: analysis.dropOffPoint?.field || null,
    }
  }
)
