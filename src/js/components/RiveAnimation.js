import EventEmitter2 from "eventemitter2";

//import { Rive, EventType, RiveEventType, Layout, Fit, Alignment } from "@rive-app/canvas-lite";
//import { Rive, EventType, RiveEventType, Layout, Fit, Alignment } from "@rive-app/canvas";
import { Rive, EventType, RiveEventType, Layout, Fit, Alignment } from "@rive-app/webgl2";
import ACF from "@utils/acf";
import { firefox } from "@utils/browser"; // only when using webgl2
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
  useOffscreenRenderer: firefox() ? false : true,
  enableRiveAssetCDN: false,
  maxDPR: null,
};
const MIN_DEVICE_PIXEL_RATIO = 1;
const MAX_DEVICE_PIXEL_RATIO = 2;
const ROLLOVER_EVENT = 'Rollover';
const ROLLOUT_EVENT = 'Rollout';
const CURSOR_CLASSNAME = '--js-cursor';
const PLAYBACK_DEFAULT = 0;
const PLAYBACK_RESTART_WHEN_VISIBLE = 1;

class RiveAnimation extends EventEmitter2 {
  constructor(el, options = {}) {
    super();

    this.el = el;

    this._action = null;
    this._options = options;
    this._loaded = false;
    this._playedOnce = false;
    this._src = this.el.dataset.src;
    this._src_mobile = this.el.dataset.srcMobile;
    this._src_tablet = this.el.dataset.srcTablet;
    this._src_touch = this.el.dataset.srcTouch;

    this._animations = this.el.dataset.animations || false;
    this._stateMachines = this.el.dataset.stateMachines || options.stateMachines;
    this._dpr = this.el.dataset.maxDpr || options.maxDPR;
    this._playback = this.el.dataset.playback || PLAYBACK_DEFAULT;
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
    if( this._dpr ) this._dpr = limit(MIN_DEVICE_PIXEL_RATIO, Math.min(MAX_DEVICE_PIXEL_RATIO, Viewport.devicePixelRatio), this._dpr);

    // make sure playback value is valid
    if( this._playback ) {
      this._playback = parseInt(this._playback);

      switch(this._playback) {
        case PLAYBACK_RESTART_WHEN_VISIBLE: 
          this._playback = PLAYBACK_RESTART_WHEN_VISIBLE; 
          break;
        
        default: PLAYBACK_DEFAULT;
          break;
      }
    }

    // create layout from options
    if( this.el.hasAttribute('data-fit') || this.el.hasAttribute('data-alignment') ) {
      this._options.layout = new Layout({
        fit: this.el.hasAttribute('data-fit') ? this.el.dataset.fit : DEFAULT_OPTIONS.layout.fit, 
        alignment: this.el.hasAttribute('data-alignment') ? this.el.dataset.alignment : DEFAULT_OPTIONS.layout.alignment, 
      });
    }
 
    this._onLoad = this._onLoad.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onDetectRollover = this._onDetectRollover.bind(this);

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

    if( this.el.hasAttribute('data-detect-rollover') ) this._rive.on(EventType.RiveEvent, this._onDetectRollover);

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this._rive ) {
      this._rive.off(EventType.Load, this._onLoad);
      this._rive.off(EventType.RiveEvent, this._onDetectRollover);
      this._rive.cleanup();
    }
    if( this.el ) this.el.classList.remove(CURSOR_CLASSNAME);

    this.el = null;

    this._action = null;
    this._dpr = null;
    this._loaded = null;
    this._options = null;
    this._playback = null;
    this._playedOnce = null;
    this._src = null;
    this._src_mobile = null;
    this._src_tablet = null;
    this._src_touch = null;
    this._animations = null;
    this._stateMachines = null;
    this._rive = null;

    this._onLoad = null;
    this._onResize = null;
    this._onDetectRollover = null;
  }

  play() {
    if( this._action === ACTION_PLAY ) return;
    this._action = ACTION_PLAY;

    if( !this._rive ) return;

    if( this._playback === PLAYBACK_RESTART_WHEN_VISIBLE && this._playedOnce ) {
      this._rive.reset({
        artboard: this._options.artboard ? this._options.artboard : null,
        animations: this._animations,
        stateMachines: this._stateMachines,
        autoplay: false,
      });
    }

    let names = [];

    if( this._animations ) names = names.concat(this._animations);
    if( this._stateMachines ) names.push(this._stateMachines);

    this._rive.play(names);
    this._playedOnce = true;
 
  }
  pause() {
    if( this._action !== ACTION_PLAY ) return;
    this._action = ACTION_PAUSE;

    if( this._rive ) this._rive.pause();
  }
  resume() {
    if( this._action === ACTION_PLAY ) return;
    this._action = ACTION_PLAY;

    let names = [];
    if( this._animations ) names = names.concat(this._animations);
    if( this._stateMachines ) names.push(this._stateMachines);

    if( this._rive ) this._rive.play(names);
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

    this._loaded = true;
    this.emit("load", this);

    if( ACF.is_preview ) this.play();
  }
  _onResize(){
    this._rive.resizeDrawingSurfaceToCanvas(this._dpr);
  }
  _onDetectRollover(event) {
    const { type, name } = event.data;
    if( type !== RiveEventType.General ) return;

    switch( name ) {
      case ROLLOVER_EVENT: this.el.classList.add(CURSOR_CLASSNAME); break;
      case ROLLOUT_EVENT: this.el.classList.remove(CURSOR_CLASSNAME); break;
    }
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize);
  }
  _unbindEvents() {
    ResizeOrientation.remove(this._onResize);
  }


  // getter - setter
  get loaded() { return this._loaded; }
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
