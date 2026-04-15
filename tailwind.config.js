/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf1f1', 100: '#f9dddd', 200: '#f2bbbb', 300: '#ea9191',
          400: '#df6464', 500: '#d84545', 600: '#cf2e2e', 700: '#b72626',
          800: '#962020', 900: '#7a1b1b'
        },
        slatebg: '#f3f3f3', darkpanel: '#2f2f33',
        lightsection: '#f5f5f5', bodytext: '#2a2a2a'
      },
      boxShadow: { soft: '0 10px 24px rgba(0,0,0,0.08)' },
      borderRadius: { xl2: '1.25rem' }
    },
  },
  plugins: [],
};
