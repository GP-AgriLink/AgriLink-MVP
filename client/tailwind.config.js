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
        'fadeIn': 'fadeIn 0.6s ease-out',
        'fadeIn-delay-100': 'fadeIn 0.6s ease-out 0.1s',
        'fadeIn-delay-200': 'fadeIn 0.6s ease-out 0.2s',
        'fadeIn-delay-300': 'fadeIn 0.6s ease-out 0.3s',
        'fadeIn-delay-400': 'fadeIn 0.6s ease-out 0.4s',
        'fadeIn-delay-500': 'fadeIn 0.6s ease-out 0.5s',
        'fadeIn-delay-600': 'fadeIn 0.6s ease-out 0.6s',
        'slideInLeft': 'slideInLeft 0.7s ease-out',
        'slideInRight': 'slideInRight 0.7s ease-out',
        'slideInDown': 'slideInDown 0.6s ease-out',
        'slideInUp': 'slideInUp 0.6s ease-out',
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
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
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideInLeft: {
          '0%': {
            transform: 'translateX(-50px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideInRight: {
          '0%': {
            transform: 'translateX(50px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideInDown: {
          '0%': {
            transform: 'translateY(-30px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        slideInUp: {
          '0%': {
            transform: 'translateY(30px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'animation-delay': (value) => {
            return {
              'animation-delay': value,
            };
          },
        },
        {
          values: theme('animationDelay'),
        }
      );
    },
  ],
};
