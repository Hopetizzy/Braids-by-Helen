/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master brand tokens for Braids by Helen
        primary: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f7cfd6',
          300: '#efa9b6',
          400: '#e4768c',
          500: '#d44c69',
          600: '#b63351',
          700: '#962842',
          800: '#70263D', // Primary Burgundy
          900: '#5b1e30',
          950: '#380f1b',
          DEFAULT: '#70263D',
        },
        burgundy: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f7cfd6',
          300: '#efa9b6',
          400: '#e4768c',
          500: '#d44c69',
          600: '#b63351',
          700: '#962842',
          800: '#70263D',
          900: '#5b1e30',
          DEFAULT: '#70263D',
        },
        ivory: {
          50: '#ffffff',
          100: '#FFF9F2', // Warm Ivory
          200: '#f7f0e4',
          300: '#ede1cf',
          DEFAULT: '#FFF9F2',
        },
        gold: {
          50: '#faf6ee',
          100: '#f4ecda',
          200: '#ecd9b5',
          300: '#e1c28b',
          400: '#d3aa67',
          500: '#C5A46D', // Soft Gold
          600: '#ab854c',
          700: '#87673b',
          DEFAULT: '#C5A46D',
        },
        accent: {
          DEFAULT: '#C5A46D',
          light: '#e1c28b',
          dark: '#ab854c',
        },
        espresso: {
          700: '#4f3d38',
          800: '#3f312d',
          900: '#302522', // Espresso Brown
          950: '#1f1816',
          DEFAULT: '#302522',
        },
        secondary: {
          DEFAULT: '#D9A6A6', // Dusty Rose
          light: '#edd2d2',
          dark: '#bf8484',
        },
        dustyrose: {
          50: '#fcf6f6',
          100: '#f8ebeb',
          200: '#edd2d2',
          300: '#e1b7b7',
          400: '#D9A6A6',
          500: '#bf8484',
          600: '#a36767',
          DEFAULT: '#D9A6A6',
        },
        surface: '#FFFFFF',

        // Backwards compatibility aliases for existing unmigrated components
        rosewood: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f7cfd6',
          300: '#efa9b6',
          400: '#e4768c',
          500: '#d44c69',
          600: '#70263D',
          700: '#70263D',
          800: '#5b1e30',
          900: '#380f1b',
          950: '#220810',
        },
        blush: {
          50: '#fcf6f6',
          100: '#f8ebeb',
          200: '#edd2d2',
          300: '#e1b7b7',
          400: '#D9A6A6',
          500: '#bf8484',
          600: '#a36767',
          700: '#846458',
          800: '#6d5249',
          900: '#5b453e',
        },
        cream: {
          50: '#ffffff',
          100: '#FFF9F2',
          200: '#f7f0e4',
          300: '#ede1cf',
          DEFAULT: '#FFF9F2',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(48, 37, 34, 0.05)',
        'card': '0 10px 30px -5px rgba(112, 38, 61, 0.08)',
        'floating': '0 20px 40px -15px rgba(48, 37, 34, 0.18)',
        'gold': '0 4px 20px -2px rgba(197, 164, 109, 0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
