/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9FC',
        panel: '#F2F0FA',
        ink: {
          DEFAULT: '#2E2B3D',
          soft: '#5B5770',
          faint: '#8B87A0',
        },
        periwinkle: {
          50: '#F1F1FA',
          100: '#E4E4F5',
          200: '#C9C9EC',
          300: '#A9AADD',
          400: '#8D8FCE',
          500: '#7B83C4',
          600: '#6367A8',
          700: '#4F5288',
        },
        sage: {
          100: '#E4F3E7',
          300: '#B7DFC0',
          500: '#7FBF9E',
          600: '#5FA482',
          700: '#478469',
        },
        amber: {
          100: '#FBF0DD',
          300: '#F3D8A0',
          500: '#E8B975',
          700: '#C4934C',
        },
        coral: {
          100: '#FBE7E4',
          500: '#DE8477',
          700: '#B35F52',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(46, 43, 61, 0.15)',
        lift: '0 14px 40px -16px rgba(123, 131, 196, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(0.92)' },
        },
        fillLine: {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        floatIn: {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1.6s ease-in-out infinite',
        fillLine: 'fillLine 0.6s ease forwards',
        floatIn: 'floatIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
