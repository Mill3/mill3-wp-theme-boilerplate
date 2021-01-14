import LocomotiveScroll from "locomotive-scroll";

import { $, body, html } from "@utils/dom";

export const SELECTOR = "[data-scroll-container]";
export const SCROLL_MIN_CLASSNAME = "--js-scroll-min";
export const SCROLL_DOWN_CLASSNAME = "--js-scroll-down";
export const SCROLL_UP_CLASSNAME = "--js-scroll-up";
export const SCROLL_DISABLE_CLASSNAME = "--js-scroll-disabled";

const SCROLL_THRESHOLD = 200;
const SCROLL_DIFF_THRESHOLD = 2;

let SINGLETON;

class SiteScroll {
  constructor(init = false) {
    this.initialized = false;
    this.hasScrolledAboveThreshold = false;
    this.scrollDirection = null;
    this.previousScrollY = null;
    this.el = null;

    SINGLETON = this;

    this._onCall = this._onCall.bind(this);
    this._onScroll = this._onScroll.bind(this);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.update = this.update.bind(this);
    this.scrollUp = this.scrollUp.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return `SiteScroll`;
  }

  static getSingleton() {
    return SINGLETON;
  }

  init() {
    this.initialized = true;
    this.hasScrolledAboveThreshold = false;
    this.scrollDirection = null;
    this.previousScrollY = 0;
    this.el = $(SELECTOR);

    this.scroll = new LocomotiveScroll({
      el: this.el,
      smooth: true,
      repeat: false
    });

    this.scroll.on("call", this._onCall);
    this.scroll.on("scroll", this._onScroll);

    this._bindEvents();
  }

  destroy() {
    if (this.scroll) {
      this.scroll.off("call", this._onCall);
      this.scroll.off("scroll", this._onScroll);
      this.scroll.destroy();
    }

    if (this.emitter) {
      this.emitter.off(`${this.name}.stop`, this.stop);
      this.emitter.off(`${this.name}.start`, this.start);
      this.emitter.off(`${this.name}.update`, this.update);
      this.emitter.off(`${this.name}.scrollUp`, this.scrollUp);
    }

    this.el = null;
    this.scroll = null;
    this.initialized = false;
    this.hasScrolledAboveThreshold = false;
    this.scrollDirection = null;
    this.previousScrollY = null;
  }

  update() {
    if (this.scroll) this.scroll.update();
  }

  start() {
    if (!this.scroll) return;
    this.scroll.start();
    html.classList.remove(SCROLL_DISABLE_CLASSNAME);
  }

  stop() {
    if (!this.scroll) return;
    this.scroll.stop();
    html.classList.add(SCROLL_DISABLE_CLASSNAME);
  }

  scrollTo(target, offset) {
    if (this.scroll) this.scroll.scrollTo(target, offset);
  }

  scrollUp() {
    if (this.scroll) this.scroll.scrollTo(0, 0, 100);
  }

  _bindEvents() {
    // register event on global emmiter system
    if (!this.emitter) return;

    this.emitter.on(`${this.name}.stop`, this.stop);
    this.emitter.on(`${this.name}.start`, this.start);
    this.emitter.on(`${this.name}.update`, this.update);
    this.emitter.on(`${this.name}.scrollUp`, this.scrollUp);
  }

  // Called when an element has a data-scroll-call='my-call' attribute
  // Module should register SiteScroll Emitter event matching the attribute value
  _onCall(func, direction, obj) {
    if (Array.isArray(func)) func.forEach(f => this._executeCall(f, direction, obj));
    else this._executeCall(func, direction, obj);
  }

  // This method is called from external modules, all refering to this SiteScroll.* scope
  // Example : Video.js module will register emitter.on(`SiteScroll.video`, this._myCall), but linked to an internal method inside Video class
  _executeCall(call, direction, obj) {
    this.emitter.emit(`${this.name}.${call}`, direction, obj);
  }

  _onScroll(instance) {
    const { y } = instance.scroll;
    const diff = y - this.previousScrollY;
    const direction = diff >= 0 ? "down" : "up";
    const threshold = y > SCROLL_THRESHOLD;
    const isDiffEnough = Math.abs(diff) >= SCROLL_DIFF_THRESHOLD;

    // save previous scroll position
    this.previousScrollY = y;

    // emit scroll y to application
    this.emitter.emit(`${this.name}.scroll`, y);

    // if scroll is greater than threshold AND was previously lower than threshold
    if (threshold === true && this.hasScrolledAboveThreshold === false) {
      this.hasScrolledAboveThreshold = true;
      this.state.dispatch("SCROLL_MIN", true);

      body.classList.add(SCROLL_MIN_CLASSNAME);
    }
    // if scroll is lower than threshold AND was previously greater than threshold
    else if (threshold === false && this.hasScrolledAboveThreshold === true) {
      this.hasScrolledAboveThreshold = false;
      this.state.dispatch("SCROLL_MIN", false);

      body.classList.remove(SCROLL_MIN_CLASSNAME);
    }

    // if scroll has scrolled enough to be take into account AND direction has changed
    if (isDiffEnough && direction !== this.direction) {
      // set scroll direction classname to <body>
      if (this.direction === null)
        body.classList.add(direction === "down" ? SCROLL_DOWN_CLASSNAME : SCROLL_UP_CLASSNAME);
      else if (direction === "down") body.classList.replace(SCROLL_UP_CLASSNAME, SCROLL_DOWN_CLASSNAME);
      else body.classList.replace(SCROLL_DOWN_CLASSNAME, SCROLL_UP_CLASSNAME);

      // save scroll direction
      this.scrollDirection = direction;

      // set direction to state component
      this.state.dispatch("SCROLL_DIRECTION", direction);

      // emit scroll direction change to application
      this.emitter.emit(`${this.name}.direction`, direction);
    }
  }

  // getter - setter
  get y() {
    return this.scroll ? this.scroll.scroll.instance.scroll.y : 0;
  }
  get direction() {
    return this.scrollDirection;
  }
}

export default SiteScroll;
