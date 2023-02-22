import ImagesSequence from "@components/ImagesSequence";
import { $ } from "@utils/dom";
import ResizeOrientation from "@utils/resize";

class MILL3ImagesSequenceDemo {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.canvas = $('canvas', this.el);
    this.img = $('img', this.el);
    
    this.imagesSequence = new ImagesSequence({
      path: this.img.currentSrc.replace('0001', '%s'),
      digits: 4,
      start: 1,
      end: 150,
      fps: 30,
      loop: true,
      canvas: this.canvas,
    });

    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  init() {
    //this.imagesSequence.once('complete', obj => obj.play());
    this.imagesSequence.load();
    this.imagesSequence.resize();

    this._bindEvents();
  }
  destroy() {
    this._unbindEvents();

    if( this.imagesSequence ) this.imagesSequence.destroy();

    this.el = null;
    this.emitter = null;
    this.canvas = null;
    this.img = null;
    this.imagesSequence = null;
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize);
    this.emitter.on('SiteScroll.scroll', this._onScroll);
  }
  _unbindEvents() {
    ResizeOrientation.remove(this._onResize);
    this.emitter.off('SiteScroll.scroll', this._onScroll);
  }

  _onResize() { this.imagesSequence.resize(); }
  _onScroll({ progress }) {
    const frame = Math.round(this.imagesSequence.start + this.imagesSequence.length * progress);
    this.imagesSequence.currentFrame = frame;
  }
}

export default MILL3ImagesSequenceDemo;
