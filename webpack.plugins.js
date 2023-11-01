const path = require("path");
const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const AssetsPlugin = require("assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (DEV = false, PATHS = {}) => {
  return [
    new WebpackBar(),
    new webpack.DefinePlugin({
      "process.env": {
        DEV: DEV ? JSON.stringify(true) : JSON.stringify(false)
      }
    }),
    // in dev mode only
    ...(DEV
      ? [
          new webpack.LoaderOptionsPlugin({
            debug: true
          }),
          new webpack.HotModuleReplacementPlugin()
        ]
      : // prod only
        [
          new MiniCssExtractPlugin({
            filename: "css/[name].css?hash=[chunkhash]",
            chunkFilename: "css/[name].css"
          }),
          new AssetsPlugin({
            path: path.resolve(PATHS.dist),
            filename: `assets.json`,
            prettyPrint: true,
            includeAllFileTypes: false
          })
        ])
  ];
};;
