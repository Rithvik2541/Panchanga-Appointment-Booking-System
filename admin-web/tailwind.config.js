/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',     // Soft Indigo
        secondary: '#06B6D4',   // Soft Cyan
        accent: '#14B8A6',      // Soft Teal
        success: '#10B981',     // Soft Green
        error: '#EF4444',       // Soft Red
        warning: '#F59E0B',     // Soft Amber
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}
