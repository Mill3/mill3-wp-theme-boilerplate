import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";

export const SELECTOR = `.wysiwyg iframe[src*="vimeo.com"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

let Player;

class MouseWheelVimeo {
  constructor(init = false) {
    this.items = null;

    this._elements = null;
    this._promise = null;
    this._status = STATUS_DESTROYED;

    init ? this.init() : null;
  }

  init() {
    // do nothing for mobile
    if (mobile) return;

    // query all elements that will turn into MouseWheelVimeoItem later
    this._elements = Array.from($$(SELECTOR));

    // if there is no elements, skip here
    if( !this._elements || this._elements.length === 0 ) return;

    // set status as initialized
    this._status = STATUS_INITIALIZED;

    // load Vimeo API
    if( !Player && !this._promise ) {
      this._promise = import("@vimeo/player");
      this._promise.then(chunk => {
        Player = chunk.default;

        // if status is lower than initialized (ex: destroyed), do nothing
        if( this._status < STATUS_INITIALIZED ) return;
        
        // create childs
        this._initChildren();

        // if status is started, start childs
        if( this._status === STATUS_STARTED ) this.start();
      });
      this._promise.catch(e => {
        console.error("Error loading Vimeo Player API :", e);
      });
    }
    else if( Player ) this._initChildren();
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

    // load Vimeo API
    if( !Player && !this._promise ) {
      this._promise = import("@vimeo/player");
      this._promise.then(chunk => {
        Player = chunk.default;

        // if status is lower than initialized (ex: destroyed), do nothing
        if( this._status < STATUS_INITIALIZED ) return;
        
        // create child instance
        const item = new MouseWheelVimeoItem(el);

        // save instance for later
        if( !this.items ) this.items = [];
        this.items.push(item);

        // start instance if module is started
        if( this._status === STATUS_STARTED ) item.start();
      });
      this._promise.catch(e => {
        console.error("Error loading Vimeo Player API :", e);
      });
    }
    else if( Player ) {
      // create child instance
      const item = new MouseWheelVimeoItem(el);

      // save instance for later
      if( !this.items ) this.items = [];
      this.items.push(item);

      // start instance if module is started
      if( this._status === STATUS_STARTED ) item.start();
    }
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
    this.items = this._elements.map(el => new MouseWheelVimeoItem(el));
    this._elements = null;
  }
}

class MouseWheelVimeoItem {
  constructor(el) {
    this.el = el;
    this.parent = this.el.parentNode;

    // just to make sure this iframe is contained in a responsive box of our own
    //if (!this.parent.classList.contains("box")) this.parent = null;


    const urlParams = new URLSearchParams(this.el.src);
    this._autoplay = urlParams.get('autoplay') === '1';

    this._onClick = this._onClick.bind(this);
    this._onPlaying = this._onPlaying.bind(this);
    this._onPause = this._onPause.bind(this);
  }

  destroy() {
    if (this.player) this.player.destroy();

    this.el = null;
    this.parent = null;
    this.player = null;

    this._autoplay = null;

    this._onClick = null;
    this._onPlaying = null;
    this._onPause = null;
  }
  start() {
    this._bindEvents();

    // autoplay hack
    if( this._autoplay ) this._onClick();
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

export default MouseWheelVimeo;
