import { $$ } from "@utils/dom";

import Module from "../module/Module";
import PbRowTestimonials from "./PbRowTestimonials";

export const SELECTOR = `[data-pb-row-testimonials]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PbRowTestimonials";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PbRowTestimonials(el, this.emitter));
  }
  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }

  start() {
    if (this.items) this.items.forEach(el => el.start());
  }
  stop() {
    if (this.items) this.items.forEach(el => el.stop());
  }
}

export default Factory;
