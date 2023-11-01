const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (DEV = false) => {
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
;
