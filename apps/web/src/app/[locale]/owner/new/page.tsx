import { redirect } from '@/i18n/navigation'

/**
 * Legacy listing wizard — replaced by Property Workspace.
 * Redirect any bookmarks or stale return-URLs to the new route.
 */
export default function NewListingRedirect() {
  redirect('/owner/workspace')
}
