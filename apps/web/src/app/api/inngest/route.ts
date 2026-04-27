import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { feedExport } from '@/inngest/functions/feed-export'
import { referralProcess } from '@/inngest/functions/referral-process'
import { analyzeIntakePatterns } from '@/inngest/functions/analyze-intake-patterns'
import { autoInviteAgents } from '@/inngest/functions/auto-invite-agents'
import { distributeBrief } from '@/inngest/functions/distribute-brief'
import { matchAgents } from '@/inngest/functions/match-agents'
import { notifyAssignment } from '@/inngest/functions/notify-assignment'
import { notifyServiceComplete } from '@/inngest/functions/notify-service-complete'
import { routeServiceRequest } from '@/inngest/functions/route-service-request'
import { scoreResponse } from '@/inngest/functions/score-response'
import {
  viewingConfirmed,
  viewing24hReminder,
  viewing1hReminder,
  viewingCheckIn,
  viewingCompleted,
} from '@/inngest/functions/viewing-lifecycle'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    feedExport,
    referralProcess,
    analyzeIntakePatterns,
    autoInviteAgents,
    distributeBrief,
    matchAgents,
    notifyAssignment,
    notifyServiceComplete,
    routeServiceRequest,
    scoreResponse,
    viewingConfirmed,
    viewing24hReminder,
    viewing1hReminder,
    viewingCheckIn,
    viewingCompleted,
  ],
})
