import { $$ } from "@utils/dom";

import Module from "../module/Module";
import Lottie from "./Lottie";

export const SELECTOR = `[data-lottie]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "Lottie";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new Lottie(el, this.emitter));
  }
  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
