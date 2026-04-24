/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bloom: {
          50: '#FFF0F5',
          100: '#FFE4EC',
          200: '#FFCCD8',
          300: '#FFA8BE',
          400: '#F9A8C0',
          500: '#F472A0',
          600: '#E84A85',
          700: '#C4316A',
        },
        lavender: {
          50: '#FAF8FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
        },
        gold: {
          300: '#FCD34D',
          400: '#FBBF24',
        },
      },
      backgroundImage: {
        'bloom-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #FFE4EC 100%)',
        'card-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #FFF0F5 100%)',
        'card-done': 'linear-gradient(135deg, #FFE4EC 0%, #FFCCD8 100%)',
        'button-gradient': 'linear-gradient(135deg, #F9A8C0 0%, #E84A85 100%)',
        'lavender-gradient': 'linear-gradient(135deg, #EDE9FE 0%, #FFFFFF 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'bloom-sm': '0 2px 12px 0 rgba(249, 168, 192, 0.2)',
        'bloom': '0 4px 24px 0 rgba(249, 168, 192, 0.3)',
        'bloom-lg': '0 8px 40px 0 rgba(249, 168, 192, 0.4)',
        'bloom-glow': '0 0 30px 8px rgba(249, 168, 192, 0.5)',
        'card': '0 4px 20px 0 rgba(255, 204, 216, 0.25)',
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
