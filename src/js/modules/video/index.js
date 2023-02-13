import Video from "@components/Video";
import EMITTER from "@core/emitter";
import windmill from "@core/windmill";
import { INVIEW_ENTER } from "@scroll/constants";


class ScrollCallListener {
  constructor() {
    this.items = new Map();

    this._onScrollBnd = this._onScrollCall.bind(this);
    this._onVideoDestroyBnd = this._onVideoDestroy.bind(this);

    windmill.on('exit', this.reset, this);

    EMITTER.on('SiteScroll.video', this._onScrollBnd);
    EMITTER.on('Video.destroy', this._onVideoDestroyBnd);
  }

  add(el, scrollCallCallback, destroyCallback) {
    this.items.set(el, { scrollCallCallback, destroyCallback });
  }
  remove(el) {
    this.items.delete(el);
  }
  reset() {
    this.items.clear();
  }

  _onScrollCall(direction, { el }) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    // run callback
    this.items.get(el).scrollCallCallback(direction);
  }
  _onVideoDestroy(el) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    // run callback
    this.items.get(el).destroyCallback();
  }
}

const SCROLL_CALL_LISTENER = new ScrollCallListener();

export default class {
  constructor(el) {
    this.el = el;
    this.video = new Video(this.el);

    this._onScrollCall = this._onScrollCall.bind(this);
    this._onVideoDestroy = this._onVideoDestroy.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.video) this.video.destroy();

    this.el = null;
    this.video = null;

    this._onScrollCall = null;
    this._onVideoDestroy = null;
  }

  _bindEvents() {
    if( this.video ) SCROLL_CALL_LISTENER.add(this.el, this._onScrollCall, this._onVideoDestroy);
  }
  _unbindEvents() { SCROLL_CALL_LISTENER.remove(this.el); }

  _onScrollCall(direction) {
    if( !this.video ) return;

    // TODO: check if video is visible before calling is method (for responsive viewports)
    this.video[direction === INVIEW_ENTER ? "play" : "pause"]();
  }
  _onVideoDestroy() {
    if( !this.video ) return;

    this._unbindEvents();

    this.video.pause();
    this.video.destroy();
    this.video = null;
  }
}
