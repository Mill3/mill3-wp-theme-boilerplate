import EventEmitter from 'eventemitter2';

import { $$ } from './dom';
import { on, off } from './listener';

const DEFAULT_OPTIONS = {
  debug: false,
}

class VideosLoaded extends EventEmitter {
  constructor(el, options = {}, onAlways = null) {
    super();

    this.el = el;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.videos = [...$$('video', this.el)].map(video => new LoadingVideo(video));

    // shift arguments if no options set
    if ( typeof options == 'function' ) {
      onAlways = options;
      this.options = { ...DEFAULT_OPTIONS };
    }

    this.isComplete = false;
    this.hasAnyBroken = false;
    this.progressedCount = 0;

    if ( onAlways ) this.on('always', onAlways);

    // HACK check async to allow time to bind listeners
    setTimeout( this.check.bind( this ) );
  }

  check() {
    const _this = this;

    this.progressedCount = 0;
    this.hasAnyBroken = false;

    if( !this.videos.length ) {
      this.complete();
      return;
    }

    const onProgress = (video, el, message) => {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout(() => {
        _this.progress(video, el, message);
      });
    }

    this.videos.forEach((video) => {
      video.once('progress', onProgress);
      video.check();
    });
  }
  progress(video, el, message) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !video.isLoaded;

    // progress event
    this.emit('progress', this, this.progressedCount / this.videos.length, video, el);

    // check if completed
    if ( this.progressedCount === this.videos.length ) this.complete();

    // debugging
    if ( this.options.debug && console ) console.log('progress: ' + message, video, el);
  }
  complete() {
    const eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;

    this.emit(eventName, this);
    this.emit('always', this);
  }
}

class LoadingVideo extends EventEmitter {
  constructor(el) {
    super();

    this.el = el;
    this.isLoaded = false;

    this._onPlay = this._onPlay.bind(this);
    this._onError = this._onError.bind(this);
  }

  check() {
    // if video has no valid source, skip here
    if( !this.el.currentSrc ) {
      this.confirm(false, 'empty');
      return;
    }

    this._bindEvents();
    this.el.play().finally(this._onPlay); 
  }
  confirm(isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emit('progress', this, this.el, message);
  }

  _bindEvents() {
    on(this.el, 'error', this._onError);
  }
  _unbindEvents() {
    off(this.el, 'error', this._onError);
  }

  _onPlay() {
    this._unbindEvents();

    setTimeout(() => {
      this.el.pause();
      this.confirm(true, 'play');
    });
  }
  _onError() {
    this.confirm(false, 'error');
    this._unbindEvents();
  }
}


const videosLoaded = (el, options, onAlways) => new VideosLoaded(el, options, onAlways);

export default videosLoaded;
