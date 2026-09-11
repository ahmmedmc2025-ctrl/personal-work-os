/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1034A8',
          hover: '#0D2B8A',
          light: '#EEF2FF',
          dark: '#1E40AF',
        },
        accent: {
          DEFAULT: '#FE8F01',
          hover: '#E07D00',
          light: '#FFF7ED',
        },
        background: {
          light: '#F7F8FA',
          dark: '#0F172A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        border: {
          light: '#E5E7EB',
          dark: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
