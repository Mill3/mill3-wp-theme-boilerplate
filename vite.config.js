import path from "path";
import pkg from "./package.json";

const THEME_NAME = pkg.name;
const NODE_MODULE_PATH = path.resolve(__dirname, "node_modules");
const SRC_PATH = path.resolve(__dirname, "src");
const DEV = process.env.NODE_ENV !== "production";
const DISTRIBUTION_SCOPES = {
  "theme": {
    "dist_dir": "theme",
    "shared_bundle": true,
    "input": {
      app: path.resolve(SRC_PATH, "js/App.js"),
      app_style: path.resolve(SRC_PATH, "scss/App.scss"),
      sentry: path.resolve(SRC_PATH, "js/Sentry.js")
    }
  },
  "admin": {
    "dist_dir": "admin",
    "shared_bundle": false,
    "input": {
      acf_preview: path.resolve(SRC_PATH, "js/ACF-Preview.js"),
      acf_preview_style: path.resolve(SRC_PATH, "scss/ACF-preview.scss"),
      editor_style: path.resolve(SRC_PATH, "scss/Editor-style.scss"),
    }
  }
}

// select distribution scope based on environment variable
const DISTRIBUTION = DISTRIBUTION_SCOPES[process.env.DISTRIBUTION || "theme"];

// files to include in in app-shared.bundle, edit this to split your bundle per project needs
const bundle_files = [
  "preload-helper",
  "domready",

  "components/GForm",
  "components/MouseWheelFrame",

  //"core/age-gate",
  //"core/ajax",
  //"core/cutter",
  "core/emitter",
  "core/gdpr",
  "core/hello",
  //"core/locales",
  //"core/power-mode",
  "core/rive.listener",
  "core/scrollbar-width",
  "core/splitting",
  "core/state",
  // "core/windmill.buttons",
  "core/windmill.chunks",
  // "core/windmill.cutter",
  //"core/windmill.dom-controller",
  //"core/windmill.fluid-typography",
  "core/windmill.img-lazyload",
  "core/windmill",
  "core/windmill.prefetch",
  // "core/windmill.rive",
  "core/windmill.scripts",
  "core/windmill.scroll",
  // "core/windmill.splitting",

  "scroll/constants",
  "scroll/scroll-direction",
  "scroll/scroll-io",
  "scroll/scroll-minimum",
  "scroll/scroll-parallax",
  //"scroll/scroll-timeline",
  "scroll/scroll-to",
  //"scroll/scroll-webgl",
  "scroll/scroll",
  "scroll/utils",

  "transitions/index",
  //"transitions/SiteAsyncTransition",
  "transitions/SiteLoader",
  "transitions/SiteTransition",
  "transitions/utils",

  "utils/acf",
  //"utils/animation",
  //"utils/anime",
  "utils/array",
  "utils/breakpoint",
  "utils/browser",
  //"utils/color",
  //"utils/delay",
  "utils/dom",
  //"utils/drag",
  "utils/easings",
  //"utils/facebook-sdk",
  //"utils/force-repeaint",
  "utils/gform",
  "utils/imagesloaded",
  //"utils/interval",
  "utils/is",
  "utils/listener",
  "utils/math",
  "utils/mobile",
  //"utils/mousemove",
  //"utils/prefers-color-scheme",
  "utils/raf",
  "utils/resize",
  "utils/rive",
  //"utils/sleep",
  "utils/splitting",
  //"utils/string",
  //"utils/tab",
  //"utils/throttle",
  "utils/transform",
  //"utils/video",
  //"utils/videosloaded",
  "utils/viewport",
  //"utils/vimeo-api",
  //"utils/webgl",
  //"utils/wheel",
  //"utils/wheelTouch",
  //"utils/wheelTouchPrevent",
  //"utils/wp",
  //"utils/youtube-api",

  "ui/gdpr",
  "ui/gform",
  //"ui/mouse-wheel-facebook",
  //"ui/mouse-wheel-vimeo",
  //"ui/mouse-wheel-youtube",
  "ui/site-contact-panel",
  "ui/site-footer",
  "ui/site-header",
  "ui/site-nav",
  "ui/site-super-menu",
  "ui/site-video",

  "vendors/smooth-scroll-polyfill",

  // add more here if needed
  "modules/language-switcher"
];

export default {
  base: DEV ? `/` : `/wp-content/themes/${THEME_NAME}/dist/${DISTRIBUTION.dist_dir}/`,
  build: {
    outDir: `./dist/${DISTRIBUTION.dist_dir}`,
    assetsInlineLimit: 0, // disables inlining of all assets like <svg> as base64 in CSS
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: (entry) => {
          const defaultName = "assets/[name]-[hash].js";
          const { facadeModuleId } = entry;
          // console.log('facadeModuleId:', facadeModuleId)

          // if no facadeModuleId, return default
          if (!facadeModuleId) return defaultName;

          // skip if from node_modules
          if (facadeModuleId && facadeModuleId.includes("node_modules")) return defaultName;

          // extract entry type from facadeModuleId
          // facadeModuleId is a path like /path/to/src/js/modules/module-name.js
          // we want to extract the 'modules' part
          const type = facadeModuleId.split("/").slice(-3)[0];

          // extract the name from facadeModuleId
          // facadeModuleId is a path like /path/to/src/js/modules/module-name.js
          // we want to extract the module-name part
          const name = facadeModuleId.split("/").slice(-2)[0];

          // return the name with the hash, this will create a file like assets/module-name-[hash].js
          return `assets/${type}-${name}-[hash].js`;
        },
        manualChunks: (id) => {
          if(!DISTRIBUTION.shared_bundle) return;

          if (bundle_files.some((file) => id.includes(file))) {
            return "app-shared.bundle";
          }
          return null;
        }
      },
      input: DISTRIBUTION["input"],
    }
  },
  resolve: {
    alias: {
      "@npm": NODE_MODULE_PATH,
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
        api: "modern-compiler",
        quietDeps: true
      }
    }
  },
  server: {
    origin: "http://localhost:5173",
    hmr: {
      host: "localhost",
      protocol: "ws"
    }
  }
};
