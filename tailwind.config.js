/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#eef4ff',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af'
        },
        accent: {
          100: '#fff7ed',
          500: '#f97316',
          600: '#ea580c'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.14)'
      },
      backgroundImage: {
        'auth-grid':
          'radial-gradient(circle at top left, rgba(37,99,235,.24), transparent 30%), radial-gradient(circle at bottom right, rgba(249,115,22,.18), transparent 25%)'
      }
    }
  },
  plugins: []
};
