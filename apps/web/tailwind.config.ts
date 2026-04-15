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
          DEFAULT: '#D4764E',
          hover:   '#BF6840',
          dark:    '#A85A36',
          light:   'rgba(212, 118, 78, 0.12)',
          light2:  'rgba(212, 118, 78, 0.18)',
          'solid-bg': '#FFF5EE',
          'badge-text': '#8B4513',
        },
        surface: '#FFFFFF',
        bg:      '#EDEEF2',
        // Dashfolio-inspired dark theme (public pages)
        'page-dark':    '#161616',
        'surface-dark': '#1C1C1C',
        'card-dark':    '#2B2B2B',
        'card-dark-hover': '#333333',
        'text-on-dark':           '#FFFFFF',
        'text-on-dark-secondary': '#888888',
        'text-on-dark-muted':     '#7C7F82',
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
        'card-dark': '6px',
        pill: '500px',
      },
      boxShadow: {
        'dark-card': 'rgba(0,0,0,0.035) 0px 0.3px 0.3px -0.75px, rgba(0,0,0,0.04) 0px 1.14px 1.14px -1.5px, rgba(0,0,0,0.043) 0px 5px 5px -2.25px',
      },
      backdropBlur: {
        header: '12px',
      },
      keyframes: {
        'drawer-up': {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        'drawer-down': {
          from: { transform: 'translateY(0)' },
          to:   { transform: 'translateY(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'drawer-up':   'drawer-up 0.3s cubic-bezier(0.16,1,0.3,1)',
        'drawer-down': 'drawer-down 0.2s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':     'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config
