import RiveAnimation from "@components/RiveAnimation";
import EMITTER from "@core/emitter";
import windmill from "@core/windmill";
import { INVIEW_ENTER } from "@scroll/constants";


class ScrollCallListener {
  constructor() {
    this.items = new Map();
    this.pausedItems = new Map();
    this.mutations = new Set();
    this.mutationObserver = new MutationObserver(this._onMutation.bind(this));

    windmill.on('exit', this.reset, this);

    EMITTER.on('SiteScroll.rive', this._onScrollCall.bind(this));
    EMITTER.on('Video.resumeAll', this._onVideoResumeAll.bind(this));
    EMITTER.on('Video.pauseAll', this._onVideoPauseAll.bind(this));
    EMITTER.on('Video.destroy', this._onVideoDestroy.bind(this));
  }

  add(el, module) {
    // if element has [data-lazyload] attribute but not [data-lazyload-ignore] attribute, watch for mutation to load animation
    if( el.hasAttribute('data-lazyload') && !el.hasAttribute('data-lazyload-ignore') ) {
      this.mutations.add(el);
      this.mutationObserver.observe(el, { attributes: true, attributeFilter: ['data-lazyload'] });
    }

    this.items.set(el, module);
  }
  remove(el) {
    if( this.mutations.has(el) ) this.mutations.delete(el);

    this.items.delete(el);
    this.pausedItems.delete(el);
  }
  reset() {
    this.mutationObserver.disconnect();
    this.mutations.clear();
    this.items.clear();
    this.pausedItems.clear();
  }

  _onScrollCall(direction, { el }) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    const { rive } = this.items.get(el);
    rive[direction === INVIEW_ENTER ? "play" : "pause"]();
  }
  _onVideoResumeAll() {
    // resume all previously paused animations
    this.pausedItems.forEach(({ rive }) => rive.resume());
  }
  _onVideoPauseAll() {
    // store all playing animations
    this.items.forEach((module, key) => { if( module.rive.playing ) this.pausedItems.set(key, module); });

    // pause all animations
    this.pausedItems.forEach(({ rive }) => rive.pause());
  }
  _onVideoDestroy(el) {
    // if object is not added to listener, stop here
    if( !this.items.has(el) ) return;

    // destroy module
    this.items.get(el).destroy();
  }
  _onMutation(mutations) {
    for( const mutation of mutations ) {
      const el = mutation.target;

      // if element has been removed from mutations, continue to next mutation
      if( !this.mutations.has(el) ) continue;

      // if element has [data-lazyload] attribute, continue to next mutation
      if( el.hasAttribute('data-lazyload') ) continue;

      // remove element from mutations
      this.mutations.delete(el);

      // initialize Rive animation
      const item = this.items.get(el);
      if( item && item.rive ) item.rive.init();
    }
  }
}

const SCROLL_CALL_LISTENER = new ScrollCallListener();

export default class {
  constructor(el) {
    this.el = el;
    this.rive = new RiveAnimation(this.el);
  }

  load() {
    if( this.el.hasAttribute('data-lazyload') ) return;
    if( this.rive.loaded ) return;
    
    return new Promise(resolve => {
      this.rive.init();
      this.rive.once('load', resolve);
    });
  }
  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if (this.rive) {
      this.rive.pause();
      this.rive.destroy();
    }

    this.el = null;
    this.rive = null;
  }

  _bindEvents() { if( this.el && this.rive ) SCROLL_CALL_LISTENER.add(this.el, this); }
  _unbindEvents() { if( this.el ) SCROLL_CALL_LISTENER.remove(this.el); }
}
