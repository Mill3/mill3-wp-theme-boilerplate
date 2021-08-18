import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { PATHS } from "./webpack.config.babel";

export const webpackModules = (DEV = false) => {
  return {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: `babel-loader`,
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.json$/,
        loader: `json-loader`
      },
      {
        test: /\.txt$/,
        loader: `raw-loader`
      },
      {
        test: /\.(woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/font-[hash][ext][query]'
        }
      },
      {
        test: /\.(mp4|webm|wav|mp3)(\?v=[0-9]\.[0-9]\.[0-9])?(\?[0-9a-zA-Z]*)?$/,
        loader: `file-loader`,
        options: {
          name: `medias/[hash].[ext]`
        }
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
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
            loader: DEV ? 'style-loader' : MiniCssExtractPlugin.loader
          },
          `css-loader`,
          {
            loader: `sass-loader`,
            options: {
              // Prefer `node-sass`
              implementation: require.resolve("node-sass"),
              sourceMap: false
            }
          },
          {
            loader: "sass-json-loader",
            options: { path: PATHS["sass_theme"] }
          }
        ]
      }
    ]
  };
};
