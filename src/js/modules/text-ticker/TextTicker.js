import { $, rect } from "@utils/dom";
import { lerp } from "@utils/math";
import { mobile } from "@utils/mobile";
import ResizeOrientation from "@utils/resize";
import Wheel from "@utils/wheel";

const FRICTION = 0.9;
const VELOCITY = 0.08;

const MODE_CSS = 'css';
const MODE_JS = 'js';
const MODE_SCROLL = 'scroll';

const DIRECTION_LEFT = -1;
const DIRECTION_RIGHT = 1;
const DIRECTION_BOTH = 0;

class TextTicker {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.template = $(".text-ticker__text", this.el);
    this.texts = [this.template];

    this._mode = this._getMode();
    this._direction = this._getDirection();
    this._velocity = { target: VELOCITY * this._direction, current: VELOCITY * this._direction };
    this._progress = 0;
    this._raf = null;
    this._wheel = null;
    this._ro = null;
    this._inView = false;

    this._onScroll = this._onScroll.bind(this);
    this._onRaf = this._onRaf.bind(this);
    this._onScrollStart = this._onScrollStart.bind(this);
    this._onScrollStop = this._onScrollStop.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onResize = this._onResize.bind(this);

    this.init();
  }

  init() {
    this._ro = ResizeOrientation(this._onResize);
    this._ro.run();

    // set velocity to zero on scroll mode
    if(this._mode === MODE_SCROLL) this._velocity.target = this._velocity.current = 0;

    if(this._mode === MODE_JS || this._mode === MODE_SCROLL ) {
      this.el.classList.add("--mode-js");
      this._wheel = Wheel(this._onScroll);

      // if element does'nt have data-scroll, assume he's always inView
      if( !this.el.hasAttribute('data-scroll') ) this._inView = true;
    } else {
      this.el.classList.add('--mode-css');
    }

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this._ro ) this._ro.dispose();

    this.el = null;
    this.emitter = null;
    this.template = null;
    this.texts = null;

    this._mode = null;
    this._direction = null;
    this._velocity = null;
    this._progress = null;
    this._raf = null;
    this._wheel = null;
    this._ro = null;
    this._inView = null;

    this._onScroll = null;
    this._onRaf = null;
    this._onScrollStart = null;
    this._onScrollStop = null;
    this._onScrollCall = null;
    this._onResize = null;
  }

  _bindEvents() {
    if (this._ro) this._ro?.on();
    if (this._wheel) this._wheel?.on();
    if (this._mode === MODE_JS || this._mode === MODE_SCROLL) {
      this.emitter?.on("SiteScroll.start", this._onScrollStart);
      this.emitter?.on("SiteScroll.stop", this._onScrollStop);
      this.emitter?.on("SiteScroll.text-ticker", this._onScrollCall);
      this._raf = requestAnimationFrame(this._onRaf);
    }
  }
  _unbindEvents() {
    if(this._mode === MODE_JS || this._mode === MODE_SCROLL) {
      this.emitter?.off("SiteScroll.start", this._onScrollStart);
      this.emitter?.off("SiteScroll.stop", this._onScrollStop);
      this.emitter?.off("SiteScroll.text-ticker", this._onScrollCall);
    }

    if (this._ro) this._ro?.off();
    if (this._wheel) this._wheel?.off();
    if (this._raf) cancelAnimationFrame(this._raf);

    this._raf = null;
  }

  _onScroll(delta) {
    this._velocity.target = delta * 0.005;

    // apply directional restriction on velocity
    if( this._direction !== DIRECTION_BOTH ) this._velocity.target = Math.abs(this._velocity.target) * this._direction;
  }
  _onRaf() {
    // do nothing if we have no text to move
    if (!this.texts) return;

    this._raf = requestAnimationFrame(this._onRaf);

    // apply friction
    this._velocity.target *= FRICTION;

    // set minimal velocity based on is current direction (only for JS mode)
    if( this._mode === MODE_JS ) {
      if (this._velocity.target > 0) this._velocity.target = Math.max(VELOCITY, this._velocity.target);
      else this._velocity.target = Math.min(VELOCITY * -1, this._velocity.target);
    }

    // lerp velocity
    this._velocity.current = lerp(this._velocity.current, this._velocity.target, 0.2);

    // update progression
    this._progress += this._velocity.current;

    // limits to [-100, 0]
    if (this._progress < -100) this._progress = this._progress + 100;
    else if (this._progress > 0) this._progress = this._progress - 100;

    // apply transformations if inView
    if( this._inView ) this.texts.forEach(text => (text.style.transform = `translate3d(${this._progress}%, 0, 0)`));
  }
  _onScrollStart() {
    this._wheel?.on();
    this._raf = requestAnimationFrame(this._onRaf);
  }
  _onScrollStop() {
    this._wheel?.off();

    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }
  _onScrollCall(direction, obj) {
    // if scroll call is not related to this element, do nothing
    if( obj.el !== this.el ) return;

    // update inView status
    this._inView = direction === 'enter';
  }
  _onResize() {
    const elRect = rect(this.el);
    const textRect = rect(this.template);

    // if one of the two elements rect is null, do nothing
    if( elRect.width < 1 || textRect.width < 1 ) return;

    const quantity = Math.ceil(elRect.width / textRect.width) + 1;

    while( this.texts.length < quantity ) {
      const copy = this.template.cloneNode(true);
            copy.setAttribute('aria-hidden', true);
            copy.style.setProperty('--ticker-index', this.texts.length);

      this.texts.push(copy);
      this.el.appendChild(copy);
    }
  }

  _getDirection() {
    if( this.el.classList.contains('--direction-left') ) return DIRECTION_LEFT;
    else if( this.el.classList.contains('--direction-both') ) return DIRECTION_BOTH;
    else if( this.el.classList.contains('--direction-right') ) return DIRECTION_RIGHT;
  }
  _getMode() {
    if( mobile ) return MODE_CSS;

    switch( this.el.dataset.textTicker ){
      case MODE_CSS: return MODE_CSS;
      case MODE_SCROLL: return MODE_SCROLL;
      default: return MODE_JS;
    }
  }
}

export default TextTicker;
