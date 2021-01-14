import { $$ } from "@utils/dom";

import Module from "../module/Module";
import Video from "./Video";

export const SELECTOR = `[data-module*="video"]`;

class Factory extends Module {
  constructor(init = false) {
    super();

    this.initialized = false;
    this.items = null;

    this._onScrollCall = this._onScrollCall.bind(this);

    init ? this.init() : null;
  }

  get name() {
    return "Video";
  }

  init() {
    // set initialized
    this.initialized = true;
    this.items = [...$$(SELECTOR)].map(el => new Video(el, this.emitter));

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.items) this.items.forEach(el => el.destroy());

    this.initialized = false;
    this.items = null;
  }

  _bindEvents() {
    if (this.emitter) this.emitter.on(`SiteScroll.video`, this._onScrollCall);
  }
  _unbindEvents() {
    if (this.emitter) this.emitter.off(`SiteScroll.video`, this._onScrollCall);
  }
  _onScrollCall(direction, { el }) {
    if (!this.items) return;

    const video = this.items.find(video => video.el === el);
    if (!video) return;

    // TODO: check if video is visible before calling is method (for responsive viewports)
    video[direction === "enter" ? "play" : "pause"]();
  }
}

export default Factory;
