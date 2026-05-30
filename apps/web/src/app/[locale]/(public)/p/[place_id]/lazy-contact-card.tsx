'use client'

import dynamic from 'next/dynamic'
import type { ContactCardProps } from './contact-form'

// Client-only, deferred: the contact form is below the fold and interactive,
// so its JS loads on demand rather than in the initial bundle. A skeleton
// reserves space to avoid layout shift.
const ContactCard = dynamic(
  () => import('./contact-form').then(m => m.ContactCard),
  {
    ssr: false,
    loading: () => <div className="h-[320px] rounded-xl bg-black/5 animate-pulse" />,
  },
)

export function LazyContactCard(props: ContactCardProps) {
  return <ContactCard {...props} />
}
