/** @type {import('tailwindcss').Config} */
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: typography.fontFamily,
    },
  },
  plugins: [],
}
