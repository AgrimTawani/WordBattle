import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wordle: {
          yellow: '#c8b653',
          green: '#6ca965',
          gray: '#23272a',
          black: '#000000',
          white: '#ffffff',
        },
        background: '#23272a',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#c8b653',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#6ca965',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#787c7f',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
        border: '#787c7f',
        input: '#787c7f',
        ring: '#c8b653',
        accent: {
          DEFAULT: '#6ca965',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#c0392b',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
}
export default config
