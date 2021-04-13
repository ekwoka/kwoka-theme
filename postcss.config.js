module.exports = {
  plugins: [

    ...(process.env.NODE_ENV === "production"
      ? [
        require(`tailwindcss`)(`./tailwind.config.js`),
        require(`autoprefixer`),
      ]
      : []),
      ...(process.env.NODE_ENV === "development"
      ? [
        require(`tailwindcss`)(`./tailwind.config.js`),
        require(`autoprefixer`),
      ]
      : []),
      ...(process.env.NODE_ENV === "header"
      ? [
        require(`tailwindcss`)(`./tailwind.header.config.js`),
        require(`autoprefixer`),
        require(`cssnano`)({
          preset: "default",
        }),
      ]
      : []),
  ],
};
