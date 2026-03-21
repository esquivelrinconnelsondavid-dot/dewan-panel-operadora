/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dewan: '#FFD700',
        nuevo: '#E24B4A',
        preparando: '#EF9F27',
        buscando: '#378ADD',
        encamino: '#1D9E75',
        fondo: '#0D0D0D',
        tarjeta: '#1A1A1A',
        borde: '#2A2A2A',
      },
      animation: {
        pulso: 'pulso 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulso: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
