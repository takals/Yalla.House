import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env['STRIPE_WEBHOOK_SECRET']!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const { billing_record_id, listing_id, user_id } = session.metadata ?? {}
    const serviceClient = createServiceClient()

    // Mark billing record as paid
    if (billing_record_id) {
      const { error } = await (serviceClient.from('billing_records') as any)
        .update({
          status: 'paid',
          stripe_payment_intent_id: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
        })
        .eq('id', billing_record_id)

      if (error) {
        console.error('billing_records update error:', error)
      }
    }

    // Activate listing
    if (listing_id && user_id) {
      const { error } = await (serviceClient.from('listings') as any)
        .update({ status: 'active' })
        .eq('id', listing_id)
        .eq('owner_id', user_id)

      if (error) {
        console.error('listings status update error:', error)
      }
    }
  }

  return NextResponse.json({ received: true })
}
