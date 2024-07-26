import { $$ } from "@utils/dom";
import { limit } from "@utils/math";
import { mobile } from "@utils/mobile";
import YoutubeAPI from "@utils/youtube-api";

export const SELECTOR = `.wysiwyg iframe[src*="youtube.com"]`;

const STATUS_DESTROYED = 0;
const STATUS_INITIALIZED = 1;
const STATUS_STOPPED = 2;
const STATUS_STARTED = 3;

const GA_VIDEO_PROGRESS_STEPS = [0.1, 0.25, 0.5, 0.75]; // track progress event at 10%, 25%, 50% and 75% of playback
const GA_VIDEO_PROGRESS_INTERVAL = 1000; // how often we check for video progression (in milliseconds)

let UDID = 1;

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
    this._elements = Array.from($$(SELECTOR, this.el));

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
      const item = new MouseWheelYoutubeItem(el);

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
    this.items = this._elements.map(el => new MouseWheelYoutubeItem(el));
    this._elements = null;
  }
}

class MouseWheelYoutubeItem {
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
    this._currentProgress = 0;
    this._playerReady = false;
    this._playerStatus = null;
    this._startEventTriggered = false;
    this._tick = null;

    this._onClick = this._onClick.bind(this);
    this._onReady = this._onReady.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this._onProgress = this._onProgress.bind(this);
  }

  destroy() {
    if (this._tick) clearInterval(this._tick);
    if (this.player) this.player.destroy();

    this.el = null;
    this.parent = null;
    this.player = null;
    this.udid = null;

    this._autoplay = null;
    this._currentProgress = null;
    this._playerReady = null;
    this._playerStatus = null;
    this._startEventTriggered = null;
    this._tick = null;

    this._onClick = null;
    this._onReady = null;
    this._onStateChange = null;
    this._onProgress = null;
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

    this._unbindProgress();
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
  _bindProgress() {
    if( this._tick ) return;

    this._tick = setInterval(this._onProgress, GA_VIDEO_PROGRESS_INTERVAL);
  }
  _unbindProgress() {
    if( !this._tick ) return;

    clearInterval(this._tick);
    this._tick = null;
  }

  /**
   * 
   * @param {string} type : Event type.
   * @param {integer} percent : Playback percentage between 0 and 100.
   * @returns 
   */
  _trackEvent(type, percent = 0) {
    if( !window.dataLayer || !window.dataLayer.push || !this.player ) return;

    window.dataLayer.push({
      'event': `video_${type}`,

      'video_current_time': this.player.getCurrentTime(),
      'video_duration': this.player.getDuration(),
      'video_percent': percent,

      'video_provider': 'youtube',
      'video_title': this.player.videoTitle,
      'video_url': this.player.getVideoUrl(),
      'visible': true,
    });
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

    // if player is playing and "start" event hasn't been triggered before
    if( event.data === YT.PlayerState.PLAYING & !this._startEventTriggered ) {
      this._startEventTriggered = true;
      this._trackEvent('start', 0);
    }
    
    // on pause or ended
    if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
      this._bindEvents();
      this._unbindProgress();
    }
    // on playing
    else if(event.data === YT.PlayerState.PLAYING) {
      this._unbindEvents();
      this._bindProgress();
    }

    // if playback has ended
    if(event.data === YT.PlayerState.ENDED) {
      this._trackEvent('complete', 100);

      this._startEventTriggered = false;
      this._currentProgress = 0;
    }
  }
  _onProgress() {
    // if player don't exist, stop here
    if( !this.player ) return;

    // if current progress step is null OR is outside of steps, stop here
    if( this._currentProgress === null || this._currentProgress >= GA_VIDEO_PROGRESS_STEPS.length ) return;

    // get progression percentage
    const time = this.player.getCurrentTime();
    const duration = this.player.getDuration();
    const progress = limit(0, 1, duration > 0 ? time / duration : 0);

    // if progress hasn't reach active step, stop here
    if( progress < GA_VIDEO_PROGRESS_STEPS[this._currentProgress] ) return;

    // track progress event
    this._trackEvent('progress', GA_VIDEO_PROGRESS_STEPS[this._currentProgress] * 100);

    // go to next progression step
    this._currentProgress++;
  }
}

export default MouseWheelYoutube;
