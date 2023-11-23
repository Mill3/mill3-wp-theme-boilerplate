const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (DEV = false) => {
  return {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "swc-loader"
        }
      },
      {
        test: /\.json$/,
        type: "json"
      },
      {
        test: /\.txt$/,
        type: "asset/source"
      },
      {
        test: /\.(woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/font-[hash][ext][query]"
        }
      },
      {
        test: /\.(svg)$/,
        type: "asset/inline"
      },
      {
        test: /.*\.(gif|png|jpe?g)$/i,
        type: 'asset/resource'
      },
      // styles loaders
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          {
            loader: DEV ? "style-loader" : MiniCssExtractPlugin.loader
          },
          `css-loader`,
          `postcss-loader`,
          {
            loader: `sass-loader`,
            options: {
              implementation: require.resolve("sass"),
              sourceMap: false
            }
          }
        ]
      }
    ]
  };
};
