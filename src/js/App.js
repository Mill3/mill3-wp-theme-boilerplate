/* eslint-disable object-shorthand */
/* eslint-disable no-undef */

import domready from "domready";

import "@core/hello";
import windmill from "@core/windmill";
import WindmillScripts from "@core/windmill.scripts";
import WindmillWebpackChunks from "@core/windmill.webpack-chunks";
import MobileViewportUnit from "@core/mobile-vh";
import splitting from "@core/splitting";
import { chrome, edge, firefox, safari, ios, android } from "@utils/browser";
import { html, body } from "@utils/dom";
import { mobile } from "@utils/mobile";
import transitions from "@transitions";

// import main styles in dev mode only
if (process.env.NODE_ENV === "development") {
  import("../scss/App.scss");
  import("../scss/debug/index.scss");
}

/*
 * Main app
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    // add browser vendor classnames on <html>
    if( chrome() ) html.classList.add('chrome');
    if( edge() ) html.classList.add('edge');
    if( firefox() ) html.classList.add('firefox');
    if( safari() ) html.classList.add('safari');
    if( ios() ) html.classList.add('ios');
    if( android() ) html.classList.add('android');

    // if mobile, create mobile vh fix
    if( mobile ) MobileViewportUnit.init();

    // install Windmill's plugins
    windmill.use( new WindmillScripts() );
    windmill.use( new WindmillWebpackChunks() );

    // run Splitting.js before ready/enter transition
    windmill.on('ready', splitting);
    windmill.on('enter', splitting);

    // init windmill
    windmill.init({
      debug: process.env.NODE_ENV === "development",
      prevent: (url, el) => {
        // if admin-bar is shown, prevent all barba
        if ( body.classList.contains('admin-bar') ) return true;

        if (
          /.pdf/.test(url.toLowerCase()) ||
          /.jpg/.test(url.toLowerCase()) ||
          /.png/.test(url.toLowerCase()) ||
          /.gif/.test(url.toLowerCase())
        ) {
          return true;
        }

        if (el && el.classList && el.classList.contains("ais-Pagination-link")) return true;
      },
      transitions: transitions,
    });
  }
}

domready(() => {
  setTimeout(() => new App(), process.env.NODE_ENV === "development" ? 500 : 0);
});
