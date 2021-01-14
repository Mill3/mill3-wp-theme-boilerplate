import { $$ } from "@utils/dom";

import Module from "../module/Module";
import PbRowForm from "./PBRowForm";

export const SELECTOR = `[data-pb-row-form]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PbRowForm";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PbRowForm(el, this.emitter));
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }
}

export default Factory;
