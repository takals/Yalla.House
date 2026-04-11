/**
 * Type definitions for hooks database schema
 * These types align with the Supabase `intake_memories` table
 */

export interface IntakeMemoryRow {
  id: string
  flow_id: string
  user_id: string
  field: string
  value: unknown
  source: 'voice' | 'text' | 'click'
  confidence: number
  created_at: string
  deleted_at: string | null
}

/**
 * Supported intake flow types
 */
export type IntakeFlowType = 'owner-brief' | 'hunter-passport' | 'agent-profile'

/**
 * Supported intake field types for parsing
 */
export type IntakeFieldType =
  | 'bedrooms'
  | 'budget'
  | 'location'
  | 'property-type'
  | 'timeline'
  | 'finance'
  | 'must-haves'
  | 'intent'
  | 'budget-type'
  | 'finance-status'

/**
 * Normalized intake data structure (post-parsing)
 */
export interface NormalizedIntakeData {
  intent?: 'buying' | 'renting' | 'selling'
  bedrooms?: number
  propertyType?: string
  location?: string
  budget?: number
  budgetType?: 'purchase' | 'rental'
  timeline?: string
  financeStatus?: string
  mustHaves?: string[]
}
