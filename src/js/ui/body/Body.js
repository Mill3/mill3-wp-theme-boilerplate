import { $ } from "@utils/dom";

const SELECTOR = "body";
const DISABLED_CLASSNAME = "--scroll-disabled";

class Body {
  constructor() {
    this.initialized = false;
    this.el = null;
    this._disableScroll = this._disableScroll.bind(this);
    this._enableScroll = this._enableScroll.bind(this);
  }

  get name() {
    return `Body`;
  }

  init() {
    if (this.initialized) return;

    this.initialized = true;
    this.el = $(SELECTOR);
    this._bindEvents();
  }

  _bindEvents() {
    // register event on global emmiter system
    if (!this.emitter) return;
    this.emitter.on("Body.scroll.disable", this._disableScroll);
    this.emitter.on("Body.scroll.enable", this._enableScroll);
  }

  _disableScroll() {
    this.el.classList.add(DISABLED_CLASSNAME);
  }

  _enableScroll() {
    this.el.classList.remove(DISABLED_CLASSNAME);
  }
}

export default Body;
