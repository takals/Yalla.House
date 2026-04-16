'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { checkinAction, submitFeedbackAction } from './actions'
import { MapPin, Star, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react'

type Phase = 'checkin' | 'feedback' | 'done'

export function FeedbackForm({
  viewingId,
  listingTitle,
  scheduledAt,
  checkedIn,
  alreadyCompleted,
  translations: t,
}: {
  viewingId: string
  listingTitle: string
  scheduledAt: string | null
  checkedIn: boolean
  alreadyCompleted: boolean
  translations: Record<string, string>
}) {
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [phase, setPhase] = useState<Phase>(
    alreadyCompleted ? 'done' : checkedIn ? 'feedback' : 'checkin'
  )
  const [acting, setActing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Feedback state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [notes, setNotes] = useState('')
  const [interested, setInterested] = useState<boolean | null>(null)

  async function handleCheckin() {
    setActing(true)
    setError(null)
    const result = await checkinAction(viewingId)
    setActing(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setPhase('feedback')
    }
  }

  async function handleSubmitFeedback() {
    if (rating === 0) {
      setError(t.ratingRequired ?? 'Rating required')
      return
    }
    if (interested === null) {
      setError(t.interestRequired ?? 'Interest required')
      return
    }
    setActing(true)
    setError(null)
    const result = await submitFeedbackAction(viewingId, rating, notes, interested)
    setActing(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setPhase('done')
    }
  }

  const formattedDate = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString(dateLocale, {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    : ''

  return (
    <div className="max-w-lg mx-auto">
      {/* Header card */}
      <div className="bg-surface rounded-card p-6 shadow-sm mb-4 text-center">
        <h1 className="text-xl font-bold mb-1">{listingTitle}</h1>
        {formattedDate && (
          <p className="text-sm text-text-secondary">{formattedDate}</p>
        )}
      </div>

      {/* Check-in phase */}
      {phase === 'checkin' && (
        <div className="bg-surface rounded-card p-6 shadow-sm text-center">
          <MapPin size={40} className="text-brand mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">{t.checkinTitle}</h2>
          <p className="text-sm text-text-secondary mb-6">{t.checkinDescription}</p>
          <button
            type="button"
            onClick={handleCheckin}
            disabled={acting}
            className="w-full text-sm font-bold px-6 py-3 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
          >
            {acting ? '...' : t.checkinButton}
          </button>
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </div>
      )}

      {/* Feedback phase */}
      {phase === 'feedback' && (
        <div className="bg-surface rounded-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-center">{t.feedbackTitle}</h2>

          {/* Star rating */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-text-secondary mb-2 block">{t.ratingLabel}</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Interest */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-text-secondary mb-2 block">{t.interestLabel}</label>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setInterested(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  interested === true
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                    : 'bg-[#F5F5FA] text-text-secondary hover:bg-[#E4E6EF]'
                }`}
              >
                <ThumbsUp size={16} /> {t.interested}
              </button>
              <button
                type="button"
                onClick={() => setInterested(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  interested === false
                    ? 'bg-red-100 text-red-700 ring-2 ring-red-400'
                    : 'bg-[#F5F5FA] text-text-secondary hover:bg-[#E4E6EF]'
                }`}
              >
                <ThumbsDown size={16} /> {t.notInterested}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="text-sm font-semibold text-text-secondary mb-2 block">{t.notesLabel}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmitFeedback}
            disabled={acting}
            className="w-full text-sm font-bold px-6 py-3 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
          >
            {acting ? '...' : t.submitFeedback}
          </button>
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </div>
      )}

      {/* Done phase */}
      {phase === 'done' && (
        <div className="bg-surface rounded-card p-8 shadow-sm text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-2">{t.doneTitle}</h2>
          <p className="text-sm text-text-secondary">{t.doneDescription}</p>
        </div>
      )}
    </div>
  )
}
