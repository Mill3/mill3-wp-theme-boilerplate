import RiveAnimation from "@components/RiveAnimation";
import EMITTER from "@core/emitter";
import windmill from "@core/windmill";
import { INVIEW_ENTER } from "@scroll/constants";


class ScrollCallListener {
  constructor() {
    this.items = new Map();
    this.pausedItems = new Map();

    windmill.on('exit', this.reset, this);

    EMITTER.on('SiteScroll.rive', this._onScrollCall.bind(this));
    EMITTER.on('Video.resumeAll', this._onVideoResumeAll.bind(this));
    EMITTER.on('Video.pauseAll', this._onVideoPauseAll.bind(this));
    EMITTER.on('Video.destroy', this._onVideoDestroy.bind(this));
  }

  add(el, module) {
    this.items.set(el, module);
  }
  remove(el) {
    this.items.delete(el);
    this.pausedItems.delete(el);
  }
  reset() {
    this.items.clear();
    this.pausedItems.clear();
  }

  _onScrollCall(direction, { el }) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    const { rive } = this.items.get(el);
    rive[direction === INVIEW_ENTER ? "play" : "pause"]();
  }
  _onVideoResumeAll() {
    // resume all previously paused animations
    this.pausedItems.forEach(({ rive }) => rive.play());
  }
  _onVideoPauseAll() {
    // store all playing animations
    this.items.forEach((module, key) => { if( module.rive.playing ) this.pausedItems.set(key, module); });

    // pause all animations
    this.pausedItems.forEach(({ rive }) => rive.pause());
  }
  _onVideoDestroy(el) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    // destroy module
    this.items.get(el).destroy();
  }
}

const SCROLL_CALL_LISTENER = new ScrollCallListener();

export default class {
  constructor(el) {
    this.el = el;
    this.rive = new RiveAnimation(this.el);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.rive) {
      this.rive.pause();
      this.rive.destroy();
    }

    this.el = null;
    this.rive = null;
  }

  _bindEvents() { if( this.el && this.rive ) SCROLL_CALL_LISTENER.add(this.el, this); }
  _unbindEvents() { if( this.el ) SCROLL_CALL_LISTENER.remove(this.el); }
}
