import { $$ } from "@utils/dom";

import Module from "@modules/module/Module";
import Throttle from "@utils/throttle";
import Gform from "./GForm";

export const SELECTOR = `.gform_wrapper`;
class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;
    this.throttle = null;

    this._onFormResize = this._onFormResize.bind(this);
    this._onThrottle = this._onThrottle.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return "Gform";
  }

  init() {
    // create throttler
    if( !this.throttle ) this.throttle = Throttle({ cb: this._onThrottle, delay: 200, onlyAtEnd: true });

    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new Gform(el, this.emitter));

    // if there is at least one form, emit SiteScroll.update immediatly
    if( this.items.length > 0 ) this._onThrottle();
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {
    this.items.forEach(gform => gform.on('resize', this._onFormResize));
  }
  _unbindEvents() {
    this.items.forEach(gform => gform.off('resize', this._onFormResize));
  }

  _onFormResize() {
    // throttle for 200ms before SiteScroll.update
    this.throttle.init();
  }
  _onThrottle() {
    this.emitter.emit("SiteScroll.update");
  }
}

export default Factory;
