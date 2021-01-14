import Player from "@vimeo/player";

import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";

export const SELECTOR = `.wysiwyg iframe[src*="vimeo.com"]`;

class LocomotiveScrollVimeo {
  constructor(init = false) {
    this.items = null;

    init ? this.init() : null;
  }

  init() {
    if (mobile) return;

    this.items = Array.from($$(SELECTOR)).map(el => new LocomotiveScrollVimeoItem(el));
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());
    this.items = null;
  }

  start() {
    if (this.items) this.items.forEach(el => el.start());
  }

  stop() {
    if (this.items) this.items.forEach(el => el.stop());
  }
}

class LocomotiveScrollVimeoItem {
  constructor(el) {
    this.el = el;
    this.parent = this.el.parentNode;

    // just to make sure this iframe is contained in a responsive box of our own
    if (!this.parent.classList.contains("box-content")) this.parent = null;

    this._onClick = this._onClick.bind(this);
    this._onPlaying = this._onPlaying.bind(this);
    this._onPause = this._onPause.bind(this);
  }

  destroy() {
    if (this.player) this.player.destroy();

    this.el = null;
    this.parent = null;
    this.player = null;

    this._onClick = null;
    this._onPlaying = null;
    this._onPause = null;
  }
  start() {
    this._bindEvents();
  }
  stop() {
    this._unbindEvents();

    if (this.player) {
      this.player.off("playing", this._onPlaying);
      this.player.off("pause", this._onPause);
    }
  }

  _bindEvents() {
    if (this.parent) {
      this.el.style.pointerEvents = "none";

      this.parent.removeEventListener("click", this._onClick);
      this.parent.addEventListener("click", this._onClick);
    }
  }
  _unbindEvents() {
    if (this.parent) {
      this.el.style.pointerEvents = "";
      this.parent.removeEventListener("click", this._onClick);
    }
  }

  _onClick(event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.player) {
      this.player = new Player(this.el);
      this.player.on("playing", this._onPlaying);
      this.player.on("pause", this._onPause);
    }

    this.player.play();
  }
  _onPlaying() {
    this._unbindEvents();
  }
  _onPause() {
    this._bindEvents();
  }
}

export default LocomotiveScrollVimeo;
