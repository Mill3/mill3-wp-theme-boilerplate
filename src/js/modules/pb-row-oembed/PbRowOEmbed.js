import { $ } from '@utils/dom';
import { on, off } from '@utils/listener';
import { instance as LocomotiveScrollVimeo } from "@ui/locomotive-scroll-vimeo";
import { instance as LocomotiveScrollYoutube } from "@ui/locomotive-scroll-youtube";
import { SELECTOR as LocomotiveScrollVimeoSelector } from "@ui/locomotive-scroll-vimeo/LocomotiveScrollVimeo";
import { SELECTOR as LocomotiveScrollYoutubeSelector } from "@ui/locomotive-scroll-youtube/LocomotiveScrollYoutube";

class PbRowOEmbed {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.preview = $('.pb-row-oembed__preview', this.el);
    this.videoPreview = $('.pb-row-oembed__videoPreview', this.el);
    this.button = $('.pb-row-oembed__button', this.el);

    this._onButtonClick = this._onButtonClick.bind(this);

    this.init();
  }

  init() {}
  destroy() {
    this.el = null;
    this.emitter = null;
    this.preview = null;
    this.videoPreview = null;
    this.button = null;

    this._onButtonClick = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {
    if( this.button ) on(this.button, 'click', this._onButtonClick);
  }
  _unbindEvents() {
    if( this.button ) off(this.button, 'click', this._onButtonClick);
  }

  _onButtonClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    // unbind events
    this._unbindEvents();

    // get iFrame source
    const src = $('script', this.el).innerHTML;

    // destroy video-preview if exists
    const hasVideoPreview = this.videoPreview ? true : false;
    if( hasVideoPreview ) this.emitter.emit('Video.destroy', this.videoPreview);

    // add iFrame to DOM and remove preview at the same time
    this.preview.parentNode.innerHTML = src;
    this.preview = null;
    this.button = null;
    this.videoPreview = null;

    // force site-scroll update
    if( hasVideoPreview ) this.emitter.emit('SiteScroll.update');

    // try to create a Youtube oEmbed
    const youtube = $(LocomotiveScrollYoutubeSelector, this.el);
    if( youtube ) LocomotiveScrollYoutube.add(youtube);
    else {
      // otherwise, try Vimeo oEmbed
      const vimeo = $(LocomotiveScrollVimeoSelector, this.el);
      if( vimeo ) LocomotiveScrollVimeo.add(vimeo);
    }
  }
}

export default PbRowOEmbed;
