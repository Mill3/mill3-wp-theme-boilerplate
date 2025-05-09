import VimeoPlayer from "@components/VimeoPlayer";
import { $$ } from "@utils/dom";
import { mobile } from "@utils/mobile";
import VimeoAPI from "@utils/vimeo-api";

export const SELECTOR = `.wysiwyg iframe[src*="vimeo.com"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

class MouseWheelVimeo {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.items = null;

    this._elements = null;
    this._promise = null;
    this._status = STATUS_DESTROYED;

    this._initChildren = this._initChildren.bind(this);
    this._onAdd = this._onAdd.bind(this);
  }

  init() {
    // do nothing for mobile
    if (mobile) return;

    this._bindEvents();

    // query all elements that will turn into MouseWheelVimeoItem later
    this._elements = Array.from($$(SELECTOR, this.el));

    // if there is no elements, skip here
    if( !this._elements || this._elements.length === 0 ) return;

    // set status as initialized
    this._status = STATUS_INITIALIZED;

    // load Vimeo API
    VimeoAPI.load().then(() => {
      // if status is lower than initialized (ex: destroyed), do nothing
      if( this._status < STATUS_INITIALIZED ) return;

      // create childs
      this._initChildren();

      // if status is started, start childs
      if( this._status === STATUS_STARTED ) this.start();
    });
  }
  destroy() {
    this._unbindEvents();

    if (this.items) this.items.forEach(el => el.destroy());

    this.el = null;
    this.emitter = null;
    this.items = null;

    this._elements = null;
    this._status = STATUS_DESTROYED;

    this._initChildren = null;
    this._onAdd = null;
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

    // load VimeoAPI and create child instance
    VimeoAPI.load().then(() => {
      // if module is destroyed during API loading, do nothing
      if( this._status < STATUS_INITIALIZED ) return;

      // create child instance
      const item = new VimeoPlayer(el);

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
    this.items = this._elements.map(el => new VimeoPlayer(el));
    this._elements = null;
  }
  _bindEvents() {
    this.emitter.on('oEmbed.add', this._onAdd);
  }
  _unbindEvents() {
    this.emitter.off('oEmbed.add', this._onAdd);
  }
  _onAdd(iframe) {
    // if mobile or iframe isn't from Vimeo, stop here
    if( mobile || !iframe.src.includes('vimeo.com') ) return;

    // add iFrame to queue
    this.add(iframe);
  }
}

export default MouseWheelVimeo;
