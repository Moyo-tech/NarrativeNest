/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PRIMARY PALETTE - Deep purple-grays from AMU
        primary: {
          50: '#f5f3f9',
          100: '#e9e6f2',
          200: '#d3cde5',
          300: '#b8acd5',
          400: '#9987c2',
          500: '#7c6fad',
          600: '#5f5189',
          700: '#4a3f6d',
          800: '#3a3647',
          900: '#2d2a3e',
          950: '#1e1c28',
        },

        // ACCENT PALETTE - Soft purples from meetmind
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },

        // NEUTRAL PALETTE - For text and UI elements
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // SEMANTIC COLORS
        success: {
          light: '#86efac',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        warning: {
          light: '#fde047',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
        },
        error: {
          light: '#fca5a5',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },

      // TYPOGRAPHY SYSTEM - Screenplay formatting
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Courier Prime', 'Courier', 'monospace'],
        screenplay: ['Courier Prime', 'Courier New', 'monospace'],
      },

      fontSize: {
        'screenplay-action': ['12pt', { lineHeight: '1.5', letterSpacing: '0' }],
        'screenplay-dialogue': ['12pt', { lineHeight: '1.5', letterSpacing: '0' }],
        'screenplay-character': ['12pt', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'screenplay-heading': ['12pt', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '700' }],
      },

      // SPACING & LAYOUT
      maxWidth: {
        'screenplay': '6in',
      },

      // GLASSMORPHISM
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },

      // SHADOWS - Multi-layer depth
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
        'neumorphic': 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.05)',
        'elevation-1': '0 1px 3px rgba(0,0,0,0.3)',
        'elevation-2': '0 4px 6px rgba(0,0,0,0.3)',
        'elevation-3': '0 10px 20px rgba(0,0,0,0.3)',
        'elevation-4': '0 15px 30px rgba(0,0,0,0.4)',
      },

      // GRADIENTS
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #3b82f6 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },

      // ANIMATIONS
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },

      // BORDER RADIUS
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glass-panel': {
          'background': 'rgba(58, 54, 71, 0.7)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-card': {
          'background': 'rgba(45, 42, 62, 0.6)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.08)',
        },
        '.screenplay-action': {
          'font-family': 'Courier Prime, Courier, monospace',
          'font-size': '12pt',
          'line-height': '1.5',
          'margin-left': '1.5in',
          'margin-right': '1in',
        },
        '.screenplay-dialogue': {
          'font-family': 'Courier Prime, Courier, monospace',
          'font-size': '12pt',
          'line-height': '1.5',
          'margin-left': '2.5in',
          'margin-right': '2in',
        },
        '.screenplay-character': {
          'font-family': 'Courier Prime, Courier, monospace',
          'font-size': '12pt',
          'line-height': '1.5',
          'margin-left': '3.5in',
          'text-transform': 'uppercase',
          'font-weight': '700',
        },
        '.screenplay-heading': {
          'font-family': 'Courier Prime, Courier, monospace',
          'font-size': '12pt',
          'line-height': '1.5',
          'margin-left': '1.5in',
          'text-transform': 'uppercase',
          'font-weight': '700',
        },
      })
    },
  ],
}
