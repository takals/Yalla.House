import type { IntakeStep } from '@/components/conversational-intake'

export function getHunterPassportFlow(
  translations: Record<string, string>
): IntakeStep[] {
  return [
    {
      id: 'intent',
      question: translations.q_intent || "Are you looking to buy or rent a property?",
      type: 'select',
      options: [
        { value: 'buy', label: translations.opt_buy || 'Buy' },
        { value: 'rent', label: translations.opt_rent || 'Rent' },
      ],
      validation: { required: true },
    },
    {
      id: 'target_areas',
      question: translations.q_target_areas || "Which areas interest you? Select as many as you'd like.",
      type: 'chips',
      options: [
        { value: 'mitte', label: translations.opt_mitte || 'Mitte' },
        { value: 'prenzlauer_berg', label: translations.opt_prenzlauer_berg || 'Prenzlauer Berg' },
        { value: 'kreuzberg', label: translations.opt_kreuzberg || 'Kreuzberg' },
        { value: 'charlottenburg', label: translations.opt_charlottenburg || 'Charlottenburg' },
        { value: 'schoeneberg', label: translations.opt_schoeneberg || 'Schöneberg' },
        { value: 'neukoelln', label: translations.opt_neukoelln || 'Neukölln' },
        { value: 'friedrichshain', label: translations.opt_friedrichshain || 'Friedrichshain' },
      ],
      validation: { required: true },
    },
    {
      id: 'budget_min',
      question: translations.q_budget_min || "What's your minimum budget (in €)?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_budget_min || 'Please enter a valid minimum budget.' },
      helperText: translations.hint_budget_min || 'e.g., 250000',
    },
    {
      id: 'budget_max',
      question: translations.q_budget_max || "What's your maximum budget (in €)?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_budget_max || 'Please enter a valid maximum budget.' },
      helperText: translations.hint_budget_max || 'e.g., 500000',
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
      id: 'must_haves',
      question: translations.q_must_haves || "What features are important to you? Pick as many as you like, or skip if you're flexible.",
      type: 'chips',
      options: [
        { value: '_none', label: translations.opt_no_preference || "I'm flexible" },
        { value: 'balcony', label: translations.opt_balcony || 'Balcony' },
        { value: 'near_station', label: translations.opt_near_station || 'Near Station' },
        { value: 'garden', label: translations.opt_garden || 'Garden' },
        { value: 'parking', label: translations.opt_parking || 'Parking' },
        { value: 'ev_charging', label: translations.opt_ev_charging || 'EV Charging' },
        { value: 'period_features', label: translations.opt_period_features || 'Period Features' },
        { value: 'open_plan', label: translations.opt_open_plan || 'Open Plan' },
        { value: 'guest_wc', label: translations.opt_guest_wc || 'Guest WC' },
        { value: 'storage', label: translations.opt_storage || 'Storage' },
        { value: 'quiet_street', label: translations.opt_quiet_street || 'Quiet Street' },
      ],
    },
    {
      id: 'dealbreakers',
      question: translations.q_dealbreakers || "Any deal-breakers we should know about?",
      type: 'chips',
      options: [
        { value: '_none', label: translations.opt_no_dealbreakers || 'No deal-breakers' },
        { value: 'no_auctions', label: translations.opt_no_auctions || 'No Auctions' },
        { value: 'no_retirement', label: translations.opt_no_retirement || 'No Retirement Homes' },
        { value: 'no_ground_floor', label: translations.opt_no_ground_floor || 'No Ground Floor' },
        { value: 'no_top_floor_no_lift', label: translations.opt_no_top_floor_no_lift || 'No Top Floor Without Lift' },
        { value: 'no_shared_ownership', label: translations.opt_no_shared_ownership || 'No Shared Ownership' },
        { value: 'no_ex_social', label: translations.opt_no_ex_social || 'No Ex-Social Housing' },
        { value: 'no_estate_only', label: translations.opt_no_estate_only || 'No Estate Agency Only' },
      ],
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
