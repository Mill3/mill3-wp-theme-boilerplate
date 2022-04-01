import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";

import Module from "../module/Module";
import PbRowWrapperReveal from "./PbRowWrapperReveal";

export const SELECTOR = `[data-pb-row-wrapper-reveal]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PbRowWrapperReveal";
  }

  init() {
    // do nothing for mobile device
    if( mobile ) return;

    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PbRowWrapperReveal(el, this.emitter));
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
