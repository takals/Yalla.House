import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const body = await request.json() as { planId: string; listingId?: string }
  const { planId, listingId } = body

  if (!planId) {
    return NextResponse.json({ error: 'planId fehlt' }, { status: 400 })
  }

  // Fetch plan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plan } = await (supabase.from('subscription_plans') as any)
    .select('id, name, amount, currency, stripe_price_id, target_role, is_active')
    .eq('id', planId)
    .eq('target_role', 'owner')
    .eq('is_active', true)
    .single()

  if (!plan) {
    return NextResponse.json({ error: 'Tarif nicht gefunden' }, { status: 404 })
  }

  if (!plan.stripe_price_id) {
    return NextResponse.json({ error: 'Tarif noch nicht konfiguriert' }, { status: 400 })
  }

  // Ensure public.users row exists and fetch stripe_customer_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('users') as any).upsert(
    { id: user.id, email: user.email ?? '', language: 'de' },
    { onConflict: 'id', ignoreDuplicates: true }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRow } = await (supabase.from('users') as any)
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  // Create or retrieve Stripe Customer
  let stripeCustomerId: string | undefined = userRow?.stripe_customer_id ?? undefined
  if (!stripeCustomerId) {
    const customerParams = {
      metadata: { supabase_user_id: user.id },
      ...(user.email ? { email: user.email } : {}),
    }
    const customer = await stripe.customers.create(customerParams)
    stripeCustomerId = customer.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('users') as any)
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', user.id)
  }

  // Create pending billing record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: billingRecord, error: billingError } = await (supabase.from('billing_records') as any)
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: plan.amount,
      currency: plan.currency,
      type: 'listing_package',
      status: 'pending',
      description: plan.name,
    })
    .select('id')
    .single()

  if (billingError || !billingRecord) {
    console.error('billing_records insert error:', billingError)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellung' }, { status: 500 })
  }

  const origin = request.nextUrl.origin

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'payment',
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/owner?billing=success`,
    cancel_url: `${origin}/owner/plans${listingId ? `?listing_id=${listingId}` : ''}`,
    metadata: {
      billing_record_id: billingRecord.id,
      listing_id: listingId ?? '',
      user_id: user.id,
    },
    payment_intent_data: {
      metadata: {
        billing_record_id: billingRecord.id,
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
