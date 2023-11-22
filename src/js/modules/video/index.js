import Video from "@components/Video";
import EMITTER from "@core/emitter";
import windmill from "@core/windmill";
import { INVIEW_ENTER } from "@scroll/constants";


class ScrollCallListener {
  constructor() {
    this.items = new Map();
    this.pausedItems = new Map();

    windmill.on('exit', this.reset, this);

    EMITTER.on('SiteScroll.video', this._onScrollCall.bind(this));
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

    const { video } = this.items.get(el);
    video[direction === INVIEW_ENTER ? "play" : "pause"]();
  }
  _onVideoResumeAll() {
    // resume all previously paused videos
    this.pausedItems.forEach(({ video }) => video.play());
  }
  _onVideoPauseAll() {
    // store all playing videos
    this.items.forEach((module, key) => { if( module.video.playing ) this.pausedItems.set(key, module); });

    // pause all videos
    this.pausedItems.forEach(({ video }) => video.pause());
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
    this.video = new Video(this.el);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.video) {
      this.video.pause();
      this.video.destroy();
    }

    this.el = null;
    this.video = null;
  }

  _bindEvents() { if( this.el && this.video ) SCROLL_CALL_LISTENER.add(this.el, this); }
  _unbindEvents() { if( this.el ) SCROLL_CALL_LISTENER.remove(this.el); }
}
