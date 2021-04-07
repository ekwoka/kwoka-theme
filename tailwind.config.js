const height = require("tailwindcss/defaultTheme")
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    mode: "all",
    content: ["./**/*.liquid"],
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
