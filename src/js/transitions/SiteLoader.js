import anime from "animejs";

import { $ } from "@utils/dom";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
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
