import { $$ } from "@utils/dom";

import Module from "../module/Module";
import GoogleMap from "./GoogleMap";

export const SELECTOR = `[data-google-map]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "GoogleMap";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new GoogleMap(el));
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
