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
      // Apple-grade type scale — mirrors Website/style.css tokens
      // See CLAUDE.md + rules/frontend/vanilla.md for the canonical hierarchy
      fontSize: {
        'display':  ['clamp(2.75rem, 6vw, 4.5rem)',   { lineHeight: '1.05', letterSpacing: '-0.022em', fontWeight: '800' }],
        'title-1':  ['clamp(2rem, 4vw, 3rem)',        { lineHeight: '1.1',  letterSpacing: '-0.018em', fontWeight: '800' }],
        'title-2':  ['clamp(1.5rem, 2.5vw, 2rem)',    { lineHeight: '1.2',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'lede':     ['1.1875rem',                      { lineHeight: '1.5',  letterSpacing: '-0.005em' }],
        'body':     ['.9375rem',                       { lineHeight: '1.5' }],
        'small':    ['.8125rem',                       { lineHeight: '1.5' }],
      },
      letterSpacing: {
        'display':       '-0.022em',
        'tight-display': '-0.018em',
      },
      lineHeight: {
        'display': '1.05',
        'body':    '1.5',
      },
      spacing: {
        'section-top': '96px',
        'section-bot': '112px',
        'section-gap': '64px',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config
