import ImagesSequence, { FIT_COVER } from "@components/ImagesSequence";
import { INVIEW_ENTER } from "@scroll/constants";
import { $, rect } from "@utils/dom";
import { limit } from "@utils/math";
import RAF from "@utils/raf";
import ResizeOrientation, { BEFORE_SCROLL_UPDATE } from "@utils/resize";
import Viewport from "@utils/viewport";

const DEFAULT_OPTIONS = {
  skipFrames: false,
};

class ScrollingImagesSequence {
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
      fit: FIT_COVER,
      canvas: this.canvas,
    });

    let options = {};
    
    // parse dataset as JSON
    if( el.hasAttribute('data-scrolling-images-sequence') && el.dataset.scrollingImagesSequence) {
      options = JSON.parse(el.dataset.scrollingImagesSequence);
    }
    
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._inView = false;
    this._raf = null;
    this._rect = { top: 0, bottom: 0 };
    this._targetFrame = this.imagesSequence.start;

    this._onResize = this._onResize.bind(this);
    this._onScrollCall = this._onScrollCall.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onRAF = this._onRAF.bind(this);
  }

  init() {
    // remove image from DOM since it's not necessary anymore
    this.img.remove();
    this.img = null;

    this._onResize();
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

    this._options = null;
    this._inView = null;
    this._raf = null;
    this._rect = null;
    this._targetFrame = null;

    this._onResize = null;
    this._onScrollCall = null;
    this._onScroll = null;
    this._onRAF = null;
  }
  start() {
    //this.imagesSequence.once('complete', () => console.log('ready'));
    //this.imagesSequence.on('progress', (e, progress) => { console.log(progress); });
    this.imagesSequence.load();
    //this.imagesSequence.resize();
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize, BEFORE_SCROLL_UPDATE);
    this._raf = RAF.add(this._onRAF);

    this.emitter.on('SiteScroll.scrolling-images-sequence', this._onScrollCall);
    this.emitter.on('SiteScroll.scroll', this._onScroll);
  }
  _unbindEvents() {
    ResizeOrientation.remove(this._onResize);
    RAF.remove(this._onRAF);

    this.emitter.off('SiteScroll.scrolling-images-sequence', this._onScrollCall);
    this.emitter.off('SiteScroll.scroll', this._onScroll);
  }

  _onResize() {
    const { top, height } = rect(this.el);

    this._rect.top = top + window.scrollY;
    this._rect.bottom = Math.min(Infinity, top + height);

    this.imagesSequence.resize();
  }
  _onScrollCall(direction, obj) {
    if( obj.el !== this.el ) return;

    this._inView = direction === INVIEW_ENTER;

    // if we accept to skip frames when scrolling very fast, stop here
    if( this._options.skipFrames ) return;

    // toggle RAF
    if( this._inView ) {
      if( this._raf ) this._raf(true);
    } else {
      if( this._raf ) this._raf(false);
    }
  }
  _onScroll({ y }) {
    if( !this._inView ) return;

    const { top, bottom } = this._intersections;
    const { start, length } = this.imagesSequence;

    const height = Math.min(bottom, Viewport.height + bottom - top);
    const distance = limit(0, height, bottom - y);
    const progress = 1 - distance / height;

    this._targetFrame = Math.round(start + length * progress);
    if( this._options.skipFrames ) this.imagesSequence.currentFrame = this._targetFrame;
  }
  _onRAF() {
    // if currentFrame is not equal to targetFrame, update currentFrame
    const { currentFrame } = this.imagesSequence;
    if( currentFrame !== this._targetFrame ) this.imagesSequence.currentFrame = currentFrame + (currentFrame < this._targetFrame ? 1 : -1);
  }
}

export default ScrollingImagesSequence;
