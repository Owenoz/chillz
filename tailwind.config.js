/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6c63ff',
        'primary-light': '#a78bfa',
        'primary-dark': '#4f46e5',
        accent: '#38bdf8',
        bg: '#080a12',
        surface: '#0e1118',
        'surface-2': '#141720',
        border: '#1e2130',
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
