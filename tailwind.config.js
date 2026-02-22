/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace']
      },
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#0B1120'
        },
        indigo: {
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        status: {
          success: '#22C55E',
          warning: '#FACC15',
          danger: '#EF4444',
          muted: '#6B7280'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'fade-up': 'fadeInUp 0.45s cubic-bezier(.16,1,.3,1) both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(.16,1,.3,1) both',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59,130,246,0.35)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.35)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    }
  },
  plugins: []
};
