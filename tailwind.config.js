/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rugby: {
          green: {
            DEFAULT: '#136F3D',
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
            800: '#166534',
            900: '#14532D',
            dark: '#0D4825',
          },
          navy: {
            DEFAULT: '#0F1E36',
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
            700: '#334E68',
            800: '#1E3A5F',
            900: '#0F1E36',
            dark: '#0A1220',
          },
          gold: {
            DEFAULT: '#D97706',
            light: '#FEF3C7',
            dark: '#B45309',
          },
          canvas: '#F8FAF8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px -2px rgba(15, 30, 54, 0.08), 0 2px 4px -1px rgba(15, 30, 54, 0.04)',
      }
    },
  },
  plugins: [],
}
