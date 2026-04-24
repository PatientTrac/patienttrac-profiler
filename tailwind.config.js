/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020a14',
          900: '#060e1c',
          800: '#0a1628',
          700: '#0f2040',
          600: '#1a3060',
          500: '#2a4080',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e8cc9a',
          dark:  '#9a7a4a',
          50:    'rgba(201,169,110,0.05)',
          100:   'rgba(201,169,110,0.10)',
          200:   'rgba(201,169,110,0.20)',
        },
        cyan: {
          DEFAULT: '#00d4ff',
          dark:    '#00a8cc',
          50:      'rgba(0,212,255,0.05)',
          100:     'rgba(0,212,255,0.10)',
          200:     'rgba(0,212,255,0.20)',
        },
        muted: '#8a9bc0',
        subtle: '#3a4a6a',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
