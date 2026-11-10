/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          400: '#8C9BFF',
          500: '#5B6CFF',
          600: '#4453E0'
        },
        violet: {
          400: '#A78BFA',
          500: '#7C5CFF'
        },
        gold: {
          300: '#F2DCA0',
          400: '#E8C56B',
          500: '#D4AC4C'
        }
      },
      fontFamily: {
        display: ['"Songti SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      borderRadius: {
        '4xl': '2rem'
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(91,108,255,0.55)',
        gold: '0 0 32px -14px rgba(232,197,107,0.6)'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        wave: {
          '0%,100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        wave: 'wave 1.6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'fade-up': 'fadeUp .7s cubic-bezier(.22,.61,.36,1) both'
      }
    }
  },
  plugins: []
}
