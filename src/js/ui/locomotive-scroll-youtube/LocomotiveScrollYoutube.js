import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";
import YoutubeAPI from "@utils/youtube-api";

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
    this._status = STATUS_DESTROYED;

    this._initChildren = this._initChildren.bind(this);

    init ? this.init() : null;
  }

  init() {
    // do nothing for mobile
    if (mobile) return;

    // query all elements that will turn into LocomotiveScrollYoutubeItem later
    this._elements = Array.from($$(SELECTOR));

    // if there is no elements, skip here
    if( !this._elements || this._elements.length === 0 ) return;

    // set status as initialized
    this._status = STATUS_INITIALIZED;

    // load Youtube API
    YoutubeAPI.load().then(() => {
      // if status is lower than initialized (ex: destroyed), do nothing
      if( this._status < STATUS_INITIALIZED ) return;
      
      // create childs
      this._initChildren();

      // if status is started, start childs
      if( this._status === STATUS_STARTED ) this.start();
    });
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

  add(el) {
    // do nothing for mobile
    if (mobile) return;

    // if not already initialized, set as initialized
    if( this._status < STATUS_INITIALIZED ) this._status = STATUS_INITIALIZED;

    // load YoutubeAPI and create child instance
    YoutubeAPI.load().then(() => {
      // if module is destroyed during API loading, do nothing
      if( this._status < STATUS_INITIALIZED ) return;

      // create child instance
      const item = new LocomotiveScrollYoutubeItem(el);

      // save instance for later
      if( !this.items ) this.items = [];
      this.items.push(item);

      // start instance if module is started
      if( this._status === STATUS_STARTED ) item.start();
    });
  }
  remove(el) {
    // remove from uninitialized element if exists
    if( this._elements ) this._elements = this._elements.filter(element => element !== el);

    // remove from items
    if( this.items ) {
      // find his index in array
      const index = this.items.findIndex(item => item.el === el);

      // if found in array, stop and remove instance
      if( index > -1 ) {
        const item = this.items.splice(index, 1)[0];
              item.stop();
              item.destroy();
      }
    }
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

    const urlParams = new URLSearchParams(this.el.src);

    this._autoplay = urlParams.get('autoplay') === '1';
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

    this._autoplay = null;
    this._playerReady = null;
    this._playerStatus = null;

    this._onClick = null;
    this._onReady = null;
    this._onStateChange = null;
  }
  start() {
    this._bindEvents();

    // autoplay hack
    if( this._autoplay ) {
      this._onClick();
      this._onStateChange({data: YT.PlayerState.PLAYING});
    }
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
    this._playerReady = true;
    
    // on pause or ended
    if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) this._bindEvents();
    // on playing
    else if(event.data === YT.PlayerState.PLAYING) this._unbindEvents();
  }
}

export default LocomotiveScrollYoutube;
