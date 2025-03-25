import path from 'path';

const SRC_PATH = path.resolve(__dirname, 'src');

// detect if we're in dev mode
const DEV = process.env.NODE_ENV !== "production";

export default {
  base: DEV ? '/' : '/wp-content/themes/mill3-wp-theme/dist/',
  build: {
    outDir: './dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        app: path.resolve(SRC_PATH, 'js/App.js'),
        // admin: path.resolve(SRC_PATH, 'admin.js'),
        app_style: path.resolve(SRC_PATH, 'scss/App.scss'),
        acf_preview: path.resolve(SRC_PATH, 'scss/ACF-preview.scss'),
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
  server: {
    origin: 'http://localhost:5173',
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
}
