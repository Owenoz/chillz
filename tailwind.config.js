/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:        '#7C3AED',   // violet-700
        'primary-light':'#A78BFA',   // violet-400
        'primary-dark': '#5B21B6',   // violet-900
        'primary-glow': '#8B5CF6',   // violet-500
        accent:         '#F59E0B',   // amber
        'accent-pink':  '#EC4899',   // pink
        bg:             '#0A0A0F',   // near-black
        'bg-2':         '#0F0A1E',   // deep purple tinted black
        surface:        '#13111C',   // dark card
        'surface-2':    '#1A1628',   // slightly lighter card
        'surface-3':    '#221E33',   // hover surface
        border:         '#2D2645',   // purple-tinted border
        'border-light': '#3D3660',   // lighter border
        muted:          '#7C7A91',   // muted text
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'purple-glow': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.3) 0%, transparent 70%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(124,58,237,0.4)',
        'glow-md':  '0 0 24px rgba(124,58,237,0.5)',
        'glow-lg':  '0 0 40px rgba(124,58,237,0.4)',
        'card':     '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}
