import anime from "animejs";

import { $, $$, body } from "@utils/dom";
import { inViewport } from "./utils";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
  }

  loaded() {
    // increment --module-delay css variable to each [data-module-delay] in viewport during initialization
    [ ...$$(`[data-module-delay]`) ].forEach((el, index) => {
      const isInViewport = inViewport(el);
      el.setAttribute('data-module-delay', isInViewport);
      if( isInViewport ) el.style.setProperty("--module-delay", `${index * 350 + 550}ms`);
    });
  }

  ready() {
    return new Promise((resolve) => {
      anime({
        targets: this.el,
        opacity: 0,
        duration: 250,
        easing: "linear",
        complete: () => {
          // remove from DOM when completed
          this.el.parentNode.removeChild(this.el);

          // add class on body when transition is ready
          body.classList.add("--js-ready");

          // resolve transition
          resolve();
        }
      });
    });
  }
}

export default SiteLoader;
