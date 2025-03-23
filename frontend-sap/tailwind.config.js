/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '400px',
        // => @media (min-width: 768px) { ... }

        'md': '800px',
        // => @media (min-width: 1024px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1280px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1536px) { ... }
        'xxl': '1920px',
        'maxh900' : {
          raw: '(max-height: 900px)'
        }
      }
    },

  },
  plugins: [],
}
