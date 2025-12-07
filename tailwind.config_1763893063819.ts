// tailwind.config.ts - Updated for ProfitHack AI Neon Branding

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 1. Custom Neon Colors
        'ph-magenta': '#FF007F', // Primary Accent (Neon Pink)
        'ph-cyan': '#00FFFF',    // Secondary Accent (Neon Teal)
        'ph-bg': '#000000',      // Background (Pure Black)
        'ph-text': '#FFFFFF',    // Primary Text (White)
        'ph-text-secondary': '#AAAAAA', // Secondary Text (Light Gray)
      },
      // 2. Custom Box Shadow for the outer glow
      boxShadow: {
        'neon-magenta': '0 0 10px rgba(255, 0, 127, 0.8), 0 0 20px rgba(255, 0, 127, 0.4)',
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4)',
      },
      // 3. Custom Text Shadow for the text glow
      textShadow: {
        'neon-magenta': '0 0 5px #FF007F, 0 0 10px #FF007F',
        'neon-cyan': '0 0 5px #00FFFF, 0 0 10px #00FFFF',
      }
    },
  },
  plugins: [
    // Plugin to enable the custom text-shadow utility (since it's not native to Tailwind)
    function ({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow-neon-magenta': {
          textShadow: theme('textShadow.neon-magenta'),
        },
        '.text-shadow-neon-cyan': {
          textShadow: theme('textShadow.neon-cyan'),
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}

export default config
