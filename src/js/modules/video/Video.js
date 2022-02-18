import Breakpoint from "@utils/breakpoint";
import { on, off } from "@utils/listener";
import Viewport from "@utils/viewport";

const BREAKPOINTS = ["(min-width: 768px)"];

class Video {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;

    this._action = null;
    this._playPromise = null;
    this._src = this.el.dataset.src;
    this._src_mobile = this.el.dataset.srcMobile;

    this._onBreakpointChange = this._onBreakpointChange.bind(this);
    this._onMetadata = this._onMetadata.bind(this);

    // listen to css breakpoints change
    if (this._src && this._src_mobile) this._bp = Breakpoint(BREAKPOINTS, this._onBreakpointChange);

    this.init();
  }

  init() {
    this._bindEvents();

    if (this._bp) this._bp.run();
    else this._onBreakpointChange();
  }
  destroy() {
    this._unbindEvents();

    if (this._bp) this._bp.dispose();

    this.el = null;
    this.emitter = null;

    this._action = null;
    this._playPromise = null;
    this._src = null;
    this._src_mobile = null;
    this._bp = null;

    this._onBreakpointChange = null;
    this._onMetadata = null;
  }
  play(force = false) {
    // if video element does not exist, skip here
    if (!this.el) return;

    // if we already request play without forcing it, skip here
    if (this._action === "play" && force === false) return;
    this._action = "play";

    // if promise exists, skip here
    if (this._playPromise) return;

    //console.log("play", this.el.readyState);

    // if video is not loaded, skip here
    //if( this.el.readyState < 1 ) return;

    // start playback and clear promise when done
    this._playPromise = this.el?.play().finally(() => {
      this._playPromise = null;
    });
  }
  pause() {
    // if video element does not exist, skip here
    if (!this.el) return;

    // if we already request pause, skip here
    if (this._action === "pause") return;
    this._action = "pause";

    // if video cannot play, skip here
    //if( this.el.readyState < 1 ) return;

    // if a play promise exists, wait promise.resolve to pause playback
    // otherwise, pause immediatly
    if (this._playPromise) this._playPromise.then(() => this.el?.pause());
    else this.el?.pause();
  }

  _bindEvents() {
    on(this.el, "loadedmetadata", this._onMetadata);
    this._bp?.on();
  }
  _unbindEvents() {
    off(this.el, "loadedmetadata", this._onMetadata);
    this._bp?.off();
  }

  _onBreakpointChange() {
    this.el.setAttribute("src", this.src);
    if (this._action === "play") this.play(true);
  }
  _onMetadata() {
    this.emitter?.emit(`SiteScroll.update`);
  }

  // getter - setter
  get src() {
    if (!this._src_mobile) return this._src;
    return Viewport.width < 768 ? this._src_mobile : this._src;
  }
}

export default Video;
