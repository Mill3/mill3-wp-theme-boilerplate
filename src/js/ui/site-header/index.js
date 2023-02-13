import { $ } from "@utils/dom";

class SiteHeader {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
  }

  init() {}
  destroy() {
    this.el = null;
    this.emitter = null;
  }
}

export default SiteHeader;
