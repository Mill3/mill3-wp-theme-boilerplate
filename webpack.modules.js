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
        loader: `raw-loader`
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
        loader: `image-webpack-loader`,
        options: {
          query: {
            mozjpeg: {
              quality: 75,
              progressive: true,
              optimizationLevel: 4,
              interlaced: false
            },
            pngquant: {
              quality: [0.6, 1],
              speed: 4
            },
            optipng: {
              optimizationLevel: 3
            },
            gifsicle: {
              optimizationLevel: 1
            },
            svgo: {
              plugins: [
                {
                  removeViewBox: false
                },
                {
                  removeEmptyAttrs: false
                }
              ]
            }
          }
        }
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
