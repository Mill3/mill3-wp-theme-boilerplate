import { isFunction } from "@utils/is";
import { limit } from "@utils/math";
import MouseWheelFrame from "./MouseWheelFrame";

const GA_VIDEO_PROGRESS_STEPS = [0.1, 0.25, 0.5, 0.75]; // track progress event at 10%, 25%, 50% and 75% of playback
const GA_VIDEO_PROGRESS_INTERVAL = 1000; // how often we check for video progression (in milliseconds)

let UDID = 1;

class YoutubePlayer extends MouseWheelFrame {
  constructor(el) {
    super(el);
    
    this.udid = this.el.id ? this.el.id : null;
    this.player = null;

    if( !this.udid ) {
      this.udid = `youtube-player--${UDID++}`;
      this.el.id = this.udid;
    }

    const urlParams = new URLSearchParams(this.el.src);

    this._autoplay = urlParams.get('autoplay') === '1';
    this._currentProgress = 0;
    this._playerReady = false;
    this._playerStatus = null;
    this._startEventTriggered = false;
    this._tick = null;

    this._onReady = this._onReady.bind(this);
    this._onStateChange = this._onStateChange.bind(this);
    this._onProgress = this._onProgress.bind(this);
  }

  destroy() {
    super.destroy();
    
    if (this._tick) clearInterval(this._tick);
    if (this.player) this.player.destroy();

    this.player = null;
    this.udid = null;

    this._autoplay = null;
    this._currentProgress = null;
    this._playerReady = null;
    this._playerStatus = null;
    this._startEventTriggered = null;
    this._tick = null;

    this._onReady = null;
    this._onStateChange = null;
    this._onProgress = null;
  }
  start() {
    if( this._started ) return;
    super.start();

    // autoplay hack
    if( this._autoplay ) {
      this._onClick();
      this._onStateChange({data: YT.PlayerState.PLAYING});
    }
  }
  stop() {
    if( !this._started ) return;
    super.stop();

    if (this.player) {
      this.player.removeEventListener("onReady", this._onReady);
      this.player.removeEventListener("onStateChange", this._onStateChange);
    }

    this._unbindProgress();
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
    if( !window.dataLayer || 
        !window.dataLayer.push || 
        !this.player || 
        !isFunction(this.player.getCurrentTime) ||
        !isFunction(this.player.getDuration) ||
        !isFunction(this.player.getVideoUrl)
      ) return false;

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

    return true;
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
      if( this._trackEvent('start', 0) ) this._startEventTriggered = true;
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
    if( !this.player || !isFunction(this.player.getCurrentTime) || !isFunction(this.player.getDuration) ) return;

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

export default YoutubePlayer;
