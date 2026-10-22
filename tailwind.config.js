/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A192F',
          800: '#112240',
          700: '#233554',
        },
        royal: {
          600: '#1D4ED8',
          500: '#2563EB',
          400: '#3B82F6',
        },
        gold: {
          500: '#F59E0B',
          400: '#FBBF24',
        },
        light: {
          100: '#F3F4F6',
          50: '#F9FAFB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
