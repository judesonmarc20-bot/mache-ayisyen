/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Outfit pou tit yo (karaktè, moderne), Inter pou tèks kouran (fasil li).
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Ble mache a — koulè prensipal branding lan (enspire pa ble
        // Karayib la), itilize pou lyen, bouton, ak eleman aktif yo.
        brand: {
          50: '#eef5fb',
          100: '#d9e9f6',
          200: '#b3d1ee',
          300: '#7fb0e0',
          400: '#4a8bcc',
          500: '#286cb3',
          600: '#1c5494',
          700: '#174473',
          800: '#143a5f',
          900: '#122f4c',
          950: '#0b1d30',
        },
        // Koray/mango — koulè segondè pou aksan, badj, ak souliyen enpòtan.
        coral: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#fec9aa',
          300: '#fda474',
          400: '#fb7a3c',
          500: '#f45a17',
          600: '#e5410d',
          700: '#bd2f0d',
          800: '#962713',
          900: '#792213',
        },
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgb(15 76 129 / 0.08), 0 1px 3px -1px rgb(15 76 129 / 0.06)',
        card: '0 4px 20px -4px rgb(15 76 129 / 0.12)',
        lift: '0 12px 32px -8px rgb(15 76 129 / 0.22)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.45s ease-out both',
        'scale-in': 'scaleIn 0.18s ease-out both',
        'slide-in-right': 'slideInRight 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
