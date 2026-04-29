import { $, getHTML } from "@utils/dom";
import { on, off } from "@utils/listener";
import { moduleDelays } from "./utils";

const SELECTOR = "[data-site-loader]";

class SiteLoader {
  constructor() {    
    this._resolve = null;
    this._onReadyCompleted = this._onReadyCompleted.bind(this);
  }

  loaded() {
    moduleDelays(350, 550);
    if( !motion_reduced ) getHTML().classList.add('--js-inview-enabled');
  }

  ready() {
    this.el = $(SELECTOR);
    
    return new Promise((resolve) => {
      this._resolve = resolve;

      on(this.el, 'transitionend', this._onReadyCompleted);

      getHTML().classList.add('--js-ready');
      this.el.classList.add('--js-ready');
    });
  }

  _onReadyCompleted() {
    off(this.el, 'transitionend', this._onReadyCompleted);

    // remove from DOM when completed
    if( this.el ) this.el.remove();

    // resolve transition
    this._resolve();
    this._resolve = null;
  }
}

export default SiteLoader;
