/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Now Var"', '"PingFang SC"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
