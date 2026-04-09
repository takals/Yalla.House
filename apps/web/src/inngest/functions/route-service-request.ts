import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * route-service-request — Triggered when a service request is created.
 *
 * Finds matching partners whose service_types contain the category and
 * coverage_areas overlap the postcode area. For each match (max 5),
 * creates a notification: "New [category] request in [postcode]".
 *
 * Returns count of notified partners.
 */

export const routeServiceRequest = inngest.createFunction(
  { id: 'service.route-request', retries: 2 },
  { event: 'service/request.created' },
  async ({ event, step }) => {
    const { serviceRequestId, requesterId, category, postcode } = event.data
    const db = createServiceClient()

    // 1. Fetch the service request details
    const { data: request } = await step.run('fetch-request', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('service_requests')
        .select('id, category, postcode, description')
        .eq('id', serviceRequestId)
        .single()
    })

    if (!request) {
      return { skipped: true, reason: 'service request not found' }
    }

    // 2. Extract postcode area (first 2-3 characters for area matching)
    const postcodeArea = postcode ? postcode.slice(0, 3) : null

    // 3. Query partner_profiles for matching partners
    // Partners match if: service_types contains the category AND coverage_areas overlaps the postcode
    const { data: partners } = await step.run('find-matching-partners', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('partner_profiles')
        .select('user_id, full_name, service_types, coverage_areas')
        .eq('status', 'active')
        .limit(50) // fetch more, filter in app logic
    })

    if (!partners || partners.length === 0) {
      return { matched: 0, reason: 'no active partners' }
    }

    // Filter partners: service_types contains category AND coverage_areas overlaps postcode
    interface PartnerProfile {
      user_id: string
      full_name?: string
      service_types?: string[]
      coverage_areas?: { postcode_prefixes?: string[] }[] | null
    }

    const matchingPartners = partners
      .filter((partner: PartnerProfile) => {
        const hasCategory = Array.isArray(partner.service_types)
          && partner.service_types.includes(category)

        let hasCoverage = false
        if (postcodeArea && Array.isArray(partner.coverage_areas)) {
          hasCoverage = partner.coverage_areas.some((area: { postcode_prefixes?: string[] }) => {
            const prefixes = area.postcode_prefixes ?? []
            return prefixes.some((prefix: string) =>
              postcodeArea.startsWith(prefix) || prefix.startsWith(postcodeArea)
            )
          })
        } else if (!postcodeArea) {
          // If no postcode, accept any partner with the category
          hasCoverage = true
        }

        return hasCategory && hasCoverage
      })
      .slice(0, 5) // max 5 partners

    let notifiedCount = 0

    // 4. For each matching partner, create a notification
    for (const partner of matchingPartners) {
      await step.run(`notify-partner-${partner.user_id}`, async () => {
        const postcodeDisplay = postcode ?? 'your area'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).rpc('create_notification', {
          p_user_id: partner.user_id,
          p_title: 'New Service Request',
          p_body: `New ${category} request in ${postcodeDisplay}`,
          p_action_url: '/partner/requests',
          p_source_type: 'service_request',
          p_source_id: serviceRequestId,
          p_actor_id: requesterId,
        })

        notifiedCount++
      })
    }

    return {
      serviceRequestId,
      category,
      postcode,
      partnersMatched: matchingPartners.length,
      notified: notifiedCount,
    }
  }
)
