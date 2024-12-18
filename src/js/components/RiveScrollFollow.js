import RiveAnimation from "@components/RiveAnimation";
import MILL3_EMITTER from "@core/emitter";
import RiveListener from "@core/rive.listener";
import { INVIEW_ENTER } from "@scroll/constants";
import { rect } from "@utils/dom";
import { map } from "@utils/math";
import RAF, { AFTER_SCROLL } from "@utils/raf";
import ResizeOrientation from "@utils/resize";
import Viewport from "@utils/viewport";

const DEFAULT_OPTIONS = {
  origin: 0.5,
  target: null,
  inputName: "yAxis",
  min: 0,
  max: 100,
};

class RiveScrollFollow {
  constructor(ref, options = {}) {
    if( !ref ) throw new Error(`RiveScrollFollow: ${ref} is not defined`);
    if( !(ref instanceof RiveAnimation) ) throw new Error(`RiveScrollFollow: ${ref} is not an instance of @components/RiveAnimation`);

    this.ref = ref;
    this.target = options.target || this.ref.el;
    this.emitter = MILL3_EMITTER;

    this._options = { ...DEFAULT_OPTIONS, ...options };

    this._data = { scrollY: 0, origin: 0, input: 0, half_vh: 0 };
    this._loaded = false;
    this._listen = true;
    this._input = null;
    this._inView = null;
    this._raf = null;

    this._onAnimationLoad = this._onAnimationLoad.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onRAF = this._onRAF.bind(this);
  }

  destroy() {
    this.stop();

    this.ref = null;
    this.target = null;
    this.emitter = null;

    this._options = null;
    this._data = null;
    this._loaded = null;
    this._listen = null;
    this._input = null;
    this._inView = null;
    this._raf = null;

    this._onAnimationLoad = null;
    this._onResize = null;
    this._onScrollCall = null;
    this._onScroll = null;
    this._onRAF = null;
  }

  start() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.on('load', this._onAnimationLoad);
    RiveListener.add(this._onScrollCall);

    this._bindFollowEvents();
  }
  stop() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;
    
    this.ref.off('load', this._onAnimationLoad);
    RiveListener.remove(this._onScrollCall);

    this._unbindFollowEvents();
  }

  play() {
    // if ref doesn't exist or animation is not loaded, stop here
    if( !this.ref || !this._loaded ) return;

    // start RiveAnimation's playback
    this.ref.play();

    // start eyes movement if available
    if( this._listen && this._raf ) this._raf(true);
  }
  pause() {
    // if ref doesn't exist or animation is not loaded, stop here
    if( !this.ref || !this._loaded ) return;

    // pause RiveAnimation's playback
    this.ref.pause();

    // stop eyes movement if available
    if( this._listen && this._raf ) this._raf(false);
  }

  _bindFollowEvents() {
    if( !this._listen ) return;

    this.emitter.on('SiteScroll.scroll', this._onScroll);
    this.emitter.on('SiteScroll.update', this._onResize);
    ResizeOrientation.add(this._onResize);
  }
  _unbindFollowEvents() {
    this.emitter.off('SiteScroll.scroll', this._onScroll);
    this.emitter.off('SiteScroll.update', this._onResize);
    ResizeOrientation.remove(this._onResize);

    if( this._raf ) this._raf(false);
    RAF.remove(this._onRAF);
  }


  _onAnimationLoad() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    // get all inputs from RiveAnimation instance
    const inputs = this.ref.instance.stateMachineInputs(this.ref.stateMachines);
    
    // search for input
    if( this._options.inputName ) this._input = inputs.find(input => input.name === this._options.inputName);

    // true if it's required to watch scroll follow, meaning input has been found
    // false if input hasn't been found in RiveAnimation's instance
    this._listen = this._input ? true : false;

    // update loaded status
    this._loaded = true;

    if( this._listen ) {
      this._onResize();
      this._raf = RAF.add(this._onRAF, AFTER_SCROLL, false);
    } else {
      this._unbindFollowEvents();
    }

    // if not in view, stop here
    if( !this._inView ) return;

    this.play();
  }
  _onResize() {
    const { origin } = this._options;
    const { y, height } = rect(this.target);

    // calculate center of RiveAnimation's target
    this._data.origin = y + this._data.scrollY + height * origin;
    this._data.half_vh = Viewport.height / 2;
  }
  _onScrollCall(direction, obj) {
    // check if event is for this instance
    if( obj.el !== this.ref.el ) return;

    // update inView status
    this._inView = direction === INVIEW_ENTER;

    // toggle playback
    if( this._inView ) this.play();
    else this.pause();
  }
  _onScroll({ y }) { this._data.scrollY = y; }
  _onRAF() {
    const { min, max } = this._options;

    const distFromCenter = this._data.half_vh - (this._data.origin - this._data.scrollY);
    const percentage = distFromCenter / this._data.half_vh;

    this._data.input = map(percentage, -1, 1, min, max);
    if( this._input ) this._input.value = this._data.input;
  }
}

export default RiveScrollFollow;
