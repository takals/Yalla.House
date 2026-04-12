'use client'

import { useMemo } from 'react'

export interface ParseResult {
  field: string
  value: unknown
  confidence: number
}

export interface StepConfig {
  id: string
  type: 'bedrooms' | 'budget' | 'location' | 'property-type' | 'timeline' | 'finance' | 'must-haves' | 'intent' | string
  label: string
  expectedType?: string
}

// Pattern matchers
const BEDROOM_PATTERNS = [
  /(\d+)\s*(?:bed|br|bedroom|bedrooms)/gi,
  /(?:^|\s)(studio|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s+)?bed/gi,
]

const BUDGET_PATTERNS = [
  /(?:under|up to|max|maximum|max out at|≤|<)\s*[£$]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)[kK]?/gi,
  /[£$]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand)?/gi,
  /(\d+(?:,\d{3})*)\s*(?:pound|pcm|per month|pm)/gi,
]

const LOCATION_PATTERNS = [
  /(?:london|east london|west london|south london|north london|central london)/gi,
  /\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(?:\d[A-Z]{2})?/g, // UK postcodes
  /\b(e[0-9]{1,2}|w[0-9]{1,2}|sw[0-9]{1,2}|se[0-9]{1,2}|nw[0-9]{1,2}|n[0-9]{1,2})\b/gi, // London areas
]

const PROPERTY_TYPE_PATTERNS = [
  /\b(flat|apartment|apt|flats|terraced|terrace|semi-detached|semi|detached|bungalow|cottage|townhouse|new build|converted|period|edwardian|victorian|mansion|studio)\b/gi,
]

const TIMELINE_PATTERNS = [
  /\b(asap|immediately|urgent|right now|as soon as possible)\b/gi,
  /(\d+)\s*(?:weeks?|months?|years?)\b/gi,
  /\b(next\s+(?:week|month|year|quarter)|this\s+(?:week|month|year)|end of\s+(?:month|year)|no rush|flexible|whenever)\b/gi,
]

const FINANCE_PATTERNS = [
  /\b(cash buyer|all cash|paid off|own the property|mortgage approved|mip|mortgage in principle|fca approved|stamp duty|buying power)\b/gi,
  /\b(subject to finance|mortgage needed|need mortgage|arranging finance)\b/gi,
]

const MUST_HAVES_PATTERNS = [
  /\b(garden|outdoor space|balcony|patio|terrace|decking|courtyard)\b/gi,
  /\b(parking|garage|driveway|off-?street|allocated|covered)\b/gi,
  /\b(near|close to|walking distance to|adjacent to)\s+(station|tube|underground|train|school|park|supermarket|amenities)/gi,
  /\b(modern|recently renovated|updated|fitted kitchen|en suite|ensuite)\b/gi,
  /\b(quiet|peaceful|tree-lined|leafy|tranquil|serene)\b/gi,
]

const INTENT_PATTERNS = [
  /\b(buying|buy|purchase|looking to buy|want to buy|interested in buying|considering buying|buying (?:a|an))\b/gi,
  /\b(renting|rent|letting|rent (?:a|an)|looking for rental|want to rent)\b/gi,
  /\b(selling|sell|list|listing|put on market|want to sell|sell my)\b/gi,
]

// Helper to normalize text
function normalizeText(text: string): string {
  return text.toLowerCase().trim()
}

// Helper to parse bedroom count from text
function parseBedroomCount(text: string): string | number | null {
  const normalized = normalizeText(text)

  const wordMap: Record<string, number> = {
    studio: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  }

  // Try numeric match
  const numMatch = /(\d+)/.exec(normalized)
  if (numMatch && numMatch[1]) {
    return parseInt(numMatch[1], 10)
  }

  // Try word match
  for (const [word, num] of Object.entries(wordMap)) {
    if (normalized.includes(word)) {
      return num
    }
  }

  return null
}

// Helper to parse budget
function parseBudget(text: string): number | null {
  const normalized = normalizeText(text)

  // Match patterns like "500k", "£500,000", "under 500"
  const patterns = [
    /(\d+)\s*[km](?:\b|$)/,
    /£\s*(\d+(?:,\d{3})*)/,
    /\$\s*(\d+(?:,\d{3})*)/,
    /(\d+(?:,\d{3})*)\s*(?:pound|pcm)/,
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(normalized)
    if (match && match[1]) {
      let value = parseInt(match[1].replace(/,/g, ''), 10)

      // Handle k suffix
      if (normalized.includes('k') && value < 1000) {
        value *= 1000
      }

      // Handle m suffix
      if (normalized.includes('m') && value < 1000000) {
        value *= 1000000
      }

      return value
    }
  }

  return null
}

// Helper to extract UK postcode areas
function extractPostcodeArea(text: string): string | null {
  const postcodePattern = /\b([a-z]{1,2}\d{1,2}[a-z]?)\s*(?:\d[a-z]{2})?\b/i
  const match = postcodePattern.exec(text)
  return match && match[1] ? match[1].toUpperCase() : null
}

// Main parser function
export function parseIntakeResponse(
  text: string,
  currentStep: StepConfig,
  allSteps: StepConfig[] = []
): ParseResult[] {
  const results: ParseResult[] = []
  const normalizedText = normalizeText(text)

  // Helper to match patterns with confidence
  const matchPatterns = (
    patterns: RegExp[],
    defaultConfidence: number
  ): string[] => {
    const matches: string[] = []
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        if (match[0]) {
          matches.push(match[0])
        }
      }
    }
    return matches
  }

  // Parse based on current step type
  if (
    currentStep.type === 'bedrooms' ||
    currentStep.label.toLowerCase().includes('bedroom')
  ) {
    const bedrooms = parseBedroomCount(text)
    if (bedrooms !== null) {
      results.push({
        field: 'bedrooms',
        value: bedrooms,
        confidence: 0.9,
      })
    }
  } else if (
    currentStep.type === 'budget' ||
    currentStep.label.toLowerCase().includes('budget')
  ) {
    const budget = parseBudget(text)
    if (budget !== null) {
      results.push({
        field: 'budget',
        value: budget,
        confidence: 0.85,
      })

      // Check for rental indicators
      if (normalizedText.includes('pcm') || normalizedText.includes('month')) {
        results.push({
          field: 'budget_type',
          value: 'rental',
          confidence: 0.9,
        })
      } else if (normalizedText.includes('purchase') || normalizedText.includes('buy')) {
        results.push({
          field: 'budget_type',
          value: 'purchase',
          confidence: 0.9,
        })
      }
    }
  } else if (
    currentStep.type === 'location' ||
    currentStep.label.toLowerCase().includes('location')
  ) {
    const postcodeMatch = extractPostcodeArea(text)
    if (postcodeMatch) {
      results.push({
        field: 'location',
        value: postcodeMatch,
        confidence: 0.95,
      })
    } else {
      const locations = matchPatterns(LOCATION_PATTERNS, 0.8)
      if (locations.length > 0) {
        results.push({
          field: 'location',
          value: locations[0],
          confidence: 0.8,
        })
      }
    }
  } else if (
    currentStep.type === 'property-type' ||
    currentStep.label.toLowerCase().includes('property type')
  ) {
    const types = matchPatterns(PROPERTY_TYPE_PATTERNS, 0.85)
    if (types.length > 0) {
      results.push({
        field: 'property_type',
        value: types[0],
        confidence: 0.85,
      })
    }
  } else if (
    currentStep.type === 'timeline' ||
    currentStep.label.toLowerCase().includes('timeline')
  ) {
    const timeline = matchPatterns(TIMELINE_PATTERNS, 0.75)
    if (timeline.length > 0) {
      results.push({
        field: 'timeline',
        value: timeline[0],
        confidence: 0.75,
      })
    }
  } else if (
    currentStep.type === 'finance' ||
    currentStep.label.toLowerCase().includes('finance')
  ) {
    const finance = matchPatterns(FINANCE_PATTERNS, 0.9)
    if (finance.length > 0) {
      results.push({
        field: 'finance_status',
        value: finance[0],
        confidence: 0.9,
      })
    }
  } else if (
    currentStep.type === 'intent' ||
    currentStep.label.toLowerCase().includes('intent')
  ) {
    const intents = matchPatterns(INTENT_PATTERNS, 0.95)
    if (intents.length > 0 && intents[0]) {
      const intentText = intents[0].toLowerCase()
      let intentValue = 'buying'
      if (intentText.includes('rent')) {
        intentValue = 'renting'
      } else if (intentText.includes('sell')) {
        intentValue = 'selling'
      }

      results.push({
        field: 'intent',
        value: intentValue,
        confidence: 0.95,
      })
    }
  }

  // Scan for bonus fields across all steps
  const fieldsToSkip = new Set([
    currentStep.type,
    currentStep.label.toLowerCase(),
  ])

  // Always scan for bedrooms
  if (!fieldsToSkip.has('bedrooms')) {
    const bedrooms = parseBedroomCount(text)
    if (bedrooms !== null && !results.find((r) => r.field === 'bedrooms')) {
      results.push({
        field: 'bedrooms',
        value: bedrooms,
        confidence: 0.7, // Lower confidence for incidental mention
      })
    }
  }

  // Always scan for location
  if (!fieldsToSkip.has('location')) {
    const postcode = extractPostcodeArea(text)
    if (postcode && !results.find((r) => r.field === 'location')) {
      results.push({
        field: 'location',
        value: postcode,
        confidence: 0.9,
      })
    }
  }

  // Always scan for intent
  if (!fieldsToSkip.has('intent')) {
    const intents = matchPatterns(INTENT_PATTERNS, 0.95)
    if (intents.length > 0 && intents[0] && !results.find((r) => r.field === 'intent')) {
      const intentText = intents[0].toLowerCase()
      let intentValue = 'buying'
      if (intentText.includes('rent')) {
        intentValue = 'renting'
      } else if (intentText.includes('sell')) {
        intentValue = 'selling'
      }

      results.push({
        field: 'intent',
        value: intentValue,
        confidence: 0.85,
      })
    }
  }

  // Always scan for must-haves
  const mustHaves = matchPatterns(MUST_HAVES_PATTERNS, 0.8)
  if (mustHaves.length > 0 && !results.find((r) => r.field === 'must_haves')) {
    results.push({
      field: 'must_haves',
      value: mustHaves,
      confidence: 0.8,
    })
  }

  return results
}

// Hook wrapper
export function useSmartParser() {
  return useMemo(
    () => ({
      parseIntakeResponse,
    }),
    []
  )
}

