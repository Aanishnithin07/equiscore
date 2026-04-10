import type { Config } from 'tailwindcss'

export default {
  // Enforce dark mode based on classes
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0F', // near black, slight blue-purple tint
          surface: '#111118', // cards, sidebars
          elevated: '#1A1A28', // active states, hover
        },
        accent: {
          primary: '#7C6FF7', // violet-purple
          secondary: '#00D4AA', // teal-green
          danger: '#FF6B6B', // coral-red
          warning: '#FFB347', // amber
        },
        text: {
          primary: '#F0F0F8', // almost white, slight blue
          secondary: '#8888AA', // muted
          tertiary: '#55556A', // very muted, hints
        },
        border: {
          subtle: 'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'], // headers, primary display
        body: ['DM Sans', 'sans-serif'], // main body, data
        mono: ['JetBrains Mono', 'monospace'], // score numbers, code-like stats
      },
      transitionTimingFunction: {
        'ease-fast': 'ease', // General fast ease as per spec
      },
      transitionDuration: {
        'fast': '150ms', // All transitions: 0.15s ease
      },
      boxShadow: {
        'focus': '0 0 0 2px rgba(124,111,247,0.4)', // The only box-shadow allowed besides subtle card borders
      }
    },
  },
  plugins: [],
} satisfies Config
