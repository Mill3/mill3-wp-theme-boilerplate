import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

export const webpackOptimization = (DEV = false) => {
  return {
    minimize: !DEV,
    minimizer: [
      new TerserPlugin({
        cache: !DEV,
        parallel: !DEV,
        sourceMap: !DEV
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
