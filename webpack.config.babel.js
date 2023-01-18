/* eslint-disable no-undef */
import { name as THEME_NAME } from "./package.json";
import path from "path";
import { webpackModules } from "./webpack.modules";
import { webpackPlugins } from "./webpack.plugins";
import { webpackOptimization } from "./webpack.optimization";
import { webpackDevServer } from "./webpack.devServer";
import dotenv from "dotenv";
dotenv.config();

const DEV = process.env.NODE_ENV !== "production";

export const SERVER_PORT = 2222; // W(ebpack) is the 22nd letter ;)

export const SRC_PATH = path.join(__dirname, `./src`);

export const PATHS = {
  src: SRC_PATH,
  scss: path.resolve(SRC_PATH, `scss`),
  sass_theme: path.resolve(`./theme.js`),
  app: path.resolve(SRC_PATH, `js/App.js`),
  dist: path.resolve(`./dist`),
  public: `/wp-content/themes/${THEME_NAME}/dist/`
};

const config = {
  mode: process.env.NODE_ENV,
  devtool: DEV ? "eval" : "source-map",
  optimization: webpackOptimization(DEV),
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
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
      "@mixins": path.resolve(SRC_PATH, `scss/mixins/`),
    }
  },

  // main entries
  entry: {
    app: PATHS.app,
    ...(!DEV
      ? {
        style: path.join(PATHS.scss, `App.scss`),
        "editor-style": path.join(PATHS.scss, `Editor-style.scss`),
        // "admin-shortcodes": path.join(PATHS.src, `js/admin/shortcodes.js`),
        acfPreview: path.join(PATHS.scss, `ACF-preview.scss`),
        acfPreviewIframe: path.resolve(SRC_PATH, `js/ACF-Preview.js`)
      } : {}
    )
  },

  output: {
    path: PATHS.dist,
    filename: DEV ? `js/[name].bundle.js` : `js/[name].[chunkhash].bundle.js`,
    chunkFilename: `js/[name].[chunkhash].bundle.js`,
    publicPath: DEV ? `http://localhost:${SERVER_PORT}/` : PATHS.public
  },

  stats: {
    loggingDebug: DEV ? ['sass-loader'] : [],
  },

  ...webpackDevServer(DEV),
  module: webpackModules(DEV),
  plugins: webpackPlugins(DEV)
};

// webpack config

export default config;
