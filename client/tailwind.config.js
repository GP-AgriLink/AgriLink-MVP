/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // '3xl': '1290px',
        // '4xl': '1500px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};
