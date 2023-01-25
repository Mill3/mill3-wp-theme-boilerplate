import EMITTER from "@core/emitter";
import { DIRECTION_DOWN, DIRECTION_UP, SCROLL_TO_OPTIONS } from "@scroll/constants";
import { firefox } from "@utils/browser";
import { $, html, body, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import { lerp, limit } from "@utils/math";
import { mobile } from "@utils/mobile";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";
import smoothScrollToPolyfill from "@vendors/smooth-scroll-polyfill";

const WINDOWS = (navigator?.userAgentData?.platform || navigator?.platform || 'unknown').includes('Win');
const DEFAULT_OPTIONS = {
  lerp: 0.1,
  threshold: 0.5,
  firefoxMultiplier: WINDOWS ? 1 : 4.5,
  mouseMultiplier: WINDOWS ? 1 : 0.4,
};


class Scroll {
  constructor(options = DEFAULT_OPTIONS) {
    this._options = { ...DEFAULT_OPTIONS, ...options };

    this._data = {
      scroll: window.scrollY,
      targetScroll: window.scrollY,
      lastScroll: window.scrollY,
      max: 0,
      direction: null,
      scrollTo: null,
      started: false,
      isFirefox: firefox(),
      isMouseWheeling: false,
    };

    this._mousewheel = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
    };

    this._onScroll = this._onScroll.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);

    smoothScrollToPolyfill();
    html.classList.add('has-scroll-init', mobile ? 'has-scroll-native' : 'has-scroll-smooth');
  }

  init() {
    this._calcScrollHeight();
    EMITTER.emit('SiteScroll.init', this);

    if( window.location.hash ) {
      // Get the hash without the '#' and find the matching element
      const id = window.location.hash.slice(1, window.location.hash.length);
      let target = $(`#${id}`);

      // If found, scroll to the element
      if (target) this.scrollTo(target);
    }
  }
  raf(delta = 1) {
    if( !this._data.started || !this._data.isMouseWheeling ) return;

    // lerp mouseWheel
    this._data.lastScroll = lerp(this._data.lastScroll, this._data.targetScroll, this._options.lerp * delta);

    // if target reached, mouse wheel is done
    this._data.isMouseWheeling = Math.abs(this._data.scroll - this._data.targetScroll) > this._options.threshold;

    // if target reached, velocity should be 0
    if( !this._data.isMouseWheeling ) this._data.lastScroll = this._data.scroll;    

    // smooth scroll to new position
    window.scrollTo({ top: this._data.lastScroll, behavior: 'auto' });

    this._updateDirection(this._data.lastScroll);
    this._updateScroll(this._data.lastScroll);
    this._notify();
  }
  resize() {
    this._data.isMouseWheeling = false;

    this._calcScrollHeight();
    this._updateDirection();
    this._updateScroll();
    this._notify();
  }
  scrollTo(target, options = SCROLL_TO_OPTIONS) {
    // extends options from default
    options = { ...SCROLL_TO_OPTIONS, ...options };

    // An offset to apply on top of given `target` or `sourceElem`'s target
    let offset = parseInt(options.offset) || 0; 

    // function called when scrollTo completes (note that it won't wait for lerp to stabilize)
    const callback = options.callback ? options.callback : false;

    if (typeof target === 'string') {
      // Selector or boundaries
      if (target === 'top') target = 0;
      else if (target === 'bottom') target = this._data.max;
      else {
        target = $(target);
        
        // If the query fails, stop here
        if (!target) return;
      }
    } else if (typeof target === 'number') {
      // Absolute coordinate
      target = parseInt(target);
    } else if (target && target.tagName) {
      // DOM Element
      // We good 👍
    } else {
      console.warn('`target` parameter is not valid');
      return;
    }

    // We have a target that is not a coordinate yet, get it
    if (typeof target !== 'number') offset += rect(target).top - getTranslate(target).y + this._data.scroll;
    else offset += target;

    // if a callback as been provided, save offset and callback for scroll event
    if( callback ) {
      this._data.scrollTo = {
        offset: parseInt(offset),
        callback,
      };
    } 
    // otherwise, remove scrollTo saved callback
    else this._data.scrollTo = null;
    
    // set mouse wheeling to false
    this._data.isMouseWheeling = false;

    // trigger scrollTo
    window.scrollTo({
      top: offset,
      behavior: options.smooth === true ? 'smooth' : 'auto'
  });
  }
  start() {
    if( this._data.started ) return;
    this._data.started = true;

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
    this._data.lastScroll = window.scrollY;

    this._data.direction = null;
    this._data.scrollTo = null;
    this._data.isMouseWheeling = false;

    this._mousewheel.x = this._mousewheel.y =
    this._mousewheel.deltaX = this._mousewheel.deltaY = 0;
  }


  _bindEvents() {
    on(window, 'scroll', this._onScroll);

    //if( !mobile ) {
      // copied from https://github.com/ayamflow/virtual-scroll
      window.addEventListener('wheel', this._onWheel, {passive: false});
      window.addEventListener('mousewheel', this._onMouseWheel, {passive: true});
    //}
  }
  _unbindEvents() {
    off(window, 'scroll', this._onScroll);

    window.removeEventListener('wheel', this._onWheel);
    window.removeEventListener('mousewheel', this._onMouseWheel);
  }
  _notify() {
    EMITTER.emit('SiteScroll.scroll', {
      y: this._data.scroll,
      direction: this._data.direction,
      limit: this._data.max,
      progress: this.progress,
      velocity: this.velocity,
    });
  }


  _onScroll() {
    if( this._data.isMouseWheeling ) return;

    this._updateDirection();
    this._updateScroll();
    this._notify();

    // if we are scrolling to a particular offset defined by scrollTo
    if( this._data.scrollTo ) {
      // if offset as been reached, run callback & destroy saved scrollTo's offset
      if( this._data.scrollTo.offset === this._data.scroll >> 0 ) {
        this._data.scrollTo.callback();
        this._data.scrollTo = null;
      }
    }
  }
  _onWheel(event) {
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

    // interrupt scrollTo
    this._data.scrollTo = null;

    // set targetScroll
    this._data.isMouseWheeling = true;
    this._data.targetScroll = limit(0, this._data.max, this._data.targetScroll - this._mousewheel.deltaY);
  }


  _calcScrollHeight() {
    this._data.max = Math.max(0, body.scrollHeight - Viewport.height);
  }
  _updateDirection(y = window.scrollY) {
    // calculation scroll direction
    const distance = y - this._data.scroll;

    // if scroll hasn't changed, stop here
    if( Math.abs(distance) === 0 ) return;
    
    // if distance is positive, we are scrolling down
    // otherwise, we are scrolling up
    const direction = distance >= 0 ? DIRECTION_DOWN : DIRECTION_UP;

    // update direction AND trigger event if value has changed
    if( direction !== this._data.direction ) {
      const oldDirection = this._data.direction;
      this._data.direction = direction;
      
      EMITTER.emit('SiteScroll.direction', direction, oldDirection);
    }
  }
  _updateScroll(y = window.scrollY) {
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
  get velocity() { return this._data.scroll - this._data.lastScroll; }
  get y() { return this._data.scroll; }
}

export default Scroll;
