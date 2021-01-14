/**
 * SCROLL TIMELINE
 *
 * How to use:
 * Add data-module="scroll-timeline" to your HTML element
 * Add data-timeline="your-animejs-animation-object" (must be JSON encode & html escaped)
 *
 * Optionally add data-scroll & data-scroll-call="timeline" to your HTML element.
 * If you omit data-scroll or data-scroll-call, they will be inserted automatically.
 * If you provide them, it will be faster for mobile device.
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
 */

import anime from "animejs";

import { $$ } from "@utils/dom";
import Viewport from "@utils/viewport";

import Module from "../module/Module";

const SELECTOR = "[data-timeline]";
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
    this.items = [];

    [...$$(SELECTOR)].forEach((el, index) => {
      if (el.hasAttribute("data-scroll-call") && el.dataset.scrollCall !== "timeline") {
        console.warn(
          `ScrollTimeline will be disabled on ${el} because it already has a data-scroll-call attribute.`,
          el
        );
        return;
      }

      if (!el.hasAttribute("data-scroll")) el.setAttribute("data-scroll", "");
      if (!el.hasAttribute("data-scroll-scroll") || el.dataset.scrollCall !== "timeline")
        el.setAttribute("data-scroll-call", "timeline");

      el.dataset.timelineID = index;
    });

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.items) this.items.forEach(tl => anime.remove(tl.el));

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

  _timelineExists(id) {
    return this._getTimeline(id) !== undefined;
  }
  _getTimeline(id) {
    return this.items.find(tl => tl.id === id);
  }

  _onCall(direction, obj) {
    if (direction !== "enter") return;

    const { el } = obj;
    const id = el.dataset.timelineID || 0;

    // if this object timeline already exists,
    // update object top/bottom in timeline and stop here
    if (this._timelineExists(id)) {
      const tl = this._getTimeline(id);
      tl.top = obj.top;
      tl.bottom = obj.bottom;

      return;
    }

    const timelineArgs = JSON.parse(el.dataset.timeline);

    // create timeline and store it
    this.items.push({
      id: id,
      top: obj.top,
      bottom: obj.bottom,
      el: el,
      timeline: anime({
        targets: el,
        ...TIMELINE_DEFAULTS,
        ...timelineArgs
      })
    });
  }
  _onScroll(y) {
    const vh = Viewport.height;

    this.items.forEach(tl => {
      const { timeline, top, bottom } = tl;

      const limit = Math.min(bottom, vh + bottom - top);
      const distance = Math.min(limit, Math.max(0, bottom - y));
      const progress = 1 - distance / limit;

      timeline.seek(timeline.duration * progress);
    });
  }
}

export const instance = new ScrollTimeline();

export default { instance };
