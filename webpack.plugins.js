/* eslint-disable no-undef */
import path from "path";
import webpack from "webpack";
import WebpackBar from "webpackbar";
import DashboardPlugin from "webpack-dashboard/plugin";
import AssetsPlugin from "assets-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { PATHS } from "./webpack.config.babel";

export const webpackPlugins = (DEV = false) => {
  return [
    new WebpackBar(),
    // new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        DEV: DEV ? JSON.stringify(true) : JSON.stringify(false)
      }
    }),
    // in dev mode only
    ...(DEV
      ? [
          new DashboardPlugin(),
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
          new CleanWebpackPlugin({
            root: path.resolve(PATHS.dist),
            verbose: true,
            dry: false
          }),
          new AssetsPlugin({
            path: path.resolve(PATHS.dist),
            filename: `assets.json`,
            prettyPrint: true,
            includeAllFileTypes: false
          })
        ])
  ];
};
