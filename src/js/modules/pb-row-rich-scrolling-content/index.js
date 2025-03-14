//import RiveAnimation from "@components/RiveAnimation";
import Video from "@components/Video";
import { INVIEW_ENTER } from "@scroll/constants";
import { $, $$ } from "@utils/dom";
import Viewport from "@utils/viewport";


const CONTENT_ACTIVE_CLASSNAME = '--js-active';

class PbRowRichScrollingContent {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.header = $('.pb-row-rich-scrolling-content__header', this.el);
    this.contents = [ ...$$('.pb-row-rich-scrolling-content__content', this.el) ];
    this.medias = [ ...$$('.pb-row-rich-scrolling-content__media', this.el) ].map(media => new PbRowRichScrollingContentMedia(media));

    this._activeMedia = this.medias ? this.medias[0] : null;

    this._onModule = this._onModule.bind(this);
    this._onContent = this._onContent.bind(this);
    this._onMedia = this._onMedia.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this.medias ) this.medias.forEach(media => media.destroy());

    this.el = null;
    this.emitter = null;
    this.header = null;
    this.contents = null;
    this.medias = null;

    this._activeMedia = null;

    this._onModule = null;
    this._onContent = null;
    this._onMedia = null;
  }

  _bindEvents() {
    this.emitter.on('SiteScroll.pb-row-rich-scrolling-content', this._onModule);
    this.emitter.on('SiteScroll.pb-row-rich-scrolling-content__content', this._onContent);
    this.emitter.on('SiteScroll.pb-row-rich-scrolling-content__media', this._onMedia);
  }
  _unbindEvents() {
    this.emitter.off('SiteScroll.pb-row-rich-scrolling-content', this._onModule);
    this.emitter.off('SiteScroll.pb-row-rich-scrolling-content__content', this._onContent);
    this.emitter.off('SiteScroll.pb-row-rich-scrolling-content__media', this._onMedia);
  }

  _onModule(direction, obj) {
    // do nothing for viewports smaller than 1200px OR if the event is not triggered by this module
    if( Viewport.width < 1200 || obj.el !== this.el ) return;

    // if module is entering viewport, play first media
    // if module is exiting viewport, pause all medias
    if( direction === INVIEW_ENTER ) {
      if( this._activeMedia ) this._activeMedia.play();
    }
    else this.medias.forEach(media => media.pause());
  }
  _onContent(direction, obj) {
    // do nothing when content is in-view on viewports smaller than 1200px
    if( Viewport.width < 1200 ) return;

    const index = this.contents.findIndex(content => content === obj.el);
    if( index < 0 ) return;

    if( this.medias ) {
      // toggle medias playback based on content in-view status
      this.medias.forEach((media, i) => media[i === index ? 'play' : 'pause']());

      // save playing media
      this._activeMedia = this.medias[index];
    }

    // event is triggered by content going in-view
    // activate current content and deactivate others
    // also activate header if it exists and index is 0
    if( direction === INVIEW_ENTER ) {
      this.contents.forEach((content, i) => content.classList[i === index ? 'add' : 'remove'](CONTENT_ACTIVE_CLASSNAME));
      if( this.header ) this.header.classList[index === 0 ? 'add' : 'remove'](CONTENT_ACTIVE_CLASSNAME);
    }
  }
  _onMedia(direction, obj) {
    // do nothing for large screens
    if( Viewport.width >= 1200 ) return;

    const currentMedia = this.medias.find(media => media.target === obj.el);
    if( !currentMedia ) return;

    // toggle playback from media in-view status
    currentMedia[direction === INVIEW_ENTER ? 'play' : 'pause']();
  }
}

class PbRowRichScrollingContentMedia {
  constructor(el) {
    this.el = el;
    //this.animation = $('.pb-row-rich-scrolling-content__media__animation', this.el);
    this.video = $('.pb-row-rich-scrolling-content__media__video', this.el);

    this._playing = false;
    this._target = null;

    this.init();
  }

  init() {
    if( this.animation ) {
      this._target = this.animation;
      this.animation = new RiveAnimation(this.animation);
    }

    if( this.video ) {
      this._target = this.video;
      this.video = new Video(this.video);
    }
  }
  destroy() {
    if( this.animation ) this.animation.destroy();
    if( this.video ) this.video.destroy();

    this.el = null;
    this.animation = null;
    this.video = null;

    this._playing = null;
    this._target = null;
  }

  play() {
    if( this._playing ) return;
    this._playing = true;

    if( this.animation ) this.animation.play();
    if( this.video ) this.video.play();

    this.el.classList.add('--js-active');
  }
  pause() {
    if( !this._playing ) return;
    this._playing = false;

    if( this.animation ) this.animation.pause();
    if( this.video ) this.video.pause();

    this.el.classList.remove('--js-active');
  }

  // getter - setter
  get target() { return this._target; }
}

export default PbRowRichScrollingContent;
