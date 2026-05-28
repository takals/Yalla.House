import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FaqItem {
  question: string
  answer: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { listingId, faqs } = await request.json()

  if (!listingId || !Array.isArray(faqs)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Validate FAQ structure
  const isValid = faqs.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as FaqItem).question === 'string' &&
      typeof (item as FaqItem).answer === 'string' &&
      (item as FaqItem).question.trim().length > 0 &&
      (item as FaqItem).answer.trim().length > 0
  )

  if (!isValid) {
    return NextResponse.json(
      { error: 'Each FAQ must have a non-empty question and answer' },
      { status: 400 }
    )
  }

  // Cap at 20 FAQs
  if (faqs.length > 20) {
    return NextResponse.json(
      { error: 'Maximum 20 FAQs allowed' },
      { status: 400 }
    )
  }

  // Sanitise — trim whitespace, keep only question + answer
  const sanitised: FaqItem[] = faqs.map((item: FaqItem) => ({
    question: item.question.trim(),
    answer: item.answer.trim(),
  }))

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('id, owner_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await (supabase as any)
    .from('listings')
    .update({ faqs: sanitised })
    .eq('id', listingId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, faqs: sanitised })
}
