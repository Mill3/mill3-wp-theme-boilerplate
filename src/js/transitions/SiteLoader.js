import anime from "animejs";
import imagesLoaded from "imagesloaded";

import { $ } from "@utils/dom";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
    this.name = "loader";
  }

  beforeOnce({ next }) {
    // preload images from next container before once transition
    return new Promise(resolve => {
      imagesLoaded(next.container, resolve);
    });
  }

  once() {
    return new Promise(resolve => {
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
