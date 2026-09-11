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
        forge: {
          bg: '#080c14',
          panel: '#0d131f',
          card: '#111928',
          cardHover: '#162238',
          border: '#1e293b',
          borderLight: '#2a3a54',
          cyan: '#06b6d4',
          cyanLight: '#38bdf8',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#a855f7',
          indigo: '#6366f1',
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
          }
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'cyan-glow': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'amber-glow': '0 0 15px -3px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
