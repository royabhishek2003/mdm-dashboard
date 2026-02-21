/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#0B1120'
        },
        status: {
          success: '#22C55E',
          warning: '#FACC15',
          danger: '#EF4444',
          muted: '#6B7280'
        }
      }
    }
  },
  plugins: []
};
