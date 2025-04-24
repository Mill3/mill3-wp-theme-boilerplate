import RiveListener from "@core/rive.listener";
import RiveAnimation from "@components/RiveAnimation";
import { INVIEW_ENTER } from "@scroll/constants";
import ACF from "@utils/acf";

const DEFAULT_OPTIONS = {
  inViewInputName: 'inView',
  outViewInputName: 'outView',
  repeat: false,
};

class RiveInViewTrigger {
  constructor(ref, options = {}) {
    if( !ref ) throw new Error(`RiveInViewTrigger: ${ref} is not defined`);
    if( !(ref instanceof RiveAnimation) ) throw new Error(`RiveInViewTrigger: ${ref} is not an instance of @components/RiveAnimation`);

    this.ref = ref;

    this._options = { ...DEFAULT_OPTIONS, ...options };

    this._loaded = false;
    this._inView = false;
    this._inViewInput = null;
    this._outViewInput = null;
    
    this._onAnimationLoad = this._onAnimationLoad.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
  }

  destroy() {
    this.stop();

    this.ref = null;

    this._options = null;
    this._loaded = null;
    this._inView = null;
    this._inViewInput = null;
    this._outViewInput = null;

    this._onAnimationLoad = null;
    this._onScrollCall = null;
  }

  start() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.on('load', this._onAnimationLoad);
    RiveListener.add(this._onScrollCall);

    if( this.ref.loaded ) this._onAnimationLoad();
  }
  stop() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.off('load', this._onAnimationLoad);
    RiveListener.remove(this._onScrollCall);
  }

  _onAnimationLoad() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    // update loaded status
    this._loaded = true;

    // get all inputs from RiveAnimation instance
    const inputs = this.ref.instance.stateMachineInputs(this.ref.stateMachines);

    // search for inputs
    if( this._options.inViewInputName ) this._inViewInput = inputs.find(input => input.name === this._options.inViewInputName);
    if( this._options.outViewInputName ) this._outViewInput = inputs.find(input => input.name === this._options.outViewInputName);

    // if no inputs were find, stop everything immediately
    if( !this._inViewInput && !this._outViewInput ) {
      this.stop();
      return;
    }

    // if already in view or in ACF Preview, trigger a fake scroll-call event
    if( this._inView || ACF.is_preview ) {
      this._inView = false;
      this._onScrollCall(INVIEW_ENTER, { el: this.ref.el });
    }    
  }
  _onScrollCall(direction, obj) {
    // check if event is for this instance
    if( obj.el !== this.ref.el ) return;

    // if inView status is the same, stop here
    const inView = direction === INVIEW_ENTER;
    if( this._inView === inView ) return;

    // update inView status
    this._inView = inView;

    // if animation isn't loaded, stop here
    if( !this._loaded ) return;

    // toggle RiveAnimation's playback
    this.ref[this._inView ? 'play' : 'pause']();

    if( this._inView ) this._inViewInput?.fire();
    else this._outViewInput?.fire();

    // stop listening to inView event if repeat != true
    if( !this._options.repeat ) setTimeout(() => this.stop(), 0);
  }
}

export default RiveInViewTrigger;
