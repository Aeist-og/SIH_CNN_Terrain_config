/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
