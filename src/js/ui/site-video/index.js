import { $, removeAllChilds } from "@utils/dom";
import { on, off } from "@utils/listener";
import { motion_reduced } from "@utils/mobile";

const ANIMATE_IN_CLASSNAME = '--js-animate-in';
const ANIMATE_OUT_CLASSNAME = '--js-animate-out';
const ATTRIBUTE_URL = "data-site-video-url";
const ATTRIBUTE_OEMBED = "data-site-video-oembed";
const MODE_INLINE = "inline";
const MODE_OEMBED = "oembed";

class SiteVideo {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.bg = $('.site-video__bg', this.el);
    this.container = $('.site-video__container', this.el);
    this.videoWrap = $('.site-video__videoWrap', this.el);
    this.video = $('.site-video__video', this.el);
    this.closeBtn = $('.site-video__close', this.el);

    this._mode = MODE_INLINE;
    this._opened = false;
    this._playing = false;
    this._elements = null;

    this._onPlayReady = this._onPlayReady.bind(this);
    this._onStopComplete = this._onStopComplete.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleElementClick = this._handleElementClick.bind(this);
    this._playBnd = this.play.bind(this);
    this._closeBnd = this.close.bind(this);
    this._oembedBnd = this.oembed.bind(this);

    this._bindEvents();
  }

  init() {
    this._elements = $$(`[${ATTRIBUTE_URL}], [${ATTRIBUTE_OEMBED}]`);
    if( this._elements ) on(this._elements, 'click', this._handleElementClick);
  }
  stop() {
    if( this._elements ) off(this._elements, 'click', this._handleElementClick);
    this._elements = null;

    this.close();
  }

  play(url) {
    // if already opened, replace <video> src and reload playback
    if( this._opened && this._mode === MODE_INLINE ) {
      this.video.src = url;
      this.video.load();
      this.video.play();

      return;
    }
    
    // if not in "inline" mode, remove all DOM elements from wrapper and append <video>
    if( this._mode !== MODE_INLINE ) {
      removeAllChilds( this.videoWrap );
      this.videoWrap.appendChild( this.video );
    }

    this._mode = MODE_INLINE;
    this._opened = true;

    // stop scrolling & pause all videos
    this.emitter.emit('SiteScroll.stop', true);
    this.emitter.emit('Video.pauseAll');

    // make sure ANIMATE_OUT is removed
    this.el.classList.remove(ANIMATE_OUT_CLASSNAME);

    // remove display: none; from modal
    this.el.setAttribute('aria-hidden', false);

    // set video src and start loading
    this.video.src = url;
    this.video.load();
    this._playing = true;

    // wait for next frame to start animation (required because display: none; was previously applied)
    requestAnimationFrame(() => this.el.classList.add(ANIMATE_IN_CLASSNAME));
  }
  close() {
    // if not opened, stop here
    if( !this._opened ) return;
    this._opened = false;

    // pause video
    if( this.video && this._playing ) this.video.pause();
    this._playing = false;

    // resume all videos
    this.emitter.emit('Video.resumeAll');

    // trigger this._onStopComplete when background animate-out is completed
    this.el.classList.add(ANIMATE_OUT_CLASSNAME);

    if( motion_reduced ) this._onStopComplete({ target: this.bg, propertyName: 'opacity' });
  }
  oembed(script) {
    // remove video from DOM
    if( this._mode === MODE_INLINE ) this.video.remove();

    this._mode = MODE_OEMBED;
    this._opened = true;

    // stop scrolling & pause all videos
    this.emitter.emit('SiteScroll.stop', true);
    this.emitter.emit('Video.pauseAll');

    // inject iframe into DOM
    this.videoWrap.innerHTML = script.innerHTML;

    // make sure ANIMATE_OUT is removed
    this.el.classList.remove(ANIMATE_OUT_CLASSNAME);

    // remove display: none; from modal
    this.el.setAttribute('aria-hidden', false);

    // wait for next frame to start animation (required because display: none; was previously applied)
    requestAnimationFrame(() => this.el.classList.add(ANIMATE_IN_CLASSNAME));
  }

  _bindEvents() {
    if( this.emitter ) {
      this.emitter.on('SiteVideo.play', this._playBnd);
      this.emitter.on('SiteVideo.stop', this._closeBnd);
      this.emitter.on('SiteVideo.oembed', this._oembedBnd);
    }

    if( this.el ) on(window, "keydown", this._handleKeyDown);
    if( this.closeBtn ) {
      on(this.closeBtn, "click", this._closeBnd);
      on(this.closeBtn, "transitionend", this._onPlayReady);
    }
    if( this.bg ) {
      on(this.bg, "click", this._closeBnd);
      on(this.bg, "transitionend", this._onStopComplete);
    }
  }
  _unbindEvents() {
    if( this.emitter ) {
      this.emitter.off('SiteVideo.play', this._playBnd);
      this.emitter.off('SiteVideo.stop', this._closeBnd);
      this.emitter.off('SiteVideo.oembed', this._oembedBnd);
    }

    if( this.el ) off(window, "keydown", this._handleKeyDown);
    if( this.closeBtn ) {
      off(this.closeBtn, "click", this._closeBnd);
      off(this.closeBtn, "transitionend", this._onPlayReady);
    }
    if( this.bg ) {
      off(this.bg, "click", this._closeBnd);
      off(this.bg, "transitionend", this._onStopComplete);
    }
  }

  _onPlayReady(event) {
    // stop here if event is not triggered by closeBtn's scale animate-in transition
    if( event.target !== this.closeBtn || event.propertyName !== 'transform' || !this._opened ) return;

    if( this._mode === MODE_INLINE ) {
      this.video.play();
      this._playing = true;
    }
  }
  _onStopComplete(event) {
    // stop here if event is not triggered by background's animate-out transition
    if( event.target !== this.bg || event.propertyName !== 'opacity' || this._opened ) return;
    
    this.el.setAttribute('aria-hidden', true);
    this.el.classList.remove(ANIMATE_IN_CLASSNAME, ANIMATE_OUT_CLASSNAME);

    // remove iframe if necessary
    if( this._mode === MODE_OEMBED ) removeAllChilds( this.videoWrap );

    this._mode = null;
    this._playing = false;

    if( this.emitter ) {
      this.emitter.emit('SiteVideo.stopped');
      this.emitter.emit('SiteScroll.start');
    }
  }
  _handleKeyDown(event) {
    if (this._opened === true && (event.key === "Escape" || event.key === "Esc")) {
      this.close();
    }
  }
  _handleElementClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const el = event.currentTarget;
    const url = el.getAttribute(ATTRIBUTE_URL);
    const oembed = el.getAttribute(ATTRIBUTE_OEMBED);
    
    // if clicked element doesn't have URL or oEmbed attribute, stop here
    if( !url && !oembed ) return;

    if( url ) this.play(url);
    else if( oembed ) this.oembed( $(oembed) );
  }
}

export default SiteVideo;
