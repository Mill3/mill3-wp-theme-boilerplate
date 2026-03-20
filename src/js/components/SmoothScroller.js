import EventEmitter2 from "eventemitter2";

import { DIRECTION_DOWN, DIRECTION_UP } from "@scroll/constants";
import { firefox } from "@utils/browser";
import { getBody } from "@utils/dom";
import { on, off } from "@utils/listener";
import { lerp2, limit } from "@utils/math";
import { motion_reduced } from "@utils/mobile";
import RAF, { WINDMILL_SCROLL } from "@utils/raf";

const WINDOWS = (navigator?.userAgentData?.platform || navigator?.platform || 'unknown').includes('Win');
const DEFAULT_OPTIONS = {
  lerp: 0.1,
  threshold: 0.5,
  firefoxMultiplier: WINDOWS ? 1 : 2.25,
  mouseMultiplier: WINDOWS ? 1 : 0.4,
};

class SmoothScroller extends EventEmitter2 {
  constructor(el, options = DEFAULT_OPTIONS) {
    super();

    this.el = el;

    this._data = {
      scroll: this.el.scrollTop,
      targetScroll: this.el.scrollTop,
      lastScroll: this.el.scrollTop,
      max: 0,
      zoom: 1,
      direction: null,
      started: false,
      isFirefox: firefox(),
      isMouseWheeling: false,
    };
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._mousewheel = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      prevent: false,
    };
    this._raf = null;

    this._onRAF = this._onRAF.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);
  }

  destroy() {
    this.stop();
    RAF.remove(this._onRAF);

    this.el = null;

    this._data = null;
    this._options = null;
    this._mousewheel = null;
    this._raf = null;

    this._onRAF = null;
    this._onResize = null;
    this._onScroll = null;
    this._onWheel = null;
    this._onMouseWheel = null;
  }
  start() {
    if( this._data.started ) return;
    this._data.started = true;

    this._data.scroll =
    this._data.targetScroll =
    this._data.lastScroll = this.el.scrollTop;

    this._calcScrollHeight();
    this._bindEvents();
  }
  stop() {
    if( !this._data.started ) return;
    this._data.started = false;

    this._unbindEvents();
  }
  reset() {
    this._data.scroll =
    this._data.targetScroll =
    this._data.lastScroll = this.el.scrollTop;

    this._data.direction = null;
    this._data.isMouseWheeling = false;

    this._mousewheel.x = this._mousewheel.y =
    this._mousewheel.deltaX = this._mousewheel.deltaY = 0;
  }
  scrollTo(y) {
    this.el.scrollTo({ top: y, behavior: 'instant' });
  }

  _bindEvents() {
    on(this.el, 'scroll', this._onScroll);

    if( !motion_reduced ) {
      // copied from https://github.com/ayamflow/virtual-scroll
      this.el.addEventListener('wheel', this._onWheel, {passive: false});
      this.el.addEventListener('mousewheel', this._onMouseWheel, {passive: true});
    }

    if( this._raf ) this._raf(true);
    else this._raf = RAF.add(this._onRAF, WINDMILL_SCROLL, true);
  }
  _unbindEvents() {
    if( this._raf ) this._raf(false);

    off(this.el, 'scroll', this._onScroll);

    this.el.removeEventListener('wheel', this._onWheel);
    this.el.removeEventListener('mousewheel', this._onMouseWheel);
  }
  _notify() {
    this.emit('SiteScroll.scroll', {
      y: this._data.scroll,
      direction: this._data.direction,
      limit: this._data.max,
      progress: this.progress,
      velocity: this.velocity,
    });
  }

  _onRAF(delta = 1) {
    if( !this._data.started || !this._data.isMouseWheeling ) return;

    // lerp mouseWheel
    this._data.lastScroll = lerp2(this._data.lastScroll, this._data.targetScroll, this._options.lerp, delta);

    // if target reached, mouse wheel is done
    this._data.isMouseWheeling = Math.abs(this._data.scroll - this._data.targetScroll) > this._options.threshold;

    // if target reached, velocity should be 0
    if( !this._data.isMouseWheeling ) this._data.lastScroll = this._data.scroll = this._data.targetScroll;

    // smooth scroll to new position
    this.el.scrollTo({ top: this._data.lastScroll, behavior: 'auto' });

    this._updateDirection(this._data.lastScroll);
    this._updateScroll(this._data.lastScroll);
    this._notify();
  }
  _onResize() {
    this._data.isMouseWheeling = false;

    this._calcScrollHeight();
    this._updateDirection();
    this._updateScroll();
    this._notify();
  }
  _onScroll() {
    if( this._data.isMouseWheeling ) return;

    this._updateDirection();
    this._updateScroll();
    this._notify();
  }
  _onWheel(event) {
    if( this._mousewheel.prevent ) {
      this._mousewheel.prevent = false;
      return;
    }

    // In Chrome and in Firefox (at least the new one)
    this._mousewheel.deltaX = event.wheelDeltaX || event.deltaX * -1;
    this._mousewheel.deltaY = event.wheelDeltaY || event.deltaY * -1;

    // for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad
    // real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
    if (this._data.isFirefox/* && event.deltaMode === 1*/) {
      this._mousewheel.deltaX *= this._options.firefoxMultiplier;
      this._mousewheel.deltaY *= this._options.firefoxMultiplier;
    }

    this._mousewheel.deltaX *= this._options.mouseMultiplier;
    this._mousewheel.deltaY *= this._options.mouseMultiplier;

    this._handleMouseWheel(event);
  }
  _onMouseWheel(event) {
    if( this._mousewheel.prevent ) {
      this._mousewheel.prevent = false;
      return;
    }

    // In Safari, IE and in Chrome if 'wheel' isn't defined
    this._mousewheel.deltaX = event.wheelDeltaX ? event.wheelDeltaX : 0;
    this._mousewheel.deltaY = event.wheelDeltaY ? event.wheelDeltaY : event.wheelDelta;

    this._handleMouseWheel(event);
  }
  _handleMouseWheel(event) {
    this._mousewheel.x += this._mousewheel.deltaX;
    this._mousewheel.y += this._mousewheel.deltaY;

    if( event.ctrlKey ) return;

    // if not started, prevent default and stop here
    if( !this._data.started ) {
      event.preventDefault();
      return;
    }

    // fix wheel holding scroll https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    if( event.buttons === 4 ) return;

    // prevent native wheel scrolling
    event.preventDefault();

    // set targetScroll
    this._data.isMouseWheeling = true;
    this._data.targetScroll = limit(0, this._data.max, this._data.targetScroll - this._mousewheel.deltaY);
  }

  _calcScrollHeight() {
    this._data.zoom = parseFloat( getComputedStyle(getBody()).getPropertyValue('zoom') );
    this._data.max = Math.max(0, this.el.scrollHeight * this._data.zoom - this.el.offsetHeight);
  }
  _updateDirection(y = this.el.scrollTop) {
    // calculation scroll direction
    const distance = y - this._data.scroll;

    // if scroll hasn't changed, stop here
    // we give a small error margin (0.05px) because when we lerp mousewheel, y as a lot of decimals
    // unfortunately, this.el.scrollTop as a maximum of 1 decimal, which result in a false scroll direction change calculation
    if( Math.abs(distance) <= 0.05 ) return;

    // if distance is positive, we are scrolling down
    // otherwise, we are scrolling up
    const direction = distance >= 0 ? DIRECTION_DOWN : DIRECTION_UP;

    // update direction AND trigger event if value has changed
    if( direction !== this._data.direction ) {
      const oldDirection = this._data.direction;
      this._data.direction = direction;

      this.emit('SiteScroll.direction', direction, oldDirection);
    }
  }
  _updateScroll(y = this.el.scrollTop) {
    // update scroll value
    this._data.scroll = y;

    // where native scroll happens
    if( !this._data.isMouseWheeling ) {
      this._data.targetScroll =
      this._data.lastScroll = this._data.scroll;
    }
  }


  // getter - setter
  get direction() { return this._data.direction; }
  get limit() { return this._data.max; }
  get progress() { return this._data.scroll / this._data.max; }
  get velocity() { return this._data.targetScroll - this._data.lastScroll; }
  get y() { return this._data.scroll; }
  get zoom() { return this._data.zoom; }
}

export default SmoothScroller;
