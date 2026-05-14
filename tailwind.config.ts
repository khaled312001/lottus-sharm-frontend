import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#e8efef',
          100: '#c5d4d4',
          400: '#2a6868',
          500: '#1c5454',
          600: '#134949',
          700: '#0d3a3a',
          800: '#0a2828',
          900: '#051818',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#fbf6ed',
          100: '#f3e8d0',
          200: '#e7d1a1',
          300: '#d9bf86',
          400: '#cfb377',
          500: '#c9a86a',
          600: '#a88a52',
          700: '#7a6539',
          800: '#52442a',
          900: '#2d251a',
        },
        gold: {
          DEFAULT: '#c9a86a',
          light: '#d9bf86',
          deep: '#a88a52',
        },
        teal: {
          DEFAULT: '#0d3a3a',
          deep: '#0a2828',
          bright: '#134949',
          ink: '#051818',
        },
        cream: '#f7f1e3',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        sand: '#fef3c7',
        sea: '#0e7490',
        sun: '#f59e0b',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', '"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwindcss-rtl')],
};

export default config;
