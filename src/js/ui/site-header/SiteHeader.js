import { $ } from "@utils/dom";

export const SELECTOR = "[data-site-header]";

class SiteHeader {
  constructor(init = false) {
    this.initialized = false;
    this.el = null;

    init ? this.init() : null;
  }

  get name() {
    return `SiteHeader`;
  }

  init() {
    this.initialized = true;
    this.el = $(SELECTOR);
  }

  destroy() {
    this.el = null;
    this.initialized = false;
  }
}

export default SiteHeader;
