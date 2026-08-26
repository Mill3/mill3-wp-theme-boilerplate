import PowerMode from "@core/power-mode";
import Breakpoint from "@utils/breakpoint";
import { firefox } from "@utils/browser";
import PrefersColorScheme, { COLOR_SCHEME_DARK } from "@utils/prefers-color-scheme";
import Viewport from "@utils/viewport";

const BREAKPOINTS = ["(min-width: 768px)", "(min-width: 1200px)"];

class Video {
  constructor(el, ignorePowerMode = false) {
    this.el = el;

    // remove autoplay for Firefox because it browser will start playback of video even if is out of viewport
    if( firefox() && this.el.hasAttribute('autoplay') ) {
      this.el.removeAttribute('autoplay');

      // if preload attribute doesn't exist, set to preload=metadata
      if( !this.el.hasAttribute('preload') ) this.el.setAttribute('preload', 'metadata');
    }
    
    this._action = this.el.paused ? "pause" : "play";
    this._src = this.el.dataset.src || this.el.src;
    this._src_mobile = this.el.dataset.srcMobile;
    this._src_tablet = this.el.dataset.srcTablet;
    this._src_dark = this.el.dataset.srcDark;
    this._src_mobile_dark = this.el.dataset.srcMobileDark;
    this._src_tablet_dark = this.el.dataset.srcTabletDark;
    this._poster = this.el.dataset.poster;
    this._powerModeLow = PowerMode.low && ignorePowerMode === false;

    this._onBreakpointChange = this._onBreakpointChange.bind(this);

    if( !this._powerModeLow ) {
      // listen to css breakpoints change
      if (this._src && (this._src_mobile || this._src_tablet)) this._bp = Breakpoint(BREAKPOINTS, this._onBreakpointChange);
    }

    this.init();
  }

  init() {
    this._bindEvents();
    
    if( !this._powerModeLow ) {
      if( this._bp || this._src ) {
        if( this.el.src !== this.src ) {
          this.el.setAttribute("src", this.src);
          this[this._action === "play" ? "play" : "pause"]();
        }
      }
    } else {
      if( this._poster ) this.el.setAttribute('poster', this._poster);
    }
  }
  destroy() {
    this._unbindEvents();

    if (this._bp) this._bp.dispose();

    this.el = null;

    this._action = null;
    this._playPromise = null;
    this._src = null;
    this._src_mobile = null;
    this._src_tablet = null;
    this._src_dark = null;
    this._src_mobile_dark = null;
    this._src_tablet_dark = null;
    this._poster = null;
    this._bp = null;
    this._powerModeLow = null;

    this._onBreakpointChange = null;
  }
  play(force = false) {
    // if video element does not exist, skip here
    if (!this.el) return;

    // if low power, skip here
    if (this._powerModeLow) return;

    // if we already request play without forcing it, skip here
    if (this._action === "play" && force === false) return;
    this._action = "play";

    // if promise exists, skip here
    if (this._playPromise) return;

    // start playback and clear promise when done
    this._playPromise = this.el?.play();
    this._playPromise.finally(() => { this._playPromise = null; });
    this._playPromise.catch(() => { this._action = null; });
  }
  pause() {
    // if video element does not exist, skip here
    if (!this.el) return;

    // if low power, skip here
    if (this._powerModeLow) return;

    // if we already request pause, skip here
    if (this._action === "pause") return;
    this._action = "pause";

    // if a play promise exists, wait promise.resolve to pause playback
    // otherwise, pause immediatly
    if (this._playPromise) this._playPromise.then(() => this.el?.pause());
    else this.el?.pause();
  }
  seek(time = 0) {
    // if video element does not exist, skip here
    if (!this.el) return;
    
    this.el.currentTime = time;
  }

  _bindEvents() {
    this._bp?.on();
    if( !this._powerModeLow ) PrefersColorScheme.on('change', this._onBreakpointChange);
  }
  _unbindEvents() {
    this._bp?.off();
    if( !this._powerModeLow ) PrefersColorScheme.off('change', this._onBreakpointChange);
  }

  // best-fit source for the current viewport width within one pool (mobile < 768, tablet < 1200, desktop >= 1200),
  // falling back to the next larger size when the closest match isn't defined
  _pickSrc(mobile, tablet, desktop) {
    if (Viewport.width < 768) return mobile || tablet || desktop;
    if (Viewport.width < 1200) return tablet || desktop;
    return desktop;
  }


  // change video src depending on viewport's width AND change video src depending on prefers-color-scheme
  _onBreakpointChange() {
    // check if src has changed
    if( this.src === this.el.src ) return;

    if (!this._powerModeLow) {
      // pause before changing video source
      if( this._action === "play" ) this.el.pause();

      // change video source
      this.el.setAttribute("src", this.src);
    }

    // if video was playing, restart playback
    if (this._action === "play") this.play(true);
  }


  // getter - setter
  get playing() { return this._action === "play"; }
  get src() {
    // if no other sources exists, return default src
    if (!this._src_mobile && !this._src_tablet && !this._src_dark && !this._src_mobile_dark && !this._src_tablet_dark ) return this._src;

    const isDark = PrefersColorScheme.value === COLOR_SCHEME_DARK;

    // prefers-color-scheme takes priority : try the dark pool first, fallback to the light pool
    // whenever no dark source fits (at any size up to desktop)
    if (isDark) {
      const dark = this._pickSrc(this._src_mobile_dark, this._src_tablet_dark, this._src_dark);
      if (dark) return dark;
    }

    return this._pickSrc(this._src_mobile, this._src_tablet, this._src);
  }
}

export default Video;
