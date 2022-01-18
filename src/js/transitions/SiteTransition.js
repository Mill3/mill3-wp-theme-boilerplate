import anime from "animejs";
import ImagesLoaded from "@utils/imagesloaded";

import { $ } from "@utils/dom";

const SELECTOR = "[data-site-transition]";

class SiteTransition {
  constructor() {
    this.el = $(SELECTOR);
    this.name = "transition";

    this._imagesLoaded = false;
    this._imgLoader = null;
    this._onImagesLoaded = this._onImagesLoaded.bind(this);
  }

  beforeLeave({ next }) {
    this._imagesLoaded = false;

    // if next.container is not loaded, try again during `beforeEnter` hook.
    if (!next.container) return;

    // preload images from next container during leave transition
    // do not wait to images preloading to finish to start leave transition
    this._imgLoader = new ImagesLoaded(next.container, this._onImagesLoaded);
  }

  beforeEnter({ next }) {
    // if images are loaded, skip here
    if (this._imagesLoaded === true) return;

    return new Promise((resolve) => {
      // if imagesLoaded has not been initialized, because next.container was null in `beforeLeave` hook.
      if (!this._imgLoader) this._imgLoader = new ImagesLoaded(next.container, this._onImagesLoaded);

      // wait until images are loaded
      this._imgLoader.once("always", resolve);
    });
  }

  leave() {
    return new Promise((resolve) => {
      anime({
        targets: this.el,
        opacity: [0, 1],
        duration: 250,
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
        duration: 250,
        easing: "linear",
        complete: () => {
          this.el.classList.add("visibility-hidden");
          resolve();
        }
      });
    });
  }

  _onImagesLoaded() {
    this._imagesLoaded = true;

    this._imgLoader.destroy();
    this._imgLoader = null;
  }
}

export default SiteTransition;
