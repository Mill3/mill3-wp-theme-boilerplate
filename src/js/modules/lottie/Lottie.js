import lottie from "lottie-web";
import anime from "animejs";

import { sleep } from "@utils/sleep";
import { cssTimeToMs } from "@utils/animation";
import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";
import { mobile } from "@utils/mobile";

const DEFAULT_OPTIONS = {
  autoplay: false,
  loop: true,
  delay: 0,
  renderer: "canvas"
};

class Lottie {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.wrapper = this.el.closest('[data-lottie-wrapper]');

    this._inView = false;
    this._instance = null;
    this._options = null;
    this._scrollTarget = null;

    this._onSiteScrollCall = this._onSiteScrollCall.bind(this);
    this._onInstanceDataReady = this._onInstanceReady.bind(this);
    this._onInstanceLoop = this._onInstanceLoop.bind(this);
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);

    this.init();
  }

  init() {
    // if dataset is not empty, decode JSON options
    if (this.el.dataset.lottie) {
      const json = JSON.parse(this.el.dataset.lottie);
      this._options = { ...DEFAULT_OPTIONS, ...json };
    }
    // otherwise, use default options
    else this._options = { ...DEFAULT_OPTIONS };

    // if animationData exists, add to options
    const animationData = $("script", this.el);
    if (animationData) {
      // convert animationData to JSON
      const content = animationData.textContent.trim();
      const data = JSON.parse(content);

      // if data is valid JSON, save to options and delete path option
      if (data) {
        this._options.animationData = data;

        this._options.path = null;
        delete this._options.path;
      }
    }

    // remove null options
    for (const [key, value] of Object.entries(this._options)) {
      if (value === null) delete this._options[key];
    }

    // if container option exists, query element and update option
    // eslint-disable-next-line no-prototype-builtins
    if (this._options.hasOwnProperty("container")) this._options.container = $(this._options.container);
    // otherwise, set container to element
    else this._options.container = this.el;

    // if container is null, warn and exit
    if (!this._options.container) {
      console.warn(`Lottie will be ignored on ${this.el} because container is not found.`, this.el);
      return;
    }

    // check if element has data-scroll-target
    if (this.el.dataset.scrollTarget) this._scrollTarget = this.el.dataset.scrollTarget;

    // find scrollTarget
    if (this._scrollTarget) this._scrollTarget = $(this._scrollTarget);
    else this._scrollTarget = this.el;

    sleep(250).then(() => {
      // create lottie instance
      this._instance = lottie.loadAnimation(this._options);

      // attach event data_ready to instance
      this._instance.addEventListener("DOMLoaded", () => this._onInstanceReady());
      if( this._options.on_rollover && !mobile ) this._instance.addEventListener("loopComplete", this._onInstanceLoop);
    });

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this._instance) this._instance.destroy();

    this.el = null;
    this.emitter = null;
    this.wrapper = null;

    this._instance = null;
    this._inView = null;
    this._options = null;
    this._scrollTarget = null;

    this._onSiteScrollCall = null;
    this._onInstanceDataReady = null;
    this._onInstanceLoop = null;
    this._onMouseEnter = null;
    this._onMouseLeave = null;
  }

  _bindEvents() {
    if (this.emitter) this.emitter.on("SiteScroll.lottie", this._onSiteScrollCall);

    if(this._options.on_rollover && this.wrapper && !mobile){
      on(this.wrapper, 'mouseenter', this._onMouseEnter);
      on(this.wrapper, 'mouseleave', this._onMouseLeave);
    }
  }
  _unbindEvents() {
    if (this.emitter) this.emitter.off("SiteScroll.lottie", this._onSiteScrollCall);
    if (this._instance) {
      this._instance.removeEventListener("data_ready", this._onInstanceDataReady);
      this._instance.removeEventListener("loopComplete", this._onInstanceLoop);
    }

    if(this._options.on_rollover && this.wrapper && !mobile){
      off(this.wrapper, 'mouseenter', this._onMouseEnter);
      off(this.wrapper, 'mouseleave', this._onMouseLeave);
    }
  }

  // animate lottie container and start animation after
  _onInstanceReady() {
    const delay = this._calculateDelay();

    anime({
      targets: [this.el],
      opacity: {
        value: [0, 1],
        duration: 750,
        easing: "linear"
      },
      scale: {
        value: [0.84, 1],
        duration: 750,
        easing: "easeOutCubic"
      },
      translateY: {
        value: [115, 0],
        duration: 750,
        easing: "easeOutCubic"
      },
      complete: () => {
        if(this._inView && !this._options.on_rollover) this._instance.play();
      },
      delay: delay > 0 ? delay : 0
    });
  }
  _onInstanceLoop() {
    if( !this._hovering ) this._instance?.pause();
  }

  _onSiteScrollCall(direction, obj) {
    // stop if target doesn't match
    const target = obj.target ? obj.target : obj.targetEl;
    if (target !== this._scrollTarget) return;
    if (this._options.on_rollover && !mobile) return;

    // in view, entering, and paused, start animation, pause it otherwise
    if (obj.inView && direction === "enter") {
      this._inView = true;
      const delay = this._calculateDelay();

      if (delay > 0) sleep(delay).then(() => this._instance?.play());
      else this._instance?.play();
    } else {
      this._inView = false;
      this._instance?.pause();
    }
  }

  _calculateDelay() {
    const styles = getComputedStyle(this.el);
    const delay = styles.getPropertyValue("--delay");

    return cssTimeToMs(delay) + this._options.delay;
  }

  _onMouseEnter(){
    this._hovering = true;
    this._instance?.play();
  }

  _onMouseLeave(){
    this._hovering = false;
  }
}

export default Lottie;
