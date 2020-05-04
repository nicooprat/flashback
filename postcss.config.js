module.exports = {
  plugins: [
    require('tailwindcss')({
      purge: [
        './src/**/*.html',
        './src/**/*.vue',
      ],
      corePlugins: {
        container: false,
      },
      theme: {},
      variants: {},
      plugins: [],
    }),
    require('autoprefixer'),
  ]
}
