/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './public/index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Assistant', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'Assistant', 'sans-serif'],
      },
      colors: {
        fashion: {
          dark: '#111111',
          primary: '#282C3F',
          secondary: '#535665',
          muted: '#7E818C',
          light: '#F5F5F6',
          bg: '#FFFFFF',
          border: '#EAEAEC',
          accent: '#FF3F6C',
          'accent-light': '#FFF0F4',
          discount: '#03A685',
          'discount-bg': '#E6F7F3',
          rating: '#14958F'
        }
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 18px rgba(0,0,0,0.1)',
        subtle: '0 1px 4px rgba(0,0,0,0.05)',
        dropdown: '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      }
    },
  },
  plugins: [],
};
