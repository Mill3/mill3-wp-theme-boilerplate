import { $$ } from "@utils/dom";
import { lerp } from "@utils/math";
import Wheel from "@utils/wheel";

const FRICTION = 0.9;
const VELOCITY = 0.08;

class TextTicker {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.texts = [...$$(".text-ticker__text", this.el)];

    this._velocity = { target: VELOCITY, current: VELOCITY };
    this._progress = 0;
    this._raf = null;
    this._wheel = null;

    this._onScroll = this._onScroll.bind(this);
    this._onRaf = this._onRaf.bind(this);
    this._onScrollStart = this._onScrollStart.bind(this);
    this._onScrollStop = this._onScrollStop.bind(this);

    this.init();
  }

  init() {
    this.el.classList.add("--js");

    this._wheel = new Wheel(this._onScroll);
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
    this.texts = null;

    this._velocity = null;
    this._progress = null;
    this._raf = null;
    this._wheel = null;

    this._onScroll = null;
    this._onRaf = null;
    this._onScrollStart = null;
    this._onScrollStop = null;
  }

  _bindEvents() {
    this.emitter?.on("SiteScroll.start", this._onScrollStart);
    this.emitter?.on("SiteScroll.stop", this._onScrollStop);

    this._wheel?.on();
    this._raf = requestAnimationFrame(this._onRaf);
  }
  _unbindEvents() {
    this.emitter?.off("SiteScroll.start", this._onScrollStart);
    this.emitter?.off("SiteScroll.stop", this._onScrollStop);

    this._wheel?.off();

    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _onScroll(delta) {
    this._velocity.target = delta * 0.005;
  }
  _onRaf() {
    // do nothing if we have no text to move
    if (!this.texts) return;

    this._raf = requestAnimationFrame(this._onRaf);

    // apply friction
    this._velocity.target *= FRICTION;

    // set minimal velocity
    if (this._velocity.target > 0) this._velocity.target = Math.max(VELOCITY, this._velocity.target);
    else this._velocity.target = Math.min(VELOCITY * -1, this._velocity.target);

    // lerp velocity
    this._velocity.current = lerp(this._velocity.current, this._velocity.target, 0.2);

    // update progression
    this._progress += this._velocity.current;

    // limits to [-100, 0]
    if (this._progress < -100) this._progress = this._progress + 100;
    else if (this._progress > 0) this._progress = this._progress - 100;

    // apply transformations
    this.texts.forEach(text => (text.style.transform = `translate3d(${this._progress}%, 0, 0)`));
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
}

export default TextTicker;
