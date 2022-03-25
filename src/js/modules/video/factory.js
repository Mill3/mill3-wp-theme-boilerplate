import { $$ } from "@utils/dom";

import Video from "@components/Video";
import Module from "../module/Module";

export const SELECTOR = `[data-video]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    this._onScrollCall = this._onScrollCall.bind(this);
    this._onVideoDestroy = this._onVideoDestroy.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return "Video";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new Video(el));

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }

  _bindEvents() {
    if (this.emitter) {
      this.emitter.on(`SiteScroll.video`, this._onScrollCall);
      this.emitter.on('Video.destroy', this._onVideoDestroy);
    }
  }
  _unbindEvents() {
    if (this.emitter) {
      this.emitter.off(`SiteScroll.video`, this._onScrollCall);
      this.emitter.off('Video.destroy', this._onVideoDestroy);
    }
  }

  _onScrollCall(direction, { el }) {
    if (!this.items) return;

    const video = this.items.find(video => video.el === el);
    if (!video) return;

    // TODO: check if video is visible before calling is method (for responsive viewports)
    video[direction === "enter" ? "play" : "pause"]();
  }
  _onVideoDestroy(el) {
    if (!this.items) return;

    const index = this.items.findIndex(video => video.el === el);
    if (index < 0) return;

    let video = this.items.splice(index, 1)[0];
        video.pause();
        video.destroy();
        video = null;
  }
}

export default Factory;
