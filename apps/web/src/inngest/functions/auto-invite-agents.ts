import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAgentInviteEmail } from '@/lib/resend'

/**
 * auto-invite-agents — Automatically invites prospective agents when owner brief is sent
 * with insufficient registered agents.
 *
 * brief/agents.insufficient trigger:
 *   - Query prospective_agents for matching postcode prefix
 *   - If insufficient, seed from SEED_AGENTS static data
 *   - Send invite emails to each prospective agent
 *   - Update status and log invitations
 */

interface ProspectiveAgent {
  id: string
  email: string
  agency_name: string
  agent_name: string | null
  postcode_prefix: string
  status: string
  invited_count: number
}

export const autoInviteAgents = inngest.createFunction(
  { id: 'brief.auto-invite-agents', retries: 2 },
  { event: 'brief/agents.insufficient' },
  async ({ event, step }) => {
    const db = createServiceClient()
    const { listingId, ownerId, postcode, city, registeredAgentCount, minimumRequired } = event.data

    // Calculate how many invites we need to send
    const invitesNeeded = minimumRequired - registeredAgentCount

    if (invitesNeeded <= 0) {
      return { skipped: true, reason: 'sufficient agents already registered' }
    }

    // Step 1: Extract postcode prefix (e.g., "SW1A" from "SW1A 1AA")
    const postcodePrefix = postcode.split(' ')[0] || postcode

    // Step 2: Fetch prospective agents with 'new' status
    const prospectiveAgents = await step.run('fetch-prospective-agents', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (db as any)
        .from('prospective_agents')
        .select('id, email, agency_name, agent_name, postcode_prefix, status, invited_count')
        .eq('postcode_prefix', postcodePrefix)
        .eq('status', 'new')
        .not('email', 'is', null)
        .order('rating', { ascending: false })
        .limit(invitesNeeded)

      if (error) {
        console.error('Failed to fetch prospective agents:', error)
        return []
      }

      return data as ProspectiveAgent[]
    })

    // Step 3: If we don't have enough, try to seed from static data
    let agentsToInvite = prospectiveAgents

    if (agentsToInvite.length < invitesNeeded) {
      agentsToInvite = await step.run('seed-agents-from-data', async () => {
        // For now, return the existing list. In future, integrate with SEED_AGENTS
        return prospectiveAgents
      })
    }

    if (agentsToInvite.length === 0) {
      return { skipped: true, reason: 'no prospective agents found' }
    }

    // Step 4: Fetch listing details for email context
    const listingDetails = await step.run('fetch-listing-details', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (db as any)
        .from('listings')
        .select('id, property_type, bedrooms, sale_price')
        .eq('id', listingId)
        .single()

      if (error) {
        console.error('Failed to fetch listing details:', error)
        return null
      }

      return data
    })

    if (!listingDetails) {
      return { skipped: true, reason: 'listing not found' }
    }

    // Step 5: Send invites to each prospective agent
    const inviteResults: Array<{ agentId: string; success: boolean }> = []

    for (const agent of agentsToInvite) {
      const inviteSuccess = await step.run(`send-invite-${agent.id}`, async () => {
        try {
          const emailResult = await sendAgentInviteEmail({
            agentEmail: agent.email,
            agencyName: agent.agency_name,
            agentName: agent.agent_name,
            listingCity: city,
            listingPostcode: postcode,
            propertyType: listingDetails.property_type || 'property',
            bedrooms: listingDetails.bedrooms,
            askingPrice: listingDetails.sale_price,
            listingId,
          })

          if (!emailResult.success) {
            console.error(
              `Failed to send invite email to ${agent.email}:`,
              emailResult.error
            )
            return false
          }

          return true
        } catch (err) {
          console.error(`Error sending invite to agent ${agent.id}:`, err)
          return false
        }
      })

      if (inviteSuccess) {
        // Update prospective agent status
        await step.run(`update-agent-${agent.id}`, async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (db as any)
              .from('prospective_agents')
              .update({
                status: 'invited',
                invited_at: new Date().toISOString(),
                invited_count: agent.invited_count + 1,
                matched_listing_id: listingId,
              })
              .eq('id', agent.id)
          } catch (err) {
            console.error(`Failed to update agent status for ${agent.id}:`, err)
          }
        })

        // Log the invitation
        await step.run(`log-invite-${agent.id}`, async () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (db as any)
              .from('agent_invite_log')
              .insert({
                prospective_agent_id: agent.id,
                listing_id: listingId,
                sent_at: new Date().toISOString(),
                email_sent: true,
              })
          } catch (err) {
            console.error(`Failed to log invite for ${agent.id}:`, err)
          }
        })

        inviteResults.push({ agentId: agent.id, success: true })
      } else {
        inviteResults.push({ agentId: agent.id, success: false })
      }
    }

    const successCount = inviteResults.filter(r => r.success).length

    return {
      listingId,
      ownerId,
      invitesSent: successCount,
      agentsContacted: agentsToInvite.length,
      results: inviteResults,
    }
  }
)
