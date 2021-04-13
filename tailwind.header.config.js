const height = require("tailwindcss/defaultTheme")
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  corePlugins: {
  },
  purge: {
    enable: "true",
    mode: "all",
    preserveHtmlElements: "false",
    content: ["./**/header.liquid"],
    options: {
      whitelist: [],
    },
  },
  darkMode: 'media',
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        truegray: colors.trueGray,
        primary: colors.blue,
        secondary: colors.red,
      },
      margin: {
      },
      padding: {
      },
      inset: {
      },
      height: {
      },
      width: {},
      lineHeight: {
      },
      letterSpacing: ['dark']
    },
  },
  variants: {},
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")
  ],
};
