/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          cream: '#FAF6F0',
          beige: '#F5E6D3',
          peach: '#FFE5D9',
          lavender: '#E8D5E8',
          burgundy: '#C9A0A0',
          gold: '#E8D4A2',
        },
      },
      fontSize: {
        'base': '1.125rem',      // 18px zamiast 16px
        'lg': '1.25rem',         // 20px zamiast 18px
        'xl': '1.375rem',        // 22px zamiast 20px
        '2xl': '1.625rem',       // 26px zamiast 24px
        '3xl': '2rem',           // 32px zamiast 30px
        '4xl': '2.5rem',         // 40px zamiast 36px
      },
    },
  },
  plugins: [],
}

