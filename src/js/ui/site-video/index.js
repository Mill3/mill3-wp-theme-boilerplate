import anime from "animejs";

import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";

class SiteVideo {
  constructor(el, emitter) {
    this.el = null;
    this.emitter = emitter;
    this.bg = $('.site-video__bg', this.el);
    this.container = $('.site-video__container', this.el);
    this.video = $('.site-video__video', this.el);
    this.closeBtn = $('.site-video__close', this.el);

    this._opened = false;
    this._playing = false;

    this._onPlayReady = this._onPlayReady.bind(this);
    this._onStopComplete = this._onStopComplete.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._playBnd = this.play.bind(this);
    this._stopBnd = this.stop.bind(this);

    // bind events from constructor
    this._bindEvents();
  }

  // destroy() {
  //   this._unbindEvents();
  //   this.stop();

  //   this.el = null;
  //   this.emitter = null;
  //   this.bg = null;
  //   this.container = null;
  //   this.video = null;
  //   this.closeBtn = null;

  //   this._opened = false;
  //   this._playing = false;

  //   this._onPlayReady = null;
  //   this._onStopComplete = null;
  //   this._handleKeyDown = null;
  //   this._playBnd = null;
  //   this._stopBnd = null;
  // }

  play(url) {
    // if already opened, replace <video> src and reload playback
    if( this._opened ) {
      this.video.src = url;
      this.video.load();
      this.video.play();

      return;
    }

    this._opened = true;

    // set video src and start loading
    this.video.src = url;
    this.video.load();

    // stop previous animations
    anime.remove(this.bg, this.container, this.closeBtn);

    // animate UI
    anime({
      targets: this.bg,
      opacity: [0, 1],
      duration: 450,
      easing: 'linear',
    });

    anime({
      targets: this.container,
      opacity: [0, 1],
      duration: 450,
      easing: 'linear',
      delay: 350,
    });

    anime({
      targets: this.closeBtn,
      opacity: {
        value: [0, 1],
        duration: 450,
        easing: 'linear'
      },
      scale: [0.6, 1],
      duration: 850,
      easing: 'easeOutCubic',
      delay: 450,
      complete: this._onPlayReady,
    });

    this.el.setAttribute('aria-hidden', false);
  }
  stop() {
    // if not opened, stop here
    if( !this._opened ) return;
    this._opened = false;

    // pause video
    if( this.video && this._playing ) this.video.pause();
    this._playing = false;

    // stop previous animations
    anime.remove(this.bg, this.container, this.closeBtn);

    // animate UI
    anime({
      targets: this.closeBtn,
      opacity: {
        value: 0,
        duration: 250,
        easing: 'linear',
        delay: 200,
      },
      scale: 0.6,
      duration: 450,
      easing: 'easeInQuad',
    });

    anime({
      targets: this.container,
      opacity: 0,
      duration: 350,
      easing: 'linear',
    });

    anime({
      targets: this.bg,
      opacity: 0,
      duration: 350,
      delay: 100,
      easing: 'linear',
      complete: this._onStopComplete,
    });
  }

  _bindEvents() {
    if( this.emitter ) {
      this.emitter.on('SiteVideo.play', this._playBnd);
      this.emitter.on('SiteVideo.stop', this._stopBnd);
    }

    if( this.el ) on(window, "keydown", this._handleKeyDown);
    if( this.closeBtn ) on(this.closeBtn, "click", this._stopBnd);
    if( this.bg ) on(this.bg, "click", this._stopBnd);
  }
  _unbindEvents() {
    if( this.emitter ) {
      this.emitter.off('SiteVideo.play', this._playBnd);
      this.emitter.off('SiteVideo.stop', this._stopBnd);
    }

    if( this.el ) off(window, "keydown", this._handleKeyDown);
    if( this.closeBtn ) off(this.closeBtn, "click", this.stopBnd);
    if( this.bg ) off(this.bg, "click", this._stopBnd);
  }

  _onPlayReady() {
    this.video.play();
    this._playing = true;
  }
  _onStopComplete() {
    this.el.setAttribute('aria-hidden', true);
    if( this.emitter ) this.emitter.emit('SiteVideo.stopped');
  }
  _handleKeyDown(event) {
    if (this._opened === true && (event.key === "Escape" || event.key === "Esc")) {
      this.stop();
    }
  }
}

export default SiteVideo;
