'use client'

import { ActionHintBanner } from './action-hint-banner'

interface Props {
  pageKey: string
  title: string
  hints: string[]
  dismissLabel: string
}

export function DashboardHintBanner({ pageKey, title, hints, dismissLabel }: Props) {
  return (
    <ActionHintBanner
      pageKey={pageKey}
      title={title}
      hints={hints.map(text => ({ text }))}
      dismissLabel={dismissLabel}
    />
  )
}
