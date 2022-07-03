import { defineConfig } from 'windicss/helpers';
import colors from 'windicss/colors';
import colorPalette from './color_palette';

export default defineConfig({
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: '"Commissioner",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      },
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
      dark: colors.dark,
      light: colors.light,
      transparent: colors.transparent,
    },
  },
  plugins: [require("windicss/plugin/forms")],
});