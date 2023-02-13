import { $$, wrap } from "@utils/dom";
import { mobile } from "@utils/mobile";
import FacebookSDK from "@utils/facebook-sdk";

export const SELECTOR = `.wysiwyg iframe[src*="facebook.com/plugins/video"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

let UDID = 1;

class MouseWheelFacebook {
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

    // query all elements that will turn into MouseWheelFacebookItem later
    this._elements = Array.from($$(SELECTOR, this.el));

    // if there is no elements, skip here
    if( !this._elements || this._elements.length === 0 ) return;

    // set status as initialized
    this._status = STATUS_INITIALIZED;

    // load Facebook SDK
    FacebookSDK.load().then(() => {
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

  _initChildren() {
    // create childs instance
    this.items = this._elements.map(el => new MouseWheelFacebookItem(el, this.emitter));
    this._elements = null;
  }
}

class MouseWheelFacebookItem {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;

    this.udid = `facebook-smooth-scroll--${UDID++}`;
    this.fbVideo = null;

    this._playerStartHandler = null;
    this._playerPauseHandler = null;
    this._playerFinishedHandler = null;

    this._onXFBMLReady = this._onXFBMLReady.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onPlaybackStarted = this._onPlaybackStarted.bind(this);
    this._onPlaybackPaused = this._onPlaybackPaused.bind(this);
    this._onPlaybackFinished = this._onPlaybackFinished.bind(this);

    this.init();
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('facebook-video__wrapper', 'box', 'box-widescreen');

    wrap(this.el, this.wrapper);
    this.emitter.emit('SiteScroll.update');
  }
  destroy() {
    if (this._playerStartHandler) this._playerStartHandler.release('startedPlaying');
    if (this._playerPauseHandler) this._playerPauseHandler.release('paused');
    if (this._playerFinishedHandler) this._playerFinishedHandler.release('finishedPlaying');
    if (this.player) this.player.pause();

    this.el = null;
    this.emitter = null;
    this.player = null;
    this.udid = null;
    this.fbVideo = null;

    this._playerStartHandler = null;
    this._playerPauseHandler = null;
    this._playerFinishedHandler = null;

    this._onXFBMLReady = null;
    this._onClick = null;
    this._onPlaybackStarted = null;
    this._onPlaybackPaused = null;
    this._onPlaybackFinished = null;
  }
  start() {
    this._bindEvents();
  }
  stop() {
    this._unbindEvents();

    if (this.player) {
      //this.player.removeEventListener("onReady", this._onReady);
      //this.player.removeEventListener("onStateChange", this._onStateChange);
    }
  }

  _bindEvents() {
    this.wrapper.classList.add('--enable-smooth-scroll');
    this.wrapper.removeEventListener("click", this._onClick);
    this.wrapper.addEventListener("click", this._onClick);
  }
  _unbindEvents() {
    this.wrapper.removeEventListener("click", this._onClick);
    this.wrapper.classList.remove('--enable-smooth-scroll');
  }
  
  _onXFBMLReady(msg) {
    const { type, id, instance } = msg;

    // if event is related to this element, save video instance and bind listeners
    if (type === 'video' && id === this.udid) {
      FB.Event.unsubscribe('xfbml.ready', this._onXFBMLReady);

      this._playerStartHandler = instance.subscribe('startedPlaying', this._onPlaybackStarted);
      this._playerPauseHandler = instance.subscribe('paused', this._onPlaybackPaused);
      this._playerFinishedHandler = instance.subscribe('finishedPlaying', this._onPlaybackFinished);
      
      this.player = instance;
      this.player.play();
      this.wrapper.removeChild( this.el );
    }
  }
  _onClick(event) {
    if (event) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }

    if( !this.fbVideo ) {
      const src = decodeURIComponent(this.el.src);
      const params = src.split('?').pop().split('&').map(str => str.split('='));
      const href = params.find(param => param[0] === 'href');

      this.fbVideo = document.createElement('div');
      this.fbVideo.id = this.udid;
      this.fbVideo.classList.add('fb-video');
      this.fbVideo.setAttribute('data-href', href[1]);
      this.fbVideo.setAttribute('data-autoplay', true);
      this.fbVideo.setAttribute('data-allowfullscreen', true);
      this.wrapper.appendChild( this.fbVideo );

      FB.Event.subscribe('xfbml.ready', this._onXFBMLReady);
      FB.XFBML.parse(this.wrapper);
    }
    else if( this.player ) this.player.play();
  }
  _onPlaybackStarted() { 
    this._unbindEvents();
  }
  _onPlaybackPaused() { this._bindEvents(); }
  _onPlaybackFinished() { this._bindEvents(); }
}

export default MouseWheelFacebook;
