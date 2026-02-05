/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#1F2A44',
        secondary: '#F7F3EE',
        charcoal: '#2E2E2E',
        accent: '#78D5C6',
        highlight: '#F6B092',
        muted: '#E6DED8',
        surface: 'rgba(255, 255, 255, 0.8)',
        ink: '#111827'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1.5rem'
      },
      boxShadow: {
        soft: '0 24px 48px -30px rgba(31, 42, 68, 0.45)',
        glow: '0 0 0 1px rgba(31, 42, 68, 0.08), 0 20px 60px -32px rgba(120, 213, 198, 0.6)'
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(120, 213, 198, 0.3), rgba(247, 243, 238, 0.96) 52%)',
        'soft-waves': 'radial-gradient(circle at 20% 20%, rgba(246, 176, 146, 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(120, 213, 198, 0.35), transparent 40%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0px)' }
        },
        pop: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        'slide-in': {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0px)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        pop: 'pop 0.35s ease-out both',
        'slide-in': 'slide-in 0.4s ease-out both'
      }
    }
  },
  plugins: []
};
