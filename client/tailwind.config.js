import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // This adds 'Inter' to the *front* of the font stack,
      // keeping the system sans-serif fonts as fallbacks.
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Keep your custom screens
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};
