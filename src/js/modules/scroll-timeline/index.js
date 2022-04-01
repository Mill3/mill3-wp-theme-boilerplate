/**
 * SCROLL TIMELINE
 *
 ***************
 * How to use: *
 ***************
 * Add [data-scroll] attribute to your HTML element.
 * Add [data-scroll-call="timeline"] attribute to your HTML element.
 * Add [data-module="scroll-timeline"] attribute to your HTML element.
 * Add [data-timeline="your-animejs-animation-object"] (must be JSON encode & html escaped).
 * Add [data-timeline-mobile="your-animejs-animation-object"] (must be JSON encode & html escaped).
 *
 * Example:
 * <div
 *  class="position-relative d-block w-100 vh-50"
 *  data-scroll
 *  data-scroll-call="timeline"
 *  data-module="scroll-timeline"
 *  data-timeline="{{ {translateY: -100, scale: [1, 1.5], opacity: [1, 0.5]}|json_encode|escape('html_attr') }}"
 * >
 *  <img src="image-path.jpg" class="image-as-background" />
 * </div>
 *
 * The whole data-timeline JSON object is passed to your AnimeJS animation.
 * See https://animejs.com/documentation/ for more details on passing data to AnimeJS.
 * 
 * 
 ************************************************
 * Using CSS variables in your scroll-timeline. *
 ************************************************
 * Add [data-css-var-YOUR_VAR_NAME]="YOUR_INITIAL_VALUE" attribute to your HTML element.
 * Your animatable property in your scroll-timeline must match your [data-css-var-YOUR_VAR_NAME] attribute.
 * 
 * Example:
 * <div
 *  class="position-relative d-block w-100 vh-50"
 *  data-scroll
 *  data-scroll-call="timeline"
 *  data-module="scroll-timeline"
 *  data-timeline="{{ {'data-css-var-test': [1, 2]}|json_encode|escape('html_attr') }}"
 *  data-css-var-test="1"
 * >
 *  <img src="image-path.jpg" class="image-as-background" />
 * </div>
 * 
 * .my-element {
 *  --test: 1;
 *  transform: scale(var(--test));
 * }
 * 
 * 
 ***************************************************
 * Different scroll animation for native scrolling *
 ***************************************************
 * Add [data-timeline-native="your-animejs-animation-object"] (must be JSON encode & html escaped).
 * 
 * 
 *************************************************
 * Disable scroll animation for native scrolling *
 *************************************************
 * Add [data-timeline-native] attribute, without value, to your HTML element.
 * 
 * 
 ********************************************************************
 * Different scroll animation for mobile device (viewport < 768px). *
 ********************************************************************
 * Add [data-timeline-mobile="your-animejs-animation-object"] (must be JSON encode & html escaped).
 * 
 * 
 ******************************************************************
 * Disable scroll animation for mobile device (viewport < 768px). *
 ******************************************************************
 * Add [data-timeline-mobile] attribute, without value, to your HTML element.
 * 
 */

import anime from "animejs";

import { mobile } from "@utils/mobile";
import Viewport from "@utils/viewport";

import Module from "../module/Module";

const CSS_VARIABLE_ATTRIBUTE = 'data-css-var-';
const TIMELINE_DEFAULTS = {
  easing: "linear",
  autoplay: false,
  duration: 1000
};

class ScrollTimeline extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    this._onCall = this._onCall.bind(this);
    this._onScroll = this._onScroll.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return "ScrollTimeline";
  }

  init() {
    this.initialized = true;
    this.items = new Map();

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.items) {
      this.items.forEach(tl => anime.remove(tl.el));
      this.items.clear();
    }

    this.initialized = false;
    this.items = null;
  }

  _bindEvents() {
    this.emitter.on("SiteScroll.timeline", this._onCall);
    this.emitter.on("SiteScroll.scroll", this._onScroll);
  }
  _unbindEvents() {
    this.emitter.off("SiteScroll.timeline", this._onCall);
    this.emitter.off("SiteScroll.scroll", this._onScroll);
  }

  _onCall(direction, obj) {
    // do nothing for "exit" events
    if (direction !== "enter") return;

    const { el } = obj;

    // set timeline ID if not exists
    if( !el.hasAttribute('data-timeline-id') ) el.setAttribute('data-timeline-id', this.items.size);

    // read timeline ID
    const id = el.dataset.timelineId;

    // if this timeline already exists, update top/bottom in timeline and stop here
    if ( this.items.has(id) ) {
      const tl = this.items.get(id);
            tl.top = obj.top;
            tl.bottom = obj.bottom;

      return;
    }

    let timelineArgs;

    // if we are on native scroll & element has [data-timeline-native], it as priority
    if( mobile && el.hasAttribute('data-timeline-native') ) {
      // if [data-timeline-native] has no value, skip this timeline
      if( !el.dataset.timelineNative ) return;

      // JSON parse [data-timeline-native]
      timelineArgs = JSON.parse(el.dataset.timelineNative);
    }
    // if viewport is small & element has [data-timeline-mobile], it as priority
    else if( Viewport.width < 768 && el.hasAttribute('data-timeline-mobile') ) {
      // if [data-timeline-mobile] has no value, skip this timeline
      if( !el.dataset.timelineMobile ) return;

      // JSON parse [data-timeline-mobile]
      timelineArgs = JSON.parse(el.dataset.timelineMobile);
    } 
    // JSON parse default [data-timeline]
    else timelineArgs = JSON.parse(el.dataset.timeline);

    // if (for any reason) we can't find timeline, stop here
    if( !timelineArgs ) return;

    // check if one property of timeline is a data attribute
    const hasDataAttrs = Object.keys(timelineArgs).some(key => key.startsWith(CSS_VARIABLE_ATTRIBUTE));

    // if timeline contains one data attribute, 
    // add callbacks (change & complete) to transform each data attributes to a css variables
    if( hasDataAttrs ) {
      timelineArgs.change = this._updateCssVariables;
      timelineArgs.complete = this._updateCssVariables;
    }
    
    // create AnimeJS timeline from best matching [data-timeline] or [data-timeline-mobile]
    const timeline = anime({ targets: el, ...TIMELINE_DEFAULTS, ...timelineArgs });

    // create timeline and store it
    this.items.set(id, {
      top: obj.top,
      bottom: obj.bottom,
      ref: obj,
      el: el,
      timeline: timeline,
    });
  }
  _onScroll(y) {
    // abort if there is no registered animations
    if( this.items.size === 0 ) return;

    const vh = Viewport.height;

    this.items.forEach(tl => {
      // skip if element is not in view
      if( !tl.ref.inView ) return;

      const { timeline, top, bottom } = tl;

      const limit = Math.min(bottom, vh + bottom - top);
      const distance = Math.min(limit, Math.max(0, bottom - y));
      const progress = 1 - distance / limit;

      timeline.seek(timeline.duration * progress);
    });
  }
  _updateCssVariables(anim) {
    anim.animations.forEach(animation => {
      // do nothing if property 
      if( !animation.property.startsWith(CSS_VARIABLE_ATTRIBUTE) ) return;

      // get css variable name from data attribute key
      const variableName = animation.property.replace(CSS_VARIABLE_ATTRIBUTE, '');

      // update css variable value
      animation.animatable.target.style.setProperty(`--${variableName}`, animation.currentValue);
    });
  }
}

export const instance = new ScrollTimeline();

export default { instance };
