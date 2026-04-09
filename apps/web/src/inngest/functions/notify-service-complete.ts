import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * notify-service-complete — Triggered when a service request is marked complete.
 *
 * Fetches the service request and partner details, then creates a notification
 * for the requester: "[Partner name] completed your [category] request".
 *
 * Action URL varies by requester role (/owner/services or /agent/services).
 */

export const notifyServiceComplete = inngest.createFunction(
  { id: 'service.notify-complete', retries: 2 },
  { event: 'service/request.completed' },
  async ({ event, step }) => {
    const { serviceRequestId, partnerId, requesterId } = event.data
    const db = createServiceClient()

    // 1. Fetch the service request with category
    const { data: request } = await step.run('fetch-request', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('service_requests')
        .select('id, category, requester_id')
        .eq('id', serviceRequestId)
        .single()
    })

    if (!request) {
      return { skipped: true, reason: 'service request not found' }
    }

    // 2. Fetch partner name
    const { data: partner } = await step.run('fetch-partner', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('users')
        .select('id, full_name')
        .eq('id', partnerId)
        .single()
    })

    if (!partner) {
      return { skipped: true, reason: 'partner not found' }
    }

    // 3. Determine action URL based on requester role
    // Fetch requester to check role
    const { data: requester } = await step.run('fetch-requester', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('users')
        .select('id, role')
        .eq('id', requesterId)
        .single()
    })

    let actionUrl = '/owner/services'
    if (requester?.role === 'agent') {
      actionUrl = '/agent/services'
    }

    // 4. Create notification for requester
    await step.run('create-notification', async () => {
      const partnerName = partner.full_name ?? 'A partner'
      const category = request.category ?? 'service'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).rpc('create_notification', {
        p_user_id: requesterId,
        p_title: 'Service Completed',
        p_body: `${partnerName} completed your ${category} request`,
        p_action_url: actionUrl,
        p_source_type: 'service_request',
        p_source_id: serviceRequestId,
        p_actor_id: partnerId,
      })
    })

    return {
      serviceRequestId,
      partnerId,
      requesterId,
      category: request.category,
      notified: true,
      actionUrl,
    }
  }
)
