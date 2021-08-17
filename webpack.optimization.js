import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

export const webpackOptimization = (DEV = false) => {
  return {
    moduleIds: 'named',
    chunkIds: 'named',
    minimize: !DEV,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          sourceMap: DEV ? 'eval' : 'source-map'
        }
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessor: require(`cssnano`),
        cssProcessorPluginOptions: {
          preset: [`default`, { discardComments: { removeAll: true } }]
        },
        canPrint: true
      })
    ]
  };
};
