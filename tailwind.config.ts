import type { Config } from 'tailwindcss';
import colorPalette from './color_palette';
import * as colors from 'tailwindcss/colors';

export default {
  content: {
    relative: true,
    files: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ]
  },
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: '"Commissioner",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      },
      height: {
        '13': '3.25rem',
      },
      width: {
        '13': '3.25rem',
        '1/9': `${(1 / 9) * 100}%`,
        '5/9': `${(5 / 9) * 100}%`,
        '4/9': `${(4 / 9) * 100}%`
      }
    },
    colors: {
      primary: colorPalette.primary,
      danger: colorPalette.danger,
      warning: colorPalette.warning,
      success: colorPalette.success,
      info: colorPalette.info,
      gray: colors.gray,
      black: colors.black,
      white: colors.white,
      zinc: colors.zinc,
      transparent: colors.transparent,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar')
  ]
} satisfies Config;
