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
        command: {
          950: '#070a13',
          900: '#0b1120',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        ner: {
          emerald: '#10b981', // Safe
          amber: '#f59e0b',   // Watch
          orange: '#f97316',  // Warning
          crimson: '#ef4444', // Critical Blocked
          cyan: '#06b6d4',    // Medical / Tech
          indigo: '#6366f1',  // Priority Route
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      boxShadow: {
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.35)',
        'neon-crimson': '0 0 20px rgba(239, 68, 68, 0.45)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.35)',
        'neon-amber': '0 0 15px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [],
}
