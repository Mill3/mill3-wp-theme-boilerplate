import { $$ } from "@utils/dom";

import MaskMedia from "@components/MaskMedia";
import Module from "../module/Module";

export const SELECTOR = `[data-mask-media]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    this._onScrollCall = this._onScrollCall.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return "MaskMedia";
  }

  init() {
    // set initialized
    this.initialized = true;

    this.items = [...$$(SELECTOR)].map(el => new MaskMedia(el));

    // if we can't find item in the page, skip here
    if( !this.items ) return;

    // listen for scroll-call events
    if (this.emitter) this.emitter.on('SiteScroll.mask-media', this._onScrollCall);
  }
  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }

  stop() {
    if (this.emitter) this.emitter.off('SiteScroll.mask-media', this._onScrollCall);
  }

  _onScrollCall(direction, obj) {
    // if event is not from entering viewport, skip here
    if( direction !== 'enter' ) return;

    // try to find item related to this event
    const item = this.items.find(item => item.el === obj.el);
    if( !item ) return;

    item.animate();
  }
}

export default Factory;
