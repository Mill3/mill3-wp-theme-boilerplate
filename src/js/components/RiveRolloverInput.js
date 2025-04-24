import RiveAnimation from "@components/RiveAnimation";
import { on, off } from "@utils/listener";

const DEFAULT_OPTIONS = {
  inputName: 'Hover',
};

class RiveRolloverInput {
  constructor(ref, target, options = {}) {
    if( !ref ) throw new Error(`RiveRolloverInput: ${ref} is not defined`);
    if( !(ref instanceof RiveAnimation) ) throw new Error(`RiveRolloverInput: ${ref} is not an instance of @components/RiveAnimation`);
    if( !target ) throw new Error(`RiveRolloverInput: ${target} is not defined`);

    this.ref = ref;
    this.target = target;

    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._hover = false;
    this._loaded = false;
    this._input = null;
    
    this._onAnimationLoad = this._onAnimationLoad.bind(this);
    this._onRollover = this._onRollover.bind(this);
    this._onRollout = this._onRollout.bind(this);
  }

  destroy() {
    this.stop();

    this.ref = null;
    this.target = null;

    this._options = null;
    this._hover = null;
    this._loaded = null;
    this._input = null;

    this._onAnimationLoad = null;
    this._onRollover = null;
    this._onRollout = null;
  }

  start() {
    // stop immediatly if RiveAnimation reference or target doesn't exist
    if( !this.ref || !this.target ) return;

    this.ref.on('load', this._onAnimationLoad);

    on(this.target, 'mouseenter', this._onRollover);
    on(this.target, 'mouseleave', this._onRollout);

    if( this.ref.loaded ) this._onAnimationLoad();
  }
  stop() {
    // stop immediatly if RiveAnimation reference or target doesn't exist
    if( !this.ref || !this.target ) return;

    this.ref.off('load', this._onAnimationLoad);

    off(this.target, 'mouseenter', this._onRollover);
    off(this.target, 'mouseleave', this._onRollout);
  }

  _onAnimationLoad() {
    // stop immediatly if RiveAnimation reference or target doesn't exist
    if( !this.ref || !this.target ) return;

    // update loaded status
    this._loaded = true;

    // get all inputs from RiveAnimation instance
    const inputs = this.ref.instance.stateMachineInputs(this.ref.stateMachines);

    // search for input
    if( this._options.inputName ) this._input = inputs.find(input => input.name === this._options.inputName);

    // if no input is found, stop everything immediately
    if( !this._input ) {
      this.stop();
      return;
    }

    // if currently hovering, set input to true
    if( this._hover ) this._input.value = true;
  }
  _onRollover() {
    this._hover = true;
    if( this._input ) this._input.value = true;
  }
  _onRollout() {
    this._hover = false;
    if( this._input ) this._input.value = false;
  }
}

export default RiveRolloverInput;
