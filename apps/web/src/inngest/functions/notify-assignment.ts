import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * notify-assignment — Handles agent invitations and acceptances for listing assignments.
 *
 * assignment/agent.invited:
 *   - Fetches listing details and owner name
 *   - Creates notification for agent: "You've been invited to collaborate on [address]"
 *   - Action URL: /agent/assignments
 *
 * assignment/agent.accepted:
 *   - Fetches listing and agent name
 *   - Creates notification for owner: "[Agent name] accepted your invitation for [address]"
 *   - Links the agent to the listing via listings.agent_id
 *   - Action URL: /owner/listings
 */

export const notifyAssignment = inngest.createFunction(
  { id: 'assignment.notify', retries: 2 },
  [{ event: 'assignment/agent.invited' }, { event: 'assignment/agent.accepted' }],
  async ({ event, step }) => {
    const db = createServiceClient()

    if (event.name === 'assignment/agent.invited') {
      const { assignmentId, listingId, agentId, ownerId } = event.data

      // 1. Fetch listing details (address, city)
      const { data: listing } = await step.run('fetch-listing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (db as any)
          .from('listings')
          .select('id, address, city')
          .eq('id', listingId)
          .single()
      })

      if (!listing) {
        return { skipped: true, reason: 'listing not found' }
      }

      // 2. Fetch owner name
      const { data: owner } = await step.run('fetch-owner', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (db as any)
          .from('users')
          .select('id, full_name')
          .eq('id', ownerId)
          .single()
      })

      // 3. Create notification for agent
      await step.run('create-agent-notification', async () => {
        const address = `${listing.address}${listing.city ? `, ${listing.city}` : ''}`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).rpc('create_notification', {
          p_user_id: agentId,
          p_title: 'Collaboration Invitation',
          p_body: `You've been invited to collaborate on ${address}`,
          p_action_url: '/agent/assignments',
          p_source_type: 'listing',
          p_source_id: listingId,
          p_actor_id: ownerId,
        })
      })

      return {
        eventType: 'agent.invited',
        assignmentId,
        listingId,
        agentId,
        notified: true,
      }
    }

    if (event.name === 'assignment/agent.accepted') {
      const { assignmentId, listingId, agentId, ownerId } = event.data

      // 1. Fetch listing details (address, city)
      const { data: listing } = await step.run('fetch-listing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (db as any)
          .from('listings')
          .select('id, address, city')
          .eq('id', listingId)
          .single()
      })

      if (!listing) {
        return { skipped: true, reason: 'listing not found' }
      }

      // 2. Fetch agent name
      const { data: agent } = await step.run('fetch-agent', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (db as any)
          .from('users')
          .select('id, full_name')
          .eq('id', agentId)
          .single()
      })

      if (!agent) {
        return { skipped: true, reason: 'agent not found' }
      }

      // 3. Create notification for owner
      await step.run('create-owner-notification', async () => {
        const address = `${listing.address}${listing.city ? `, ${listing.city}` : ''}`
        const agentName = agent.full_name ?? 'An agent'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).rpc('create_notification', {
          p_user_id: ownerId,
          p_title: 'Assignment Accepted',
          p_body: `${agentName} accepted your invitation for ${address}`,
          p_action_url: '/owner/listings',
          p_source_type: 'listing',
          p_source_id: listingId,
          p_actor_id: agentId,
        })
      })

      // 4. Link the agent to the listing via listings.agent_id
      await step.run('link-agent-to-listing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any)
          .from('listings')
          .update({ agent_id: agentId })
          .eq('id', listingId)
      })

      return {
        eventType: 'agent.accepted',
        assignmentId,
        listingId,
        agentId,
        notified: true,
        linked: true,
      }
    }

    return { skipped: true, reason: 'unknown event' }
  }
)
