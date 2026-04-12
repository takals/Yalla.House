import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { feedExport } from '@/inngest/functions/feed-export'
import { referralProcess } from '@/inngest/functions/referral-process'
import { analyzeIntakePatterns } from '@/inngest/functions/analyze-intake-patterns'
import { autoInviteAgents } from '@/inngest/functions/auto-invite-agents'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    feedExport,
    referralProcess,
    analyzeIntakePatterns,
    autoInviteAgents,
  ],
})
