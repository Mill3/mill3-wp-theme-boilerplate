import { $$ } from "@utils/dom";

import Module from "../module/Module";
import PrefersColorSchemeBtn from "./PrefersColorSchemeBtn";

export const SELECTOR = `[data-prefers-color-scheme-btn]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PrefersColorSchemeBtn";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PrefersColorSchemeBtn(el, this.emitter));
  }
  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
