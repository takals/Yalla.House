'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { inngest } from '@/lib/inngest/client'

/** UK outward code, or a German 5-digit PLZ. */
const UK_OUTWARD = /^[A-Z]{1,2}\d{1,2}[A-Z]?$/
const DE_PLZ = /^\d{5}$/

export type QuoteRequestResult =
  | { success: true; requestId: string }
  | { error: string }
  | { authRequired: true }

/**
 * Turn "I need an EPC in E11" into a service request the router can act on.
 *
 * This is the demand side of the marketplace, and until now it did not exist:
 * every "Request quote" button pointed at /marketplace/<slug>, a route that was
 * never built, so the table had zero rows and verified partners had nothing to
 * quote on. Guests can fill the form in full — the account is asked for at
 * submit, and the form is replayed on the way back.
 */
export async function requestQuoteAction(input: {
  category: string
  postcode: string
  description: string
}): Promise<QuoteRequestResult> {
  const postcode = input.postcode.trim().toUpperCase().replace(/\s+/g, '')
  if (!postcode) {
    return { error: 'Add a postcode so we can find providers who cover you.' }
  }
  // Full postcodes are fine too — we only need the outward part for matching.
  const outward = postcode.slice(0, postcode.length > 5 ? postcode.length - 3 : postcode.length)
  if (!UK_OUTWARD.test(outward) && !DE_PLZ.test(postcode)) {
    return { error: `"${input.postcode.trim()}" doesn't look like a postcode.` }
  }

  const description = input.description.trim().slice(0, 2000)

  const supabase = await createClient()

  // The catalogue is the only source of valid categories — the column now has
  // a foreign key onto it, so anything else would be rejected by the database
  // anyway. Checking here lets us say something useful instead.
  const { data: category } = await (supabase as any)
    .from('service_categories')
    .select('slug, name_en')
    .eq('slug', input.category)
    .maybeSingle()

  if (!category) return { error: 'That service is no longer listed.' }

  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const { data: serviceRequest, error } = await (supabase as any)
    .from('service_requests')
    .insert({
      requester_id: auth.userId,
      category: category.slug,
      title: `${category.name_en} in ${outward}`,
      description: description || null,
      postcode: outward,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('requestQuoteAction insert error:', error)
    return { error: 'Could not send that. Please try again.' }
  }

  try {
    await inngest.send({
      name: 'service/request.created',
      data: {
        serviceRequestId: serviceRequest.id,
        requesterId: auth.userId,
        category: category.slug,
        postcode: outward,
      },
    })
  } catch (e) {
    // The request is saved and visible; routing can be retried. Never fail the
    // submit because the queue hiccuped.
    console.error('requestQuoteAction inngest error:', e)
  }

  return { success: true, requestId: serviceRequest.id }
}
