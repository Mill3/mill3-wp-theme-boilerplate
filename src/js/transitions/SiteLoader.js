import anime from "animejs";

import { $, $$, rect } from "@utils/dom";
import Viewport from "@utils/viewport";

const SELECTOR = "[data-site-loader]";

function inViewport(el) {
  if (!el) return false;

  const { top } = rect(el);
  return top <= Viewport.height;
}

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
  }

  loaded() {
    // increment --row-delay css variable to each .pb-row-wrapper[data-scroll-section] in viewport during initialization
    [ ...$$(`main .pb-row-wrapper[data-scroll-section]`) ].forEach((el, index) => {
      if (inViewport(el)) el.style.setProperty("--row-delay", `${index * 650}ms`);
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

          // resolve transition
          resolve();
        }
      });
    });
  }
}

export default SiteLoader;
