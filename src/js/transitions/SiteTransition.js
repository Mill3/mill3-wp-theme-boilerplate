import anime from "animejs";

import { $ } from "@utils/dom";

const SELECTOR = "[data-site-transition]";

class SiteTransition {
  constructor() {
    this.el = $(SELECTOR);
  }


  exit() {
    this.el.classList.remove("pointer-events-none");

    return new Promise((resolve) => {
      anime({
        targets: this.el,
        opacity: [0, 1],
        delay: 150,
        duration: 450,
        easing: "linear",
        complete: () => resolve()
      });

      this.el.classList.remove("visibility-hidden");
    });
  }

  enter() {
    return new Promise((resolve) => {
      anime({
        targets: this.el,
        opacity: [1, 0],
        duration: 150,
        easing: "linear",
        complete: () => {
          this.el.classList.add("visibility-hidden", "pointer-events-none");
          resolve();
        }
      });
    });
  }
}

export default SiteTransition;
