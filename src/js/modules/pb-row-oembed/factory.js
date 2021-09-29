import { $$ } from "@utils/dom";

import Module from "../module/Module";
import PbRowOEmbed from "./PbRowOEmbed";

export const SELECTOR = `[data-pb-row-oembed]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    init ? this.init() : null;
  }

  get name() {
    return "PbRowOEmbed";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new PbRowOEmbed(el, this.emitter));
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
