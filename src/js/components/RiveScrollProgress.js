import EMITTER from "@core/emitter";
import RiveListener from "@core/rive.listener";
import RiveAnimation from "@components/RiveAnimation";
import { INVIEW_ENTER } from "@scroll/constants";
import { limit } from "@utils/math";

const DEFAULT_OPTIONS = {
  inputName: 'ScrollProgress',
  target: null,
};

class RiveScrollProgress {
  constructor(ref, options = {}) {
    if( !ref ) throw new Error(`RiveScrollProgress: ${ref} is not defined`);
    if( !(ref instanceof RiveAnimation) ) throw new Error(`RiveScrollProgress: ${ref} is not an instance of @components/RiveAnimation`);

    this.ref = ref;
    this.target = options.target || this.ref.el;

    this._options = { ...DEFAULT_OPTIONS, ...options };

    this._loaded = false;
    this._inView = false;
    this._input = null;
    this._scrollObj = null;
    
    this._onAnimationLoad = this._onAnimationLoad.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  destroy() {
    this.stop();
    
    this.ref = null;
    this.target = null;

    this._options = null;
    this._loaded = null;
    this._inView = null;
    this._input = null;
    this._scrollObj = null;

    this._onAnimationLoad = null;
    this._onScrollCall = null;
    this._onScroll = null;
  }

  start() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.on('load', this._onAnimationLoad);
    RiveListener.add(this._onScrollCall);
    EMITTER.on('SiteScroll.scroll', this._onScroll);

    if( this.ref.loaded ) this._onAnimationLoad();
  }
  stop() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.off('load', this._onAnimationLoad);
    RiveListener.remove(this._onScrollCall);
    EMITTER.off('SiteScroll.scroll', this._onScroll);
  }

  _onAnimationLoad() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    // update loaded status
    this._loaded = true;

    // get all inputs from RiveAnimation instance
    const inputs = this.ref.instance.stateMachineInputs(this.ref.stateMachines);

    // search for inputs
    if( this._options.inputName ) this._input = inputs.find(input => input.name === this._options.inputName);

    // if no input is found, stop everything immediately
    if( !this._input ) {
      this.stop();
      return;
    }

    // if already in view, trigger a fake scroll-call event
    if( this._inView ) {
      this._inView = false;
      this._onScrollCall(INVIEW_ENTER, { el: this.ref.el });
    }    
  }
  _onScrollCall(direction, obj) {
    // check if event is for this instance
    if( obj.el !== this.ref.el ) return;

    // save scroll object reference
    this._scrollObj = obj;

    // if inView status is the same, stop here
    const inView = direction === INVIEW_ENTER;
    if( this._inView === inView ) return;

    // update inView status
    this._inView = inView;

    // if animation isn't loaded, stop here
    if( !this._loaded ) return;

    // toggle RiveAnimation's playback
    this.ref[this._inView ? 'play' : 'pause']();
    this._input.value = limit(0, 100, this._scrollObj.progress * 100);
  }
  _onScroll() {
    if( !this.ref || !this._loaded || !this._scrollObj || !this._input || !this._inView ) return;

    this._input.value = limit(0, 100, this._scrollObj.progress * 100);
  }
}

export default RiveScrollProgress;
