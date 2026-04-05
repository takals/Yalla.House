import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFD400',
          hover:   '#E6C200',
          dark:    '#B89B00',
        },
        surface: '#FFFFFF',
        bg:      '#EDEEF2',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config
