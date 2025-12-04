import { $, getBody } from "@utils/dom";
import { on, off } from "@utils/listener";
import { moduleDelays } from "./utils";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {
    this.el = $(SELECTOR);
    
    this._resolve = null;
    this._onReadyCompleted = this._onReadyCompleted.bind(this);
  }

  loaded() {
    moduleDelays(350, 550);
  }

  ready() {
    return new Promise((resolve) => {
      this._resolve = resolve;

      on(this.el, 'transitionend', this._onReadyCompleted);
      this.el.classList.add('--js-ready');
    });
  }

  _onReadyCompleted() {
    off(this.el, 'transitionend', this._onReadyCompleted);

    // remove from DOM when completed
    if( this.el ) this.el.remove();

    // add class on body when transition is ready
    getBody().classList.add("--js-ready");

    // resolve transition
    this._resolve();
    this._resolve = null;
  }
}

export default SiteLoader;
