import RiveAnimation from "@components/RiveAnimation";
import MILL3_EMITTER from "@core/emitter";
import RiveListener from "@core/rive.listener";
import { INVIEW_ENTER } from "@scroll/constants";
import { getBody, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import { limit, map } from "@utils/math";
import { mobile } from "@utils/mobile";
import RAF, { AFTER_SCROLL } from "@utils/raf";
import ResizeOrientation from "@utils/resize";

const DEFAULT_OPTIONS = {
  originX: 0.5,
  originY: 0.5,
  radius: 300,
  target: null,
  xAxisInputName: "xAxis",
  yAxisInputName: "yAxis",
  xAxisMin: 0,
  xAxisMax: 100,
  yAxisMin: 0,
  yAxisMax: 100,
  watchScrolling: true,
};

class RiveMouseFollow {
  constructor(ref, options = {}) {
    if( !ref ) throw new Error(`RiveMouseFollow: ${ref} is not defined`);
    if( !(ref instanceof RiveAnimation) ) throw new Error(`RiveMouseFollow: ${ref} is not an instance of @components/RiveAnimation`);

    this.ref = ref;
    this.target = options.target || this.ref.el;
    this.emitter = MILL3_EMITTER;

    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._options.radius_inverted = this._options.radius * -1;

    this._data = { scrollY: 0, originX: 0, originY: 0, mouseX: 0, mouseY: 0, xAxis: 0, yAxis: 0 };
    this._loaded = false;
    this._listen = !mobile;
    this._inView = null;
    this._raf = null;
    this._xAxis = null;
    this._yAxis = null;

    this._onAnimationLoad = this._onAnimationLoad.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
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
    this._inView = null;
    this._raf = null;
    this._xAxis = null;
    this._yAxis = null;

    this._onAnimationLoad = null;
    this._onResize = null;
    this._onScrollCall = null;
    this._onScroll = null;
    this._onMouseMove = null;
    this._onRAF = null;
  }

  start() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    this.ref.on('load', this._onAnimationLoad);
    RiveListener.add(this._onScrollCall);

    this._bindFollowEvents();

    if( this.ref.loaded ) this._onAnimationLoad();
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
    if( this._listen ) this._raf(true);
  }
  pause() {
    // if ref doesn't exist or animation is not loaded, stop here
    if( !this.ref || !this._loaded ) return;

    // pause RiveAnimation's playback
    this.ref.pause();

    // stop eyes movement if available
    if( this._listen ) this._raf(false);
  }

  _bindFollowEvents() {
    if( !this._listen ) return;

    if( this._options.watchScrolling ) {
      this.emitter.on('SiteScroll.scroll', this._onScroll);
      this.emitter.on('SiteScroll.update', this._onResize);
    }

    on(getBody(), 'mousemove', this._onMouseMove);
    ResizeOrientation.add(this._onResize);
  }
  _unbindFollowEvents() {
    this.emitter.off('SiteScroll.scroll', this._onScroll);
    this.emitter.off('SiteScroll.update', this._onResize);
    off(getBody(), 'mousemove', this._onMouseMove);
    ResizeOrientation.remove(this._onResize);

    if( this._raf ) this._raf(false);
    RAF.remove(this._onRAF);
  }


  _onAnimationLoad() {
    // stop immediatly if RiveAnimation reference doesn't exist
    if( !this.ref ) return;

    // update loaded status
    this._loaded = true;

    // do not search for mouse following on mobile device
    if( !mobile ) {
      // get all inputs from RiveAnimation instance
      const inputs = this.ref.instance.stateMachineInputs(this.ref.stateMachines);
      
      // search for xAxis & yAxis inputs
      if( this._options.xAxisInputName ) this._xAxis = inputs.find(input => input.name === this._options.xAxisInputName);
      if( this._options.yAxisInputName ) this._yAxis = inputs.find(input => input.name === this._options.yAxisInputName);

      // true if it's required to watch mouse move, meaning at least one input has been found
      // false if no input has been found in RiveAnimation's instance
      this._listen = this._xAxis || this._yAxis ? true : false;

      if( this._listen ) {
        this._onResize();
        this._raf = RAF.add(this._onRAF, AFTER_SCROLL, false);
      } else {
        this._unbindFollowEvents();
      }
    }

    // if not in view, stop here
    if( !this._inView ) return;

    this.play();
  }
  _onResize() {
    const { originX, originY } = this._options;
    const { x, y, width, height } = rect(this.target);

    // calculate center of RiveAnimation's target
    this._data.originX = x + width * originX;
    this._data.originY = y + this._data.scrollY + height * originY;
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
  _onMouseMove(event) {
    this._data.mouseX = event.clientX;
    this._data.mouseY = event.clientY;
  }
  _onRAF() {
    const { radius, radius_inverted, xAxisMin, xAxisMax, yAxisMin, yAxisMax } = this._options;

    const xDistFromOriginX = limit(radius_inverted, radius, this._data.mouseX - this._data.originX);
    const yDistFromOriginY = limit(radius_inverted, radius, this._data.mouseY + this._data.scrollY - this._data.originY);

    this._data.xAxis = map(xDistFromOriginX, radius_inverted, radius, xAxisMin, xAxisMax);
    this._data.yAxis = map(yDistFromOriginY, radius_inverted, radius, yAxisMin, yAxisMax);

    if( this._xAxis ) this._xAxis.value = this._data.xAxis;
    if( this._yAxis ) this._yAxis.value = this._data.yAxis;
  }
}

export default RiveMouseFollow;
