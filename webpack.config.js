const path = require("path");
const webpackModules = require("./webpack.modules");
const webpackPlugins = require("./webpack.plugins");
const webpackOptimization = require("./webpack.optimization");
const webpackDevServer = require("./webpack.devServer");
const dotenv = require("dotenv");
dotenv.config();

// grab theme name from package.json
const THEME_NAME = require("./package.json").name;

// detect if we're in dev mode
const DEV = process.env.NODE_ENV !== "production";

// webpack dev server port
const SERVER_PORT = 2222;

// paths
const SRC_PATH = path.join(__dirname, `./src`);
const PATHS = {
  src: SRC_PATH,
  scss: path.resolve(SRC_PATH, `scss`),
  app: path.resolve(SRC_PATH, `js/App.js`),
  dist: path.resolve(`./dist`),
  public: `/wp-content/themes/${THEME_NAME}/dist/`
};

const config = {
  mode: process.env.NODE_ENV,
  devtool: DEV ? "eval" : "source-map",
  optimization: webpackOptimization(DEV),
  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, ".webpack_cache")
  },
  //
  // This allow loose imports from any file discarding its relative location to the import :
  // ie: import { myModule } from "@modules/myModule";
  //
  resolve: {
    alias: {
      "@components": path.resolve(SRC_PATH, `js/components/`),
      "@core": path.resolve(SRC_PATH, `js/core/`),
      "@modules": path.resolve(SRC_PATH, `js/modules/`),
      "@scroll": path.resolve(SRC_PATH, `js/scroll/`),
      "@transitions": path.resolve(SRC_PATH, `js/transitions`),
      "@ui": path.resolve(SRC_PATH, `js/ui/`),
      "@utils": path.resolve(SRC_PATH, `js/utils/`),
      "@vendors": path.resolve(SRC_PATH, `js/vendors/`),
      "@mill3-sass": path.resolve(SRC_PATH, `scss/_lib/`),
      "@mill3-sass-mixins": path.resolve(SRC_PATH, `scss/_lib/mixins/`),
      "@mill3-sass-vars": path.resolve(SRC_PATH, `scss/_lib/vars/`),
      "@mixins": path.resolve(SRC_PATH, `scss/mixins/`)
    }
  },

  // main entries
  entry: {
    app: PATHS.app,
    ...(!DEV
      ? {
          style: path.join(PATHS.scss, `App.scss`),
          "editor-style": path.join(PATHS.scss, `Editor-style.scss`),
          acfPreview: path.join(PATHS.scss, `ACF-preview.scss`),
          acfPreviewIframe: path.resolve(SRC_PATH, `js/ACF-Preview.js`),
          sentry: path.resolve(SRC_PATH, `js/Sentry.js`)
        }
      : {})
  },
  output: {
    path: PATHS.dist,
    filename: DEV ? `js/[name].bundle.js` : `js/[name].[chunkhash].bundle.js`,
    chunkFilename: `js/[name].[chunkhash].bundle.js`,
    publicPath: DEV ? `http://localhost:${SERVER_PORT}/` : PATHS.public
  },
  stats: {
    loggingDebug: DEV ? ["sass-loader"] : []
  },
  ...webpackDevServer(DEV, SERVER_PORT, PATHS),
  module: webpackModules(DEV),
  plugins: webpackPlugins(DEV, PATHS)
};

module.exports = config;
