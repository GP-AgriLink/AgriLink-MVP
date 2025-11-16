/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
      },
      animation: {
        'blob': 'blob 8s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            borderRadius: '60% 40% 30% 70% / 50% 60% 70% 40%',
          },
          '50%': {
            borderRadius: '30% 70% 60% 40% / 70% 40% 50% 60%',
          },
        },
      },
    },
  },
  plugins: [],
};
