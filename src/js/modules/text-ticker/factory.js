import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";

import Module from "../module/Module";
import TextTicker from "./TextTicker";

export const SELECTOR = `[data-text-ticker]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "TextTicker";
  }

  init() {
    // set initialized
    this.initialized = true;

    // do not init this module on mobile devices
    if (mobile) return;

    this.items = [...$$(SELECTOR)].map(el => new TextTicker(el, this.emitter));
  }
  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
