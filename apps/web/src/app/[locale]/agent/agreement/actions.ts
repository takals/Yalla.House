'use server'

// Re-export the universal sign action for backward compatibility.
// The agent agreement page now uses the shared AgreementPage component
// which calls signAgreement() directly from @/lib/agreements.
export { signAgreement as signAgreementAction } from '@/lib/agreements'
