import type { IntakeStep } from '@/components/conversational-intake'

export function getOwnerBriefFlow(
  translations: Record<string, string>
): IntakeStep[] {
  return [
    {
      id: 'property_address',
      question: translations.q_property_address || "What's the address of your property?",
      type: 'text',
      validation: { required: true, errorMsg: translations.err_property_address || 'Please enter the property address.' },
      helperText: translations.hint_property_address || 'e.g., 123 High Street, London',
    },
    {
      id: 'property_type',
      question: translations.q_property_type || "What type of property is it?",
      type: 'select',
      options: [
        { value: 'flat', label: translations.opt_flat || 'Flat / Apartment' },
        { value: 'terraced', label: translations.opt_terraced || 'Terraced House' },
        { value: 'semi_detached', label: translations.opt_semi_detached || 'Semi-Detached House' },
        { value: 'detached', label: translations.opt_detached || 'Detached House' },
        { value: 'bungalow', label: translations.opt_bungalow || 'Bungalow' },
      ],
      validation: { required: true },
    },
    {
      id: 'bedrooms',
      question: translations.q_bedrooms || "How many bedrooms?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_bedrooms || 'Please enter a valid number of bedrooms.' },
      helperText: translations.hint_bedrooms || 'e.g., 3',
    },
    {
      id: 'bathrooms',
      question: translations.q_bathrooms || "How many bathrooms?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_bathrooms || 'Please enter a valid number of bathrooms.' },
      helperText: translations.hint_bathrooms || 'e.g., 2',
    },
    {
      id: 'asking_price',
      question: translations.q_asking_price || "What's your asking price (in £)?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_asking_price || 'Please enter a valid price.' },
      helperText: translations.hint_asking_price || 'e.g., 450000',
    },
    {
      id: 'seller_situation',
      question: translations.q_seller_situation || "What's your seller situation?",
      type: 'select',
      options: [
        { value: 'no_chain', label: translations.opt_no_chain || 'No Chain' },
        { value: 'chain', label: translations.opt_chain || 'Part of a Chain' },
        { value: 'investment', label: translations.opt_investment || 'Investment Property' },
        { value: 'probate', label: translations.opt_probate || 'Probate Sale' },
        { value: 'divorce', label: translations.opt_divorce || 'Divorce Settlement' },
        { value: 'relocation', label: translations.opt_relocation || 'Relocation' },
      ],
      validation: { required: true },
    },
    {
      id: 'timeline',
      question: translations.q_timeline || "When do you need to sell?",
      type: 'select',
      options: [
        { value: 'asap', label: translations.opt_asap || 'ASAP' },
        { value: '1_month', label: translations.opt_1_month || 'Within 1 Month' },
        { value: '3_months', label: translations.opt_3_months || 'Within 3 Months' },
        { value: '6_months', label: translations.opt_6_months || 'Within 6 Months' },
        { value: 'flexible', label: translations.opt_flexible || 'Flexible' },
      ],
      validation: { required: true },
    },
    {
      id: 'property_condition',
      question: translations.q_property_condition || "What's the overall condition of the property?",
      type: 'select',
      options: [
        { value: 'excellent', label: translations.opt_excellent || 'Excellent' },
        { value: 'good', label: translations.opt_good || 'Good' },
        { value: 'needs_updating', label: translations.opt_needs_updating || 'Needs Updating' },
        { value: 'needs_renovation', label: translations.opt_needs_renovation || 'Needs Major Renovation' },
      ],
      validation: { required: true },
    },
    {
      id: 'preferred_agent_tier',
      question: translations.q_preferred_agent_tier || "What level of support do you need?",
      type: 'select',
      options: [
        { value: 'advisory', label: translations.opt_advisory || 'Advisory (Guidance Only)' },
        { value: 'assisted', label: translations.opt_assisted || 'Assisted (Help with Buyers)' },
        { value: 'managed', label: translations.opt_managed || 'Managed (Full Service)' },
      ],
      validation: { required: true },
    },
    {
      id: 'notes',
      question: translations.q_notes || "Any additional information agents should know?",
      type: 'text',
      helperText: translations.hint_notes || 'This is optional — share anything relevant to your sale.',
    },
  ]
}
