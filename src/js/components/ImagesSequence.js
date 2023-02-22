/**
 * Images Sequence
 * 
 * Load a bunch of sequential images to create an animation.
 * Animation can be played on a time based interval or by manually changing currentFrame.
 * 
 ***************
 * How to use: *
 ***************
 * This example will create an ImagesSequence of 100 images that will automatically play when loading is completed.
 * 
 * import ImagesSequence from "@components/ImagesSequence";
 * 
 * const instance = new ImagesSequence({
 *  path: "folder/my-file-path__%s.webp",
 *  start: 1,
 *  end: 100,
 *  fps: 30,
 *  loop: true,
 *  canvas: document.getElementById('canvas'),
 * });
 * 
 * instance.once('completed', () => instance.play());
 * instance.load();
 * 
 ***********
 * OPTIONS *
 ***********
 * path (string) : Base filepath to load all images. Must contains %s, that will be replaced by sequential number.
 * digits (integer) : Number of digits in images sequence. Default: 4.
 * start (integer) : Integer of first frame of sequence.
 * end (integer) : Integer of last frame of sequence.
 * fps (integer) : Frame per seconds. Only used during time based playback. Default: 12.
 * loop (boolean) : Loop animation. Only used during time based playback. Default: false.
 * canvas (CanvasElement) : Canvas to draw into. If you omit this option, instance will create one for you.
 * 
 ************************************************************************
 * HOW TO EFFICENTLY CHOOSE IMAGES FILETYPE & SIZE DEPENDING ON BROWSER *
 ************************************************************************
 * Take advantage of <picture> element with image.currentSrc to let the browser choose the most efficient image.
 * 
 * HTML:
 * 
 * <picture>
 *   <source srcset="/folder/0001-mobile.webp" media="(max-width: 768px)" type="image/webp">
 *   <source srcset="/folder/0001.webp" type="image/webp">
 *   <source srcset="/folder/0001-mobile.png" media="(max-width: 768px)">
 *   <source srcset="/folder/0001.png">
 *   <img id="my-image" src="/folder/0001.png">
 * </picture>
 * 
 * JS: 
 * 
 * import ImagesSequence from "@components/ImagesSequence";
 * 
 * const img = document.getElementById('my-image');
 * const instance = new ImagesSequence({
 *  path: img.currentSrc.replace('0001', '%s'),
 * });
 * 
 */
import EventEmitter2 from "eventemitter2";

import { rect } from "@utils/dom";
import ImagesLoaded from "@utils/imagesloaded";
import { requestInterval } from "@utils/interval";
import { isNumber, isString } from "@utils/is";
import Viewport from "@utils/viewport";

const DEFAULT_OPTIONS = {
  path: null,
  digits: 4,
  start: null,
  end: null,
  fps: 12,
  loop: false,
  canvas: null,
};

class ImagesSequence extends EventEmitter2 {
  constructor(options = DEFAULT_OPTIONS) {
    super();
    
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this.canvas = this._options.canvas || document.createElement('canvas');

    if( !this._options.path ) throw new Error('ImagesSequence options.path is required.');
    if( !isString(this._options.path) ) throw new Error('ImagesSequence options.path must be a string.');
    if( !this._options.path.includes('%s') ) throw new Error('ImagesSequence options.path must contains a %s replacements.');
    if( !isNumber(this._options.start) ) throw new Error('ImagesSequence options.start must be a number.');
    if( !isNumber(this._options.end) ) throw new Error('ImagesSequence options.end must be a number.');
    if( this._options.start === this._options.end ) throw new Error('ImagesSequence options.start and options.end must be different.');
    if( this._options.start > this._options.end ) throw new Error('ImagesSequence options.start must be smaller than options.end.');

    this._ctx = this.canvas.getContext('2d');
    this._frames = new Map();
    this._currentFrame = this._options.start;
    this._length = this._options.end - this._options.start;
    this._loader = null;
    this._interval = null;
    this._viewport = {
      width: 0,
      height: 0,
      dpr: Viewport.devicePixelRatio,
    };

    this._onLoadProgress = this._onLoadProgress.bind(this);
    this._onLoadCompleted = this._onLoadCompleted.bind(this);
    this._onInterval = this._onInterval.bind(this);

    this.init();
  }

  init() {
    const { start, end, path } = this._options;

    // populate frames Map
    for(let i = start, n = end; i<=n; i++) {
      const src = path.replace('%s', i.toString().padStart(this._options.digits, '0'));
      const frame = new Frame(i, src);

      this._frames.set(i, frame);
    }
  }
  load() {
    // create an array with all images
    const images = [];
    this._frames.forEach(frame => images.push(frame.img));

    // create images loader
    this._loader = new ImagesLoaded(images);
    this._loader.on('progress', this._onLoadProgress);
    this._loader.on('always', this._onLoadCompleted);

    // start images loading
    this._frames.forEach(frame => frame.load());
  }
  destroy() {
    if( this._interval ) {
      this._interval();
      this._interval = null;
    }

    if( this._loader ) {
      this._loader.off('progress', this._onLoadProgress);
      this._loader.off('always', this._onLoadCompleted);
      this._loader.destroy();
      this._loader = null;
    }

    if( this._frames ) {
      this._frames.forEach(frame => frame.destroy());
      this._frames.clear();
      this._frames = null;
    }

    this.canvas = null;

    this._ctx = null;
    this._currentFrame = null;
    this._length = null;
    this._options = null;
    this._viewport = null;
    
    this._onLoadProgress = null;
    this._onLoadCompleted = null;
    this._onInterval = null;
  }
  resize() {
    // if canvas is in DOM, use his boundingClientsRect, otherwise use Viewport
    const bcr = this.canvas.parentElement ? rect(this.canvas) : Viewport;

    this._viewport.width = bcr.width;
    this._viewport.height = bcr.height;

    // update canvas sizes attributes
    this.canvas.width = this._viewport.width * this._viewport.dpr;
    this.canvas.height = this._viewport.height * this._viewport.dpr;

    // update canvas
    this._update();
  }

  play() {
    if( this._interval ) this._interval();
    this._interval = requestInterval(this._onInterval, 1000 / this._options.fps);
  }
  pause() {
    if( this._interval ) this._interval();
    this._interval = null;
  }


  _update() {
    const frame = this._frames.get(this._currentFrame);

    // if frame is not loaded, stop here
    if( !frame.loaded ) return;

    const { width, height, dpr } = this._viewport;

    this._ctx.clearRect(0, 0, width * dpr, height * dpr);
    this._ctx.drawImage(frame.img, 0, 0, width * dpr, height * dpr);
  }

  _onLoadProgress(loader, img, elem) {
    // find frame related to image loading event
    let frame;
    for(const f of this._frames.values()) {
      if( f.img === elem ){
        frame = f;
        break;
      }
    }

    // update frame's loading status
    if( frame ) frame.loaded = img.isLoaded;

    // emit progress event
    this.emit('progress', this, loader.percentage);

    // draw active frame as soon as possible
    if( frame.id === this._currentFrame ) this._update();
  }
  _onLoadCompleted() {
    this.emit('complete', this);

    this._loader.off('progress', this._onLoadProgress);
    this._loader.off('always', this._onLoadCompleted);
    this._loader.destroy();
    this._loader = null;
  }
  _onInterval() {
    const { start, end, loop } = this._options;

    // if we reached end frame
    if( this._currentFrame === end ) {
      if( loop ) this.currentFrame = start; // loop if enabled
      else this.pause(); // pause if loop is disabled
    } else {
      this.currentFrame = this._currentFrame + 1;
    }
  }



  // getter - setter
  get start() { return this._options.start; }
  get end() { return this._options.end; }
  get fps() { return this._options.fps; }
  get length() { return this._length; }
  get loop() { return this._options.loop; }

  get currentFrame() { return this._currentFrame; }
  set currentFrame(value) {
    if( this._currentFrame === value ) return;
    if( !this._frames.has(value) ) throw new Error(`ImagesSquence frame ${value} does not exists.`);

    this._currentFrame = value;
    this._update();
  }
};


class Frame {
  constructor(id, src) {
    this.id = id;
    this.src = src;
    this.loaded = false;

    this.img = new Image();
  }

  load() { this.img.src = this.src; }
  destroy() {
    this.id = null;
    this.src = null;
    this.loaded = null;
    this.img = null;
  }
}

export default ImagesSequence;
