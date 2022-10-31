import anime from "animejs";

import { $, body } from "@utils/dom";
import { moduleDelays } from "./utils";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
  }

  loaded() {
    moduleDelays(350, 550);
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
