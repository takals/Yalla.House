import type { IntakeStep, IntakeStepOptionGroup } from '@/components/conversational-intake'
import { getFilteredCategories, getTagLabel, getCategoryLabel } from '@/lib/property-tags'

interface CountryContext {
  countryCode: string
  currency: string
  regions: Array<{ prefix: string; label: string; range?: string }>
  locale?: string
  intent?: 'buy' | 'rent' | 'both' | null
}

export function getHunterPassportFlow(
  translations: Record<string, string>,
  country?: CountryContext
): IntakeStep[] {
  // Build area options from country config regions (fallback to Berlin districts for DE)
  const areaOptions = country?.regions?.length
    ? country.regions.map(r => ({
        value: r.prefix.toLowerCase(),
        label: translations[`opt_area_${r.prefix.toLowerCase()}`] || r.label,
      }))
    : [
        // Legacy fallback — Berlin districts
        { value: 'mitte', label: translations.opt_mitte || 'Mitte' },
        { value: 'prenzlauer_berg', label: translations.opt_prenzlauer_berg || 'Prenzlauer Berg' },
        { value: 'kreuzberg', label: translations.opt_kreuzberg || 'Kreuzberg' },
        { value: 'charlottenburg', label: translations.opt_charlottenburg || 'Charlottenburg' },
        { value: 'schoeneberg', label: translations.opt_schoeneberg || 'Schöneberg' },
        { value: 'neukoelln', label: translations.opt_neukoelln || 'Neukölln' },
        { value: 'friedrichshain', label: translations.opt_friedrichshain || 'Friedrichshain' },
      ]

  const currencySymbol = country?.currency === 'GBP' ? '£' : '€'
  const isRent = false // Will be resolved dynamically by the intake component

  return [
    {
      id: 'intent',
      question: translations.q_intent || "Are you looking to buy or rent?",
      type: 'select',
      options: [
        { value: 'buy', label: translations.opt_buy || 'Buy' },
        { value: 'rent', label: translations.opt_rent || 'Rent' },
      ],
      validation: { required: true },
    },
    {
      id: 'search_status',
      question: translations.q_search_status || "What best describes where you are right now?",
      type: 'select',
      options: [
        { value: 'actively_searching', label: translations.opt_actively_searching || 'Actively searching' },
        { value: 'thinking_about_it', label: translations.opt_thinking_about_it || 'Thinking about moving' },
        { value: 'just_exploring', label: translations.opt_just_exploring || 'Just exploring' },
        { value: 'need_to_sell_first', label: translations.opt_need_to_sell_first || 'Need to sell my place first' },
        { value: 'waiting_for_right_one', label: translations.opt_waiting_for_right_one || 'Waiting for the right one' },
      ],
      validation: { required: true },
    },
    {
      id: 'target_areas',
      question: translations.q_target_areas || "Which areas interest you? Select as many as you'd like.",
      type: 'chips',
      options: areaOptions,
      validation: { required: true },
    },
    {
      id: 'budget_min',
      question: translations.q_budget_min || `What's your minimum budget (in ${currencySymbol})?`,
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_budget_min || 'Please enter a valid minimum budget.' },
      helperText: translations.hint_budget_min || (country?.currency === 'GBP' ? 'e.g., 200000' : 'e.g., 250000'),
    },
    {
      id: 'budget_max',
      question: translations.q_budget_max || `What's your maximum budget (in ${currencySymbol})?`,
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_budget_max || 'Please enter a valid maximum budget.' },
      helperText: translations.hint_budget_max || (country?.currency === 'GBP' ? 'e.g., 500000' : 'e.g., 500000'),
    },
    {
      id: 'property_types',
      question: translations.q_property_types || "What types of properties interest you?",
      type: 'multi-select',
      options: [
        { value: 'flat', label: translations.opt_flat || 'Flat / Apartment' },
        { value: 'terraced', label: translations.opt_terraced || 'Terraced House' },
        { value: 'semi_detached', label: translations.opt_semi_detached || 'Semi-Detached House' },
        { value: 'detached', label: translations.opt_detached || 'Detached House' },
        { value: 'new_build', label: translations.opt_new_build || 'New Build' },
        { value: 'period', label: translations.opt_period || 'Period Property' },
      ],
      validation: { required: true },
    },
    {
      id: 'min_bedrooms',
      question: translations.q_min_bedrooms || "How many bedrooms minimum?",
      type: 'select',
      options: [
        { value: 'studio', label: translations.opt_studio || 'Studio' },
        { value: '1', label: translations.opt_1br || '1 Bedroom' },
        { value: '2', label: translations.opt_2br || '2 Bedrooms' },
        { value: '3', label: translations.opt_3br || '3 Bedrooms' },
        { value: '4plus', label: translations.opt_4plus || '4+ Bedrooms' },
      ],
      validation: { required: true },
    },
    {
      id: 'preference_tags',
      question: translations.q_preference_tags || "What matters most to you? Tap once for 'want', twice for 'must have', three times for 'no-go'. Skip anything you don't care about.",
      type: 'tagged-preferences',
      optionGroups: buildTagOptionGroups(country, translations),
      helperText: translations.hint_preference_tags || 'Tap to cycle: Want → Need → No-go → Off',
    },
    {
      id: 'finance_status',
      question: translations.q_finance_status || "What's your finance status?",
      type: 'select',
      options: [
        { value: 'not_specified', label: translations.opt_not_specified || 'Prefer not to say' },
        { value: 'mortgage_pending', label: translations.opt_mortgage_pending || 'Mortgage Application Pending' },
        { value: 'mortgage_approved', label: translations.opt_mortgage_approved || 'Mortgage Pre-Approved' },
        { value: 'cash', label: translations.opt_cash || 'Cash Ready to Go' },
      ],
      validation: { required: true },
    },
    {
      id: 'timeline',
      question: translations.q_timeline || "When are you looking to move?",
      type: 'select',
      options: [
        { value: 'asap', label: translations.opt_asap || 'ASAP' },
        { value: '3m', label: translations.opt_3m || 'Within 3 Months' },
        { value: '6m', label: translations.opt_6m || 'Within 6 Months' },
        { value: '1y', label: translations.opt_1y || 'Within 1 Year' },
        { value: 'flexible', label: translations.opt_flexible || 'Flexible' },
      ],
      validation: { required: true },
    },
  ]
}

// ─────────────────────────────────────────────────────────────────────
// Build grouped tag options from the property-tags taxonomy
// ─────────────────────────────────────────────────────────────────────

function buildTagOptionGroups(
  country: CountryContext | undefined,
  translations: Record<string, string>
): IntakeStepOptionGroup[] {
  const countryCode = country?.countryCode ?? 'GB'
  const locale = country?.locale ?? 'en'
  const intent = country?.intent ?? null

  const categories = getFilteredCategories(countryCode, intent)

  return categories.map(cat => ({
    groupLabel: getCategoryLabel(cat, locale),
    groupIcon: cat.icon,
    options: cat.tags.map(tag => ({
      value: tag.slug,
      label: getTagLabel(tag, locale),
    })),
  }))
}
