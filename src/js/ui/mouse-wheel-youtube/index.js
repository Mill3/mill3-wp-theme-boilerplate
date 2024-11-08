import YoutubePlayer from "@components/YoutubePlayer";
import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";
import YoutubeAPI from "@utils/youtube-api";

export const SELECTOR = `.wysiwyg iframe[src*="youtube.com"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

class MouseWheelYoutube {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.items = null;

    this._elements = null;
    this._status = STATUS_DESTROYED;

    this._initChildren = this._initChildren.bind(this);
  }

  init() {
    // do nothing for mobile
    if (mobile) return;

    // query all elements that will turn into MouseWheelYoutubeItem later
    this._elements = [ ...$$(SELECTOR, this.el) ];

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

    this.el = null;
    this.emitter = null;
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
      const item = new YoutubePlayer(el);

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
    this.items = this._elements.map(el => new YoutubePlayer(el));
    this._elements = null;
  }
}

export default MouseWheelYoutube;
