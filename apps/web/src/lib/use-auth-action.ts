'use client'

import { useAuthGate } from '@/components/auth-gate-provider'

/**
 * Helper to check if a server action response requires authentication.
 * Usage in form components:
 *
 *   const { handleAuthRequired } = useAuthAction()
 *
 *   const result = await someServerAction(formData)
 *   if (handleAuthRequired(result)) return  // modal shown, stop here
 *   // ... handle normal result
 */
export function useAuthAction() {
  const { showAuthGate, isAuthenticated } = useAuthGate()

  function handleAuthRequired(result: unknown): boolean {
    if (
      result &&
      typeof result === 'object' &&
      'authRequired' in result &&
      (result as { authRequired?: boolean }).authRequired === true
    ) {
      showAuthGate()
      return true
    }
    return false
  }

  return { handleAuthRequired, isAuthenticated, showAuthGate }
}
