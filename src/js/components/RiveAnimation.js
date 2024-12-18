import EventEmitter2 from "eventemitter2";

import { Rive, EventType, Layout, Fit, Alignment } from "@rive-app/canvas-lite";
//import { Rive, EventType, Layout, Fit, Alignment } from "@rive-app/webgl2";
import ACF from "@utils/acf";
//import { firefox } from "@utils/browser";
import { limit } from "@utils/math";
import { touch_device } from "@utils/mobile";
import Viewport from "@utils/viewport";
import ResizeOrientation from "@utils/resize";

const ACTION_PLAY = "play";
const ACTION_PAUSE = "pause";
const DEFAULT_OPTIONS = {
  autoplay: false,
  layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  isTouchScrollEnabled: true,
  //useOffscreenRenderer: firefox() ? false : true,
  enableRiveAssetCDN: false,
  maxDPR: null,
};
const MAX_DEVICE_PIXEL_RATIO = 2;

class RiveAnimation extends EventEmitter2 {
  constructor(el, options = {}) {
    super();

    this.el = el;

    this._action = null;
    this._options = options;
    this._src = this.el.dataset.src;
    this._src_mobile = this.el.dataset.srcMobile;
    this._src_tablet = this.el.dataset.srcTablet;
    this._src_touch = this.el.dataset.srcTouch;

    this._animations = this.el.dataset.animations || false;
    this._stateMachines = this.el.dataset.stateMachines || options.stateMachines;
    this._dpr = this.el.maxDpr || options.maxDPR;
    this._rive = null;

    if( this.el.dataset.artboard ) this._options.artboard = this.el.dataset.artboard;
    if( this._animations ) {
      this._animations = this._animations.split(',');
      this._options.animations = this._animations;
    }
    if( this._stateMachines ) this._options.stateMachines = this._stateMachines;

    // convert dpr to float
    if( this._dpr ) this._dpr = parseFloat(this._dpr);

    // set default dpr if doesn't specified
    if( !this._dpr ) this._dpr = Viewport.devicePixelRatio;

    // set limit around dpr
    if( this._dpr ) this._dpr = limit(1, Math.min(MAX_DEVICE_PIXEL_RATIO, Viewport.devicePixelRatio), this._dpr);
 
    this._onLoad = this._onLoad.bind(this);
    this._onResize = this._onResize.bind(this);

    // maybe add a little delay to be able to listen to "load" event
    this.init();
  }

  init() {
    const options = { 
      ...DEFAULT_OPTIONS, 
      ...this._options, 
      ...{
        src: this.src,
        canvas: this.el,
      }
    };

    this._rive = new Rive( options );
    this._rive.on(EventType.Load, this._onLoad);

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this._rive ) {
      this._rive.off(EventType.Load, this._onLoad);
      this._rive.cleanup();
    }

    this.el = null;

    this._action = null;
    this._dpr = null;
    this._options = null;
    this._src = null;
    this._src_mobile = null;
    this._src_tablet = null;
    this._src_touch = null;
    this._animations = null;
    this._stateMachines = null;
    this._rive = null;

    this._onLoad = null;
    this._onResize = null;
  }

  play() {
    if( this._action === ACTION_PLAY ) return;
    this._action = ACTION_PLAY;

    let names = [];
    if( this._animations ) names = names.concat(this._animations);
    if( this._stateMachines ) names.push(this._stateMachines);

    if( this._rive ) this._rive.play(names);
  }
  pause() {
    if( this._action !== ACTION_PLAY ) return;
    this._action = ACTION_PAUSE;

    if( this._rive ) this._rive.pause();
  }
  stop() {
    if( this._action !== ACTION_PLAY ) return;
    this._action = ACTION_PAUSE;

    if( this._rive ) this._rive.stop();
  }
  resize() {
    this._onResize();
  }

  _onLoad() {
    if( this._rive ) this._rive.resizeDrawingSurfaceToCanvas(this._dpr);

    this.emit("load", this);

    if( ACF.is_preview ) this.play();
  }
  _onResize(){
    this._rive.resizeDrawingSurfaceToCanvas(this._dpr);
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize);
  }
  _unbindEvents() {
    ResizeOrientation.remove(this._onResize);
  }


  // getter - setter
  get instance() { return this._rive; }
  get playing() { return this._action === ACTION_PLAY; }
  get src() {
    const srcs = [ this._src ];
    const vw = Viewport.width;

    if( this._src_mobile && vw < 768 ) srcs.unshift(this._src_mobile);
    if( this._src_tablet && vw >= 768 && vw < 1024 ) srcs.unshift(this._src_tablet);
    if( this._src_touch && touch_device ) srcs.unshift(this._src_touch);

    return srcs[0];
  }
  get stateMachines() { return this._stateMachines; }
}

export default RiveAnimation;
