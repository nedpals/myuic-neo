import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        uic: {
          DEFAULT: "#E65B7A",
          "50": "#FEFAFB",
          "100": "#FCE9ED",
          "200": "#F6C5D0",
          "300": "#F1A2B3",
          "400": "#EB7E97",
          "500": "#E65B7A",
          "600": "#DF2A53",
          "700": "#B51C3E",
          "800": "#85142D",
          "900": "#540D1D",
        },
      },
      fontFamily: {
        sans: '"Commissioner",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      },
    },
  },
  plugins: [require("windicss/plugin/forms")],
});