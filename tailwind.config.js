export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#0F172A',
        dim: '#475569',
        muted: '#94A3B8',
        wash: '#F8FAFC',
        line: '#E2E8F0',
        accent: '#2563EB',
        positive: '#16A34A',
        negative: '#DC2626',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
