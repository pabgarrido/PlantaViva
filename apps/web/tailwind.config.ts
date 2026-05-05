import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#1e3a5f',
          600: '#172d4a',
          700: '#0f1f33',
          900: '#07111e',
        },
        terracotta: {
          50: '#fdf2ee',
          100: '#fae5dc',
          400: '#d4693d',
          500: '#c2522a',
          600: '#a84323',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
