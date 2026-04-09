import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * distribute-brief — Triggered after agents are matched to a search request.
 *
 * For each pending match, sends the search brief via in-platform notification
 * (+ optional email digest). Updates match status to 'sent' with expiry date.
 */

export const distributeBrief = inngest.createFunction(
  { id: 'search.distribute-brief', retries: 2 },
  { event: 'search/agents.matched' },
  async ({ event, step }) => {
    const { searchRequestId, matchIds } = event.data
    const db = createServiceClient()

    // 1. Fetch the search request + hunter info
    const { data: search } = await step.run('fetch-search', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('search_requests')
        .select(`
          id, intent, areas, radius_km, budget_min, budget_max, currency,
          property_types, bedrooms_min, bedrooms_max, timeline, notes, languages,
          hunter:users!search_requests_hunter_id_fkey(full_name)
        `)
        .eq('id', searchRequestId)
        .single()
    })

    if (!search) {
      return { skipped: true, reason: 'search not found' }
    }

    // 2. Build the sanitised brief (never includes email/phone/surname)
    const hunterFirstName = search.hunter?.full_name?.split(' ')[0] ?? 'Home-Hunter'

    const brief = {
      searchRequestId: search.id,
      hunterDisplayName: hunterFirstName,
      intent: search.intent,
      areas: search.areas,
      radiusKm: search.radius_km,
      budgetRange: {
        min: search.budget_min,
        max: search.budget_max,
        currency: search.currency,
      },
      propertyTypes: search.property_types,
      bedrooms: {
        min: search.bedrooms_min,
        max: search.bedrooms_max,
      },
      timeline: search.timeline,
      preferences: search.notes,
      languages: search.languages,
    }

    // 3. For each match, send the brief and update status
    const sentAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    let sentCount = 0

    for (const matchId of matchIds) {
      await step.run(`send-brief-${matchId}`, async () => {
        // Fetch the agent match + agent info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: match } = await (db as any)
          .from('agent_matches')
          .select('id, agent_id, status')
          .eq('id', matchId)
          .single()

        if (!match || match.status !== 'pending') return

        // Create in-platform notification via message_threads
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: thread } = await (db as any)
          .from('message_threads')
          .insert({
            subject: `Search Brief: ${hunterFirstName} is looking to ${search.intent} in ${
              Array.isArray(search.areas) && search.areas.length > 0
                ? (search.areas[0] as { name?: string }).name ?? 'your area'
                : 'your area'
            }`,
          })
          .select('id')
          .single()

        if (thread) {
          // Add agent as participant
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (db as any).from('thread_participants').insert({
            thread_id: thread.id,
            user_id: match.agent_id,
            joined_at: sentAt,
          })

          // Send the brief as a system message
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (db as any).from('messages').insert({
            thread_id: thread.id,
            sender_id: match.agent_id, // system-generated, attributed to agent for visibility
            body: JSON.stringify(brief),
            attachments: '[]',
            channel: 'in_app',
          })
        }

        // Update match status → sent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any)
          .from('agent_matches')
          .update({
            status: 'sent',
            sent_at: sentAt,
            expires_at: expiresAt,
          })
          .eq('id', matchId)

        sentCount++
      })
    }

    // TODO: Future enhancement — send email digest to agents who have
    // email notifications enabled in their preferences.

    return { sent: sentCount, searchRequestId, expiresAt }
  }
)
