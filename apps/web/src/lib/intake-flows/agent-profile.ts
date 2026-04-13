import type { IntakeStep } from '@/components/conversational-intake'

export function getAgentProfileFlow(
  translations: Record<string, string>
): IntakeStep[] {
  return [
    {
      id: 'agency_name',
      question: translations.q_agency_name || "What's the name of your agency or your trading name?",
      type: 'text',
      validation: { required: true, errorMsg: translations.err_agency_name || 'Please enter your agency name.' },
      helperText: translations.hint_agency_name || 'e.g., John Smith & Associates',
    },
    {
      id: 'license_number',
      question: translations.q_license_number || "What's your agent license number?",
      type: 'text',
      validation: { required: true, errorMsg: translations.err_license_number || 'Please enter your license number.' },
      helperText: translations.hint_license_number || 'Your regulatory registration (e.g., IHK, IVD)',
    },
    {
      id: 'property_types',
      question: translations.q_property_types || "What types of properties do you specialize in?",
      type: 'multi-select',
      options: [
        { value: 'flat', label: translations.opt_flat || 'Flat / Apartment' },
        { value: 'terraced', label: translations.opt_terraced || 'Terraced House' },
        { value: 'semi_detached', label: translations.opt_semi_detached || 'Semi-Detached House' },
        { value: 'detached', label: translations.opt_detached || 'Detached House' },
        { value: 'new_build', label: translations.opt_new_build || 'New Build' },
        { value: 'commercial', label: translations.opt_commercial || 'Commercial' },
      ],
      validation: { required: true },
    },
    {
      id: 'focus',
      question: translations.q_focus || "Do you focus on sales, rentals, or both?",
      type: 'select',
      options: [
        { value: 'sale', label: translations.opt_sale || 'Sales Only' },
        { value: 'rent', label: translations.opt_rent || 'Rentals Only' },
        { value: 'both', label: translations.opt_both || 'Both' },
      ],
      validation: { required: true },
    },
    {
      id: 'coverage_areas',
      question: translations.q_coverage_areas || "What postcodes or areas do you cover? (Enter separated by commas)",
      type: 'text',
      validation: { required: true, errorMsg: translations.err_coverage_areas || 'Please enter your coverage areas.' },
      helperText: translations.hint_coverage_areas || 'e.g., 10115, 10785, 12099',
    },
    {
      id: 'years_experience',
      question: translations.q_years_experience || "How many years of experience do you have?",
      type: 'number',
      validation: { required: true, min: 0, errorMsg: translations.err_years_experience || 'Please enter a valid number.' },
      helperText: translations.hint_years_experience || 'e.g., 5',
    },
    {
      id: 'team_size',
      question: translations.q_team_size || "How many people are on your team?",
      type: 'number',
      validation: { required: true, min: 1, errorMsg: translations.err_team_size || 'Please enter a valid team size.' },
      helperText: translations.hint_team_size || 'e.g., 1 (just you) or 5 (including support staff)',
    },
    {
      id: 'selling_points',
      question: translations.q_selling_points || "What makes your agency stand out?",
      type: 'text',
      validation: { required: true, errorMsg: translations.err_selling_points || 'Please tell us what makes you special.' },
      helperText: translations.hint_selling_points || 'Your unique value proposition — what do buyers/sellers love about working with you?',
    },
  ]
}
