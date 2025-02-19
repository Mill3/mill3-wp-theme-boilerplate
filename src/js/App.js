/* eslint-disable object-shorthand */
/* eslint-disable no-undef */

import domready from "domready";

import "@core/hello";
//import "@core/power-mode";
//import "@core/gdpr";
import windmill from "@core/windmill";
import WindmillCutter from "@core/windmill.cutter";
//import WindmillFluidTypography from "@core/windmill.fluid-typography";
import WindmillImgLazyload from "@core/windmill.img-lazyload";
import WindmillPrefetch from "@core/windmill.prefetch";
import WindmillScripts from "@core/windmill.scripts";
import WindmillScroll from "@core/windmill.scroll-NEW";
import WindmillSplitting from "@core/windmill.splitting";
import WindmillWebpackChunks from "@core/windmill.webpack-chunks";
//import WindmillDomController from "@core/windmill.dom-controller";
import scrollbarWidth from "@core/scrollbar-width";
import { SCROLLBAR_HIDDEN_CLASSNAME } from "@scroll/constants";
import { chrome, edge, firefox, safari, ios, iphone, ipad, android } from "@utils/browser";
import { html, body } from "@utils/dom";
import transitions from "@transitions";

// ONLY FOR WINDMILL WEBPACK CHUNKS : registry of all modules
import Modules from '@modules/index.webpack-chunks.js';

// ONLY FOR WINDMILL DOM CONTROLLER : load all UI and modules classes
//import Modules from '@modules/index.dom-controller';
//import UI from '@ui/index.dom-controller'

/*
 * Main app
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    const browsers = [];

    if( chrome() ) browsers.push('chrome');
    if( edge() ) browsers.push('edge');
    if( firefox() ) browsers.push('firefox');
    if( safari() ) browsers.push('safari');
    if( ios() ) browsers.push('ios');
    if( iphone() ) browsers.push('iphone');
    if( ipad() ) browsers.push('ipad');
    if( android() ) browsers.push('android');

    // add browsers classnames on <html> in a single operation
    html.classList.add(...browsers);

    // set scrollbar width in css variables
    const updateScrollbarWidth = () => {
      // show scrollbar & update scrollbar's width
      html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);
      html.style.setProperty('--scrollbar-width', `${scrollbarWidth()}px`);
    }

    updateScrollbarWidth();

    // update scrollbar width for each page
    windmill.on('entering', updateScrollbarWidth);

    // install Windmill's plugins
    //windmill.use( new WindmillFluidTypography() );
    windmill.use( new WindmillScripts() );
    windmill.use( new WindmillWebpackChunks(Modules) );
    //windmill.use( new WindmillDomController({ modules: Modules, ui: UI }) );
    windmill.use( new WindmillScroll() );
    windmill.use( new WindmillCutter() );
    windmill.use( new WindmillSplitting() );
    windmill.use( new WindmillImgLazyload() );
    windmill.use( new WindmillPrefetch() );


    // if you use Windmill's Async mode, please do this:
    //   - uncomment windmill's css from /scss/commons/index.scss
    //   - use SiteAsyncTransition.js instead of SiteTransition.js
    //   - remove {% include 'site-transition.twig' %} from templates/base.twig
    //   - comment "site-transition" from scss/ui/index.scss
    //   - preferably use WindmillDomController plugin over WindmillWebpackChunks because it enable lower waiting before running page transition
    windmill.init({
      debug: process.env.NODE_ENV === "development",
      async: false,
      prevent: (url, el) => {
        // if admin-bar is shown, prevent all windmill page transition
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
  // import main styles in dev mode only
  if (process.env.NODE_ENV === "development") {
    import("../scss/App.scss").then(() => {
      setTimeout(() => {
        new App();
        import("./GridViewer");
      }, 500);
    });
  } else new App();
});
