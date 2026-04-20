/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#eef4ff',
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          500: '#165dff',
          600: '#1557e5',
          700: '#124bcc'
        },
        accent: {
          100: '#e9f1ff',
          500: '#3b82f6',
          600: '#2563eb'
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
          'radial-gradient(circle at top left, rgba(22,93,255,.28), transparent 30%), radial-gradient(circle at bottom right, rgba(59,130,246,.18), transparent 25%)'
      }
    }
  },
  plugins: []
};
