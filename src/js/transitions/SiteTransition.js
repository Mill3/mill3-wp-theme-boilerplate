import { $ } from "@utils/dom";
import { once } from "@utils/listener";
import { moduleDelays } from "./utils";

const SELECTOR = "[data-site-transition]";

class SiteTransition {
  constructor() {
    this.el = $(SELECTOR);
  }


  exit() {
    return new Promise(resolve => {
      once(this.el, 'transitionend', resolve);

      this.el.classList.remove("pointer-events-none", "visibility-hidden");
      this.el.classList.add('--js-exit');
    });
  }

  entering() {
    moduleDelays(350, 450);
  }

  enter() {
    return new Promise(resolve => {
      once(this.el, 'transitionend', () => {
        this.el.classList.remove('--js-exit', '--js-enter');
        this.el.classList.add("visibility-hidden", "pointer-events-none");

        resolve();
      });

      this.el.classList.add('--js-enter');
    });
  }
}

export default SiteTransition;
