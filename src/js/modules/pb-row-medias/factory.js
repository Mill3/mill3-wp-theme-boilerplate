import { $$ } from "@utils/dom";

import Module from "../module/Module";
import PbRowMedias from "./PbRowMedias";

export const SELECTOR = `[data-pb-row-medias]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PbRowMedias";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PbRowMedias(el, this.emitter));
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
