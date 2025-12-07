// tailwind.config.js

module.exports = {
  content: [
    // ... your files
  ],
  theme: {
    extend: {
      colors: {
        'ph-magenta': '#FF007F', // Primary Accent (Neon Pink)
        'ph-cyan': '#00FFFF',    // Secondary Accent (Neon Teal)
        'ph-bg': '#000000',      // Background (Pure Black)
        'ph-text': '#FFFFFF',    // Primary Text (White)
        'ph-text-secondary': '#AAAAAA', // Secondary Text (Light Gray)
      },
      // Optional: Add a custom text shadow utility for the neon glow effect
      textShadow: {
        'neon-magenta': '0 0 5px #FF007F, 0 0 10px #FF007F',
        'neon-cyan': '0 0 5px #00FFFF, 0 0 10px #00FFFF',
      },
      // Optional: Add a custom box shadow utility for the neon glow effect
      boxShadow: {
        'neon-magenta': '0 0 10px rgba(255, 0, 127, 0.8)',
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.8)',
      }
    },
  },
  plugins: [
    // A simple plugin to enable the custom text-shadow utility
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
