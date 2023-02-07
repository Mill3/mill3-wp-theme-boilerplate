module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/react",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-postcss",
    "@storybook/addon-storysource",
    {
       name: 'storybook-addon-sass-postcss',
       options: {
        test: /\.(scss|sass)$/i,
        sassLoaderOptions: {
          implementation: require('sass'),
        },
       },
    },
  ],
  "framework": "@storybook/html"
}
