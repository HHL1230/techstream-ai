/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FFDE59',
        'secondary': '#FFFFFF',
        'input': '#F3F4F6',
        'accent': '#F43F8A',
        'accent-hover': '#D73779',
        'accent2': '#1ECBEB',
        'accent2-hover': '#1AB0CF',
        'text-primary': '#2F2F2F',
        'text-secondary': '#6B7280',
        'border-color': '#E5E7EB',
        'error': '#EF4444',
        'error-bg': '#FEE2E2',
        'error-border': '#FCA5A5',
      }
    },
  },
  plugins: [],
}
