'use client'

import { ActionHintBanner } from './action-hint-banner'

interface Props {
  translations: {
    hintTitle: string
    hintEditFields: string
    hintUploadPhotos: string
    hintAddViewings: string
    hintAddViewingsAction: string
    hintDismiss: string
  }
  calendarHref: string
}

export function ListingHintBanner({ translations, calendarHref }: Props) {
  return (
    <ActionHintBanner
      pageKey="listing"
      title={translations.hintTitle}
      hints={[
        { text: translations.hintEditFields },
        { text: translations.hintUploadPhotos },
        {
          text: translations.hintAddViewings,
          action: { label: translations.hintAddViewingsAction, href: calendarHref },
        },
      ]}
      dismissLabel={translations.hintDismiss}
    />
  )
}
