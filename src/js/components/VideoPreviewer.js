import EventEmitter2 from "eventemitter2";

import Video from '@components/Video';
import { $, $$ } from '@utils/dom';
import { on, off } from '@utils/listener';

const PLAYING_CLASSNAME = '--js-playing';
const UNMUTED_CLASSNAME = '--js-unmuted';

class VideoPreviewer extends EventEmitter2 {
  constructor(el) {
    super();

    this.el = el;
    this.img = $('.video-previewer__img', this.el);
    this.loop = $('.video-previewer__loop', this.el);
    this.video = $('.video-previewer__video', this.el);
    this.audio = $('.video-previewer__audio', this.el);
    this.controls = $$(`[aria-controls="${this.el.id}"]`);


    this._inView = false;
    this._previewing = true;

    this._onControlsClick = this._onControlsClick.bind(this);
    this._onAudioClick = this._onAudioClick.bind(this);
    this._onClick = this._onClick.bind(this);

    this.init();
  }

  init() {
    if( this.loop ) this.loop = new Video(this.loop);
    if( this.video ) this.video = new Video(this.video);

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this.loop ) this.loop.destroy();
    if( this.video ) this.video.destroy();

    this.el = null;
    this.img = null;
    this.loop = null;
    this.video = null;
    this.audio = null;
    this.controls = null;

    this._inView = null;
    this._previewing = null;

    this._onControlsClick = null;
    this._onAudioClick = null;
    this._onClick = null;
  }

  play(silent = false) {
    // if we are not in preview mode OR video don't exists,, do nothing
    if( !this._previewing || !this.video ) return;

    this._previewing = false;

    // add special classnames on module
    this.el.classList.add(PLAYING_CLASSNAME, UNMUTED_CLASSNAME);

    // show video
    if( this.video ) this.video.el.setAttribute('aria-hidden', false);

    // hide image
    if( this.img ) this.img.setAttribute('aria-hidden', true);

    // pause & hide video loop
    if( this.loop ) {
      this.loop.pause();
      this.loop.el.setAttribute('aria-hidden', true);
    }

    // update aria-expanded attribute on all controls
    if( this.controls ) this.controls.forEach(control => control.setAttribute('aria-expanded', true));

    // update aria-hidden attribute on audio
    if( this.audio) this.audio.setAttribute('aria-hidden', false);

    // start video
    if( this.video ) {
      this.video.play(true);
      this.video.el.muted = false;
    }

    // emit event
    if( !silent ) this.emit('play', this);
  }
  stop(silent = false, playLoop = true) {
    // if we are in preview mode OR video don't exists, do nothing
    if( this._previewing || !this.video ) return;
    this._previewing = true;

    // pause video
    if( this.video ) this.video.pause();

    // update aria-expanded attribute on all controls
    if( this.controls ) this.controls.forEach(control => control.setAttribute('aria-expanded', false));
    
    // update aria-hidden attribute on audio if we switch back to video loop
    if( this.audio && !this.loop ) this.audio.setAttribute('aria-hidden', true);

    // show video loop AND image
    if( this.loop ) this.loop.el.setAttribute('aria-hidden', false);
    if( this.img ) this.img.setAttribute('aria-hidden', false);

    // hide video
    if( this.video ) this.video.el.setAttribute('aria-hidden', true);

    // remove special classnames on module
    this.el.classList.remove(PLAYING_CLASSNAME, UNMUTED_CLASSNAME);

    // start video loop
    if( this.loop && playLoop ) this.loop.play();

    // emit event
    if( !silent ) this.emit('stop', this);
  }

  _bindEvents() {
    if( this.controls ) on(this.controls, 'click', this._onControlsClick);
    if( this.audio ) on(this.audio, 'click', this._onAudioClick);
    if( this.el ) on(this.el, 'click', this._onClick);
  }
  _unbindEvents() {
    if( this.controls ) off(this.controls, 'click', this._onControlsClick);
    if( this.audio ) off(this.audio, 'click', this._onAudioClick);
    if( this.el ) off(this.el, 'click', this._onClick);
  }

  _onControlsClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // toggle playback
    if( this._previewing ) this.play();
    else this.stop();

    return false;
  }
  _onAudioClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // if still previewing, play video
    if( this._previewing ) this.play();
    else {
      // toggle audio
      this.el.classList.toggle(UNMUTED_CLASSNAME);
      if( this.video ) this.video.el.muted = !this.video.el.muted;
    }

    return false;
  }
  _onClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // toggle playback
    if( this._previewing ) this.play();
    else this.stop();
  }


  // getter - setter
  get inView() { return this._inView; }
  set inView(value) {
    // if value is the same, do nothing
    if( this._inView === value ) return;

    // save in-view status
    this._inView = value;

    if( this._inView ) {
      // start video loop if exists
      if( this.loop ) this.loop.play(true);
    } else {
      // if in preview mode
      if( this._previewing ) {
        // pause video loop
        if( this.loop ) this.loop.pause();
      } else {
        // stop video loop & do not start video loop because we are out of view
        this.stop(false, false);
      }
    }
  }
}

export default VideoPreviewer;
