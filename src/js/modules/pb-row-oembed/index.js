import { $ } from "@utils/dom";
import { on, off } from "@utils/listener";

class PbRowOEmbed {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.wrapper = $('.pb-row-oembed__wrapper', this.el);
    this.preview = $('.pb-row-oembed__preview', this.el);
    this.videoPreview = $('.pb-row-oembed__videoPreview', this.el);
    this.script = $('script', this.el);

    this._onClick = this._onClick.bind(this);
  }

  init() {
    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    this.el = null;
    this.emitter = null;
    this.wrapper = null;
    this.preview = null;
    this.script = null;

    this._onClick = null;
  }

  _bindEvents() {
    if( this.preview ) on(this.preview, 'click', this._onClick);
  }
  _unbindEvents() {
    if( this.preview ) off(this.preview, 'click', this._onClick);
  }

  _onClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    this._unbindEvents();

    if( this.videoPreview ) this.emitter.emit('Video.destroy', this.videoPreview);

    this.preview = null;
    this.videoPreview = null;
    this.wrapper.innerHTML = this.script.innerHTML;

    this.emitter.emit('SiteScroll.update');
    this.emitter.emit('oEmbed.add', $('iframe', this.wrapper));
  }
}

export default PbRowOEmbed;
