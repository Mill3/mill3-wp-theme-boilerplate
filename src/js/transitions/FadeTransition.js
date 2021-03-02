import anime from "animejs";
import imagesLoaded from "@utils/imagesloaded";

class FadeTransition {
  constructor() {
    this.name = "fade";

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
    this._imgLoader = imagesLoaded(next.container, this._onImagesLoaded);
  }

  beforeEnter({ next }) {
    // if images are loaded, skip here
    if (this._imagesLoaded === true || !this._imagesLoaded) return;

    return new Promise((resolve) => {
      // if imagesLoaded has not been initialized, because next.container was null in `beforeLeave` hook.
      if (!this._imgLoader) this._imgLoader = new imagesLoaded(next.container, this._onImagesLoaded);

      // wait until images are loaded
      this._imgLoader.once("always", resolve);
    });
  }

  leave({ current }) {
    return new Promise((resolve) => {
      anime({
        targets: current.container,
        opacity: 0,
        duration: 1000,
        easing: "linear",
        complete: () => resolve()
      });
    });
  }

  enter({ next }) {
    return new Promise((resolve) => {
      anime({
        targets: next.container,
        opacity: [0, 1],
        duration: 1000,
        easing: "linear",
        complete: () => resolve()
      });
    });
  }

  _onImagesLoaded() {
    this._imagesLoaded = true;
    this._imgLoader = null;
  }
}

export default FadeTransition;
