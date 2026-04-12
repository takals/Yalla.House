import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FeedbackForm } from './feedback-form'

interface PageProps {
  params: { viewingId: string }
}

export default async function ViewingFeedbackPage({ params }: PageProps) {
  const t = await getTranslations('hunterFeedback')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/api/auth/login')

  // Fetch viewing with listing info
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select(`
      id, hunter_id, status, scheduled_at, checked_in_at,
      listing:listings!listing_id(title_de, city)
    `)
    .eq('id', params.viewingId)
    .eq('hunter_id', user.id)
    .single()

  if (!viewing) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-[#5E6278]">{t('notFound')}</p>
      </div>
    )
  }

  const listingTitle = viewing.listing?.title_de ?? 'Property Viewing'
  const isCompleted = viewing.status === 'completed'
  const isCheckedIn = !!viewing.checked_in_at

  return (
    <div className="py-8 px-4">
      <FeedbackForm
        viewingId={params.viewingId}
        listingTitle={listingTitle}
        scheduledAt={viewing.scheduled_at}
        checkedIn={isCheckedIn}
        alreadyCompleted={isCompleted}
        translations={{
          checkinTitle: t('checkinTitle'),
          checkinDescription: t('checkinDescription'),
          checkinButton: t('checkinButton'),
          feedbackTitle: t('feedbackTitle'),
          ratingLabel: t('ratingLabel'),
          ratingRequired: t('ratingRequired'),
          interestLabel: t('interestLabel'),
          interestRequired: t('interestRequired'),
          interested: t('interested'),
          notInterested: t('notInterested'),
          notesLabel: t('notesLabel'),
          notesPlaceholder: t('notesPlaceholder'),
          submitFeedback: t('submitFeedback'),
          doneTitle: t('doneTitle'),
          doneDescription: t('doneDescription'),
        }}
      />
    </div>
  )
}
