import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary background — military/mech dark theme
        surface: {
          DEFAULT: '#18181b', // zinc-900
          raised: '#27272a',  // zinc-800
          overlay: '#3f3f46', // zinc-700
        },
        // Accent — amber glow for PAID mode / highlights
        accent: {
          DEFAULT: '#fbbf24', // amber-400
          dim: '#92400e',     // amber-900 for subtle tinting
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
