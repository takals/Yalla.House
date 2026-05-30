'use client'

import dynamic from 'next/dynamic'
import type { ViewingCalendarProps } from './viewing-calendar'

// Client-only, deferred: the booking calendar is below the fold and fully
// interactive, so it doesn't need to be in the server-rendered HTML or the
// initial bundle. A skeleton holds its space to avoid layout shift.
const ViewingCalendar = dynamic(
  () => import('./viewing-calendar').then(m => m.ViewingCalendar),
  {
    ssr: false,
    loading: () => <div className="h-[480px] rounded-xl bg-black/5 animate-pulse" />,
  },
)

export function LazyViewingCalendar(props: ViewingCalendarProps) {
  return <ViewingCalendar {...props} />
}
