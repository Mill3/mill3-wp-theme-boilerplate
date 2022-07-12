module.exports = {
  syntax: 'postcss-scss',
  plugins: {
    "postcss-preset-env": {
      autoprefixer: {
        grid: false,
        flex: false,
        supports: true
      },
      features: {
        'clamp': false,
      }
    }
  }
};
