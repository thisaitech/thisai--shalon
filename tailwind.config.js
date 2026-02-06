/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',
        secondary: '#F5F3FF',
        charcoal: '#2C2B3C',
        accent: '#FF9FB2',
        highlight: '#FFD59E',
        muted: '#E8E3F9',
        surface: 'rgba(255, 255, 255, 0.8)',
        ink: '#1D1930',
        lilac: '#B9A7FF',
        sky: '#AEE6FF'
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        '2xl': '1.5rem'
      },
      boxShadow: {
        soft: '0 24px 48px -32px rgba(44, 43, 60, 0.35)',
        glow: '0 0 0 1px rgba(108, 92, 231, 0.12), 0 24px 60px -32px rgba(108, 92, 231, 0.45)'
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at 20% 10%, rgba(108, 92, 231, 0.25), rgba(245, 243, 255, 0.98) 58%)',
        'soft-waves':
          'radial-gradient(circle at 10% 20%, rgba(255, 159, 178, 0.35), transparent 50%), radial-gradient(circle at 80% 0%, rgba(174, 230, 255, 0.35), transparent 45%)'
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
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
          '50%': { transform: 'scale(1.06)', opacity: 1 }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        pop: 'pop 0.35s ease-out both',
        'slide-in': 'slide-in 0.4s ease-out both',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
