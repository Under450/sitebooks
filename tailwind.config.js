/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#2C3E50',
          light: '#34495E',
          dark: '#1A252F',
        },
        amber: {
          DEFAULT: '#E67E22',
          light: '#F39C12',
          dark: '#CA6F1E',
        },
        profit: '#27AE60',
        cost: '#E74C3C',
      },
    },
  },
  plugins: [],
}
