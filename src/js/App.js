/* eslint-disable object-shorthand */
/* eslint-disable no-undef */

import barba from "@barba/core";
import domready from "domready";
import scripts from "@mill3-packages/barba-scripts";

import "@core/barba";
import BarbaWebpackChunks from "@core/barba.webpack-chunks";
import transitions from "@transitions";
import views from "@views";

// import main styles in dev mode only
if (process.env.NODE_ENV === "development") {
  import("../scss/App.scss");
  import("../scss/debug/index.scss");
}

barba.use(scripts);

const BarbaWebpackChunksInstance = new BarbaWebpackChunks();
barba.use(BarbaWebpackChunksInstance);

/*
 * Main app
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    // init barba
    barba.init({
      debug: process.env.NODE_ENV === "development",
      logLevel: 4,
      sync: false,
      timeout: 5000,
      prevent: ({ el }) => {
        if (
          /.pdf/.test(el.href.toLowerCase()) ||
          /.jpg/.test(el.href.toLowerCase()) ||
          /.png/.test(el.href.toLowerCase()) ||
          /.gif/.test(el.href.toLowerCase())
        ) {
          return true;
        }

        if (el.classList && el.classList.contains("ais-Pagination-link")) {
          return true;
        }
      },
      transitions: transitions,
      views: views
    });
  }
}

domready(() => {
  setTimeout(() => new App(), process.env.NODE_ENV === "development" ? 500 : 0);
});
