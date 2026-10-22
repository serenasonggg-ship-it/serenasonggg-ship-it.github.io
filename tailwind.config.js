/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        dash: { to: { strokeDashoffset: '-24' } },
      },
      animation: {
        dash: 'dash 1.2s linear infinite',
      },
      fontFamily: {
        sans: ['"Helvetica Now Var"', '"PingFang SC"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
