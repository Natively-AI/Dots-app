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
        'dots-teal': '#00D9A5',
        'dots-teal-dark': '#00B88A',
        'dots-teal-light': '#E6F9F4',
        'dots-gray': '#4A4A4A',
        'dots-gray-light': '#F5F5F5',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

