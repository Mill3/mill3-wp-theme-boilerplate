import { DIRECTION_DOWN } from "@scroll/constants";
import Mill3Scroll from "@scroll/index";
import { $, body, html } from "@utils/dom";

export const SELECTOR = "[data-scroll-container]";
export const SCROLL_MIN_CLASSNAME = "--js-scroll-min";
export const SCROLL_DOWN_CLASSNAME = "--js-scroll-down";
export const SCROLL_UP_CLASSNAME = "--js-scroll-up";
export const SCROLLBAR_HIDDEN_CLASSNAME = "--js-scrollbar-hidden";

const SCROLL_THRESHOLD = 200;

let SINGLETON;

class SiteScroll {
  constructor(init = false) {
    this.initialized = false;
    this.hasScrolledAboveThreshold = false;
    this.el = null;

    SINGLETON = this;

    this._onCall = this._onCall.bind(this);
    this._onDirectionChange = this._onDirectionChange.bind(this);
    this._onScrollResized = this._onScrollResized.bind(this);
    this._onScroll = this._onScroll.bind(this);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.update = this.update.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
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
    this.el = $(SELECTOR);

    this.scroll = Mill3Scroll({
      autoStart: false,
      repeat: false,
      smooth: true,
    });

    this._bindEvents();

    this.scroll.start();    
    this.emitter.emit(`${this.name}.init`, this.y);
  }
  destroy() {
    this._unbindEvents();

    if( this.scroll ) this.scroll.destroy();
    html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);

    this.el = null;
    this.scroll = null;
    this.initialized = false;
    this.hasScrolledAboveThreshold = false;
  }
  update() {
    // trigger event that scroll update will occur
    this.emitter.emit(`${this.name}.before-update`, this.y);

    // update scroll
    if (this.scroll) this.scroll.update();

    // trigger event that scroll update is completed
    this.emitter.emit(`${this.name}.after-update`, this.y);
  }

  start() {
    if( this.scroll ) this.scroll.start();
    html.classList.remove(SCROLLBAR_HIDDEN_CLASSNAME);
  }
  stop(hideScrollbar = false) {
    if( this.scroll ) this.scroll.stop();
    if( hideScrollbar ) html.classList.add(SCROLLBAR_HIDDEN_CLASSNAME);
  }

  scrollTo(target, options = { offset: 0, smooth: true, callback: false }) {
    if (this.scroll) this.scroll.scrollTo(target, options);
  }
  scrollUp() {
    if (this.scroll) this.scroll.scrollTo('top');
  }

  _bindEvents() {
    if( this.scroll ) {
      this.scroll.on("call", this._onCall);
      this.scroll.on("direction", this._onDirectionChange);
      this.scroll.on("resize", this._onScrollResized);
      this.scroll.on("scroll", this._onScroll);
    }

    // register event on global emmiter system
    if ( this.emitter) {
      this.emitter.on(`${this.name}.stop`, this.stop);
      this.emitter.on(`${this.name}.start`, this.start);
      this.emitter.on(`${this.name}.update`, this.update);
      this.emitter.on(`${this.name}.scrollTo`, this.scrollTo);
      this.emitter.on(`${this.name}.scrollUp`, this.scrollUp);
    }
  }
  _unbindEvents() {
    if (this.scroll) {
      this.scroll.off("call", this._onCall);
      this.scroll.off("direction", this._onDirectionChange);
      this.scroll.off("resize", this._onScrollResized);
      this.scroll.off("scroll", this._onScroll);
    }

    if (this.emitter) {
      this.emitter.off(`${this.name}.stop`, this.stop);
      this.emitter.off(`${this.name}.start`, this.start);
      this.emitter.off(`${this.name}.update`, this.update);
      this.emitter.off(`${this.name}.scrollTo`, this.scrollTo);
      this.emitter.off(`${this.name}.scrollUp`, this.scrollUp);
    }
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

  _onDirectionChange(direction, oldDirection) {
    // set scroll direction classname to <body>
    // we try to change direction classname in a single operation to avoid a useless draw call
    if (oldDirection === null) body.classList.add(direction === DIRECTION_DOWN ? SCROLL_DOWN_CLASSNAME : SCROLL_UP_CLASSNAME);
    else if (direction === DIRECTION_DOWN) body.classList.replace(SCROLL_UP_CLASSNAME, SCROLL_DOWN_CLASSNAME);
    else body.classList.replace(SCROLL_DOWN_CLASSNAME, SCROLL_UP_CLASSNAME);

    // set direction to state component
    this.state.dispatch("SCROLL_DIRECTION", direction);

    // emit scroll direction change to application
    this.emitter.emit(`${this.name}.direction`, direction);
  }
  _onScrollResized() {
    this.emitter.emit(`${this.name}.resize`, this.y);
  }
  _onScroll(y) {
    const threshold = y > SCROLL_THRESHOLD;

    // emit scroll y to application
    this.emitter.emit(`${this.name}.scroll`, y);

    // if scroll is greater than threshold AND was previously lower than threshold
    if (threshold === true && this.hasScrolledAboveThreshold === false) {
      this.hasScrolledAboveThreshold = true;
      this.state.dispatch("SCROLL_MIN", true);

      body.classList.add(SCROLL_MIN_CLASSNAME);
      this.emitter.emit(`${this.name}.scroll-min`, true);
    }
    // if scroll is lower than threshold AND was previously greater than threshold
    else if (threshold === false && this.hasScrolledAboveThreshold === true) {
      this.hasScrolledAboveThreshold = false;
      this.state.dispatch("SCROLL_MIN", false);

      body.classList.remove(SCROLL_MIN_CLASSNAME);
      this.emitter.emit(`${this.name}.scroll-min`, false);
    }
  }

  

  // getter - setter
  get y() { return this.scroll ? this.scroll.y : 0; }
  get direction() { return this.scroll ? this.scroll.direction : null; }
}

export default SiteScroll;
