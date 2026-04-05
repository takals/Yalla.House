/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moss: '#2E4036',
        clay: '#CC5833',
        cream: '#F2F0E9',
        charcoal: '#1A1A1A',
        'moss-light': '#3A5045',
        'moss-dark': '#1E2B24',
        'clay-light': '#D9694A',
        'clay-dark': '#A84428',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        drama: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
