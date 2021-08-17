import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

export const webpackOptimization = (DEV = false) => {
  return {
    moduleIds: 'named',
    chunkIds: 'named',
    minimize: !DEV,
    minimizer: !DEV
      ? [
        new TerserPlugin({
          parallel: 4,
          terserOptions: {
            sourceMap: DEV ? 'eval' : 'source-map'
          }
        }),
        new CssMinimizerPlugin({
          parallel: 4,
          minify: DEV ? null : CssMinimizerPlugin.cssnanoMinify
        })
      ]
      : [],

  };
};
