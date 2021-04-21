import { $$, head } from "@utils/dom";
import { mobile } from "@utils/mobile";

export const SELECTOR = `.wysiwyg iframe[src*="youtube.com"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

let UDID = 1;

class LocomotiveScrollYoutube {
  constructor(init = false) {
    this.items = null;

    this._elements = null;
    this._script = null;
    this._status = STATUS_DESTROYED;

    this._initChildren = this._initChildren.bind(this);

    init ? this.init() : null;
  }

  init() {
    if (mobile) return;

    this._elements = Array.from($$(SELECTOR));
    if( !this._elements || this._elements.length === 0 ) return;

    this._status = STATUS_INITIALIZED;

    if( !this._script ) {
      this._script = document.createElement("script");
      this._script.onerror = e => {
        console.error("Error loading Youtube iFrame API :", e);
      };

      window.onYouTubeIframeAPIReady = () => {
        if( this._status < STATUS_INITIALIZED ) return;
        
        this._initChildren();
        if( this._status === STATUS_STARTED ) this.start();

        window.onYouTubeIframeAPIReady = null;
      }

      this._script.src = "https://www.youtube.com/iframe_api";
      head.appendChild(this._script);
    }
    else this._initChildren();
  }

  destroy() {
    if (this.items) this.items.forEach(el => el.destroy());
    this.items = null;

    this._elements = null;
    this._status = STATUS_DESTROYED;
  }

  start() {
    this._status = STATUS_STARTED;
    if (this.items) this.items.forEach(el => el.start());
  }

  stop() {
    if (this.items) this.items.forEach(el => el.stop());
    this._status = STATUS_STOPPED;
  }

  _initChildren() {
    this.items = this._elements.map(el => new LocomotiveScrollYoutubeItem(el));
    this._elements = null;
  }
}

class LocomotiveScrollYoutubeItem {
  constructor(el) {
    this.el = el;
    this.parent = this.el.parentNode;
    this.udid = this.el.id ? this.el.id : null;

    if( !this.udid ) {
      this.udid = `youtube-smooth-scroll--${UDID++}`;
      this.el.id = this.udid;
    }

    this._playerReady = false;
    this._playerStatus = null;

    this._onClick = this._onClick.bind(this);
    this._onReady = this._onReady.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
  }

  destroy() {
    if (this.player) this.player.destroy();

    this.el = null;
    this.parent = null;
    this.player = null;
    this.udid = null;

    this._playerReady = null;
    this._playerStatus = null;

    this._onClick = null;
    this._onReady = null;
    this._onStateChange = null;
  }
  start() {
    this._bindEvents();
  }
  stop() {
    this._unbindEvents();

    if (this.player) {
      this.player.removeEventListener("onReady", this._onReady);
      this.player.removeEventListener("onStateChange", this._onStateChange);
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
      this.player = new YT.Player(this.udid);
      this.player.addEventListener("onReady", this._onReady);
      this.player.addEventListener("onStateChange", this._onStateChange);
    } else if( this._playerReady === true ) {
      this.player.playVideo();
    }
  }
  _onReady() {
    this._playerReady = true;
    this.player.playVideo();

    this._unbindEvents();
  }
  _onStateChange(event) {
    // on pause or ended
    if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) this._bindEvents();
    // on playing
    else if(event.data === YT.PlayerState.PLAYING) this._unbindEvents();
  }
}

export default LocomotiveScrollYoutube;
