import path from 'path';
import pkg from './package.json';

const THEME_NAME = pkg.name;
const SRC_PATH = path.resolve(__dirname, 'src');
const DEV = process.env.NODE_ENV !== "production";

export default {
  base: DEV ? `/` :` /wp-content/themes/${THEME_NAME}/dist/`,
  build: {
    outDir: './dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        app: path.resolve(SRC_PATH, 'js/App.js'),
        app_style: path.resolve(SRC_PATH, 'scss/App.scss'),
        acf_preview: path.resolve(SRC_PATH, 'js/ACF-Preview.js'),
        acf_preview_style: path.resolve(SRC_PATH, 'scss/ACF-preview.scss'),
        editor_style: path.resolve(SRC_PATH, 'scss/Editor-style.scss'),
        sentry: path.resolve(SRC_PATH, 'js/Sentry.js')
      },
    }
  },
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
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true
      }
    }
  },
  server: {
    origin: 'http://localhost:5173',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
}
