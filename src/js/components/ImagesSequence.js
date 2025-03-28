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
 * instance.once('complete', () => instance.play());
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
import { requestInterval } from "@utils/interval";
import { isNumber, isString } from "@utils/is";
import { on, off } from "@utils/listener";
import Viewport from "@utils/viewport";

export const FIT_COVER = 'cover';
export const FIT_CONTAIN = 'contain';
export const FIT_STRETCH = 'stretch';

const DEFAULT_OPTIONS = {
  path: null,
  digits: 4,
  start: null,
  end: null,
  fps: 12,
  loop: false,
  fit: FIT_STRETCH,
  loading: 4,
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
    if( !isNumber(this._options.loading) ) throw new Error('ImagesSequence options.loading must be a number.');
    if( this._options.start === this._options.end ) throw new Error('ImagesSequence options.start and options.end must be different.');
    if( this._options.start > this._options.end ) throw new Error('ImagesSequence options.start must be smaller than options.end.');
    if( this._options.loading < 1 ) throw new Error('ImagesSequence options.loading must be bigger than 0.');

    this._ctx = this.canvas.getContext('2d');
    this._frames = new Map();
    this._priorities = [];
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
    this._onInterval = this._onInterval.bind(this);

    this.init();
  }

  init() {
    const { start, end, path } = this._options;

    // sort images loading priority, lower get priority (example: 0001 - 0100)
    // - first and last image (0001) should always load first
    // - then middle frame (0050)
    // - then you pick the middle frame of each group until all frames are loaded
    //    - 0050
    //    - 0025, 0075
    //    - 0013, 00
    // - you perform previous operation until you reached end frame with a middle value of 1

    const priorities = [];
          priorities[start] = -100;
          priorities[end] = -100;

    let priority = 1;
    let middle = this._length / 2;
    let index = start;

    while( true ) {
      // jump to next middle child
      index += middle;

      // if child priority doesn't exists, set priority for this child
      if( !priorities[Math.ceil(index)] ) priorities[Math.ceil(index)] = priority;

      // if we reach frames end
      if( index >= end ) {
        // if we reached end with middle value of one, all frames are prioritized
        if( middle === 1 ) break;

        // divise middle child for next round, cannot go under 1
        middle = Math.max(middle / 2, 1);

        // restart index
        index = start;

        // downcrease priority
        priority++;
      }
    }

    // populate frames Map
    for(let i = start, n = end; i<=n; i++) {
      const src = path.replace('%s', i.toString().padStart(this._options.digits, '0'));
      const frame = new Frame(i, src, priorities[i]);
            frame.on('load', this._onLoadProgress);

      this._frames.set(i, frame);
    }
  }
  load() {
    this._frames.forEach(frame => {
      this._priorities.push(frame);
    });

    // sort frames by loading prority and save results for later
    this._priorities.sort((a, b) => a.priority - b.priority);

    // start images loading
    this._loadNext(this._options.loaded);
  }
  destroy() {
    if( this._interval ) {
      this._interval();
      this._interval = null;
    }

    if( this._frames ) {
      this._frames.forEach(frame => {
        frame.off('load', this._onLoadProgress);
        frame.destroy();
      });
      this._frames.clear();
      this._frames = null;
    }

    this.canvas = null;

    this._ctx = null;
    this._currentFrame = null;
    this._priorities = null;
    this._length = null;
    this._options = null;
    this._viewport = null;
    
    this._onLoadProgress = null;
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


  _loadNext(quantity = 1) {
    for( let i = 0; i < quantity; i++ ) {
      if( !this._priorities ) return;

      if( this._priorities.length === 0 ) {
        this._priorities = null;
        this.emit('complete', this);

        return;
      }

      const frame = this._priorities.shift();
            frame.load();
    }
    
  }
  _update() {
    const frame = this._frames.get(this._currentFrame);

    // if frame is not loaded, stop here
    if( !frame.loaded ) return;

    const { width, height, dpr } = this._viewport;
    let sx, sy, x, y, iw = frame.img.width, ih = frame.img.height;

    switch( this._options.fit ) {
      case FIT_COVER:
        sx = sy = Math.max( width * dpr / iw, height * dpr / ih );
        x  = (width * dpr - sx * iw) / 2;
        y  = (height * dpr - sy * ih) / 2;
      break;

      case FIT_CONTAIN: 
        sx = sy = Math.min( width * dpr / iw, height * dpr / ih );
        x  = (width * dpr - sx * iw) / 2;
        y  = (height * dpr - sy * ih) / 2;
      break;

      default:
        sx = width * dpr / frame.img.width;
        sy = height * dpr / frame.img.height;
        x  = 0;
        y  = 0;
      break;
    }

    this._ctx.clearRect(0, 0, width * dpr, height * dpr);
    this._ctx.setTransform(
      /*     scale x */ sx,
      /*      skew x */ 0,
      /*      skew y */ 0,
      /*     scale y */ sy,
      /* translate x */ x,
      /* translate y */ y,
    );
    this._ctx.drawImage(frame.img, 0, 0);
  }

  _onLoadProgress(frame) {
    if( !this._frames ) return;

    // emit progress event
    this.emit('progress', this, (this._frames.size - this._priorities.length) / this._frames.size);

    // draw active frame as soon as possible
    if( frame.id === this._currentFrame ) this._update();

    // load next frame
    this._loadNext();
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


class Frame extends EventEmitter2 {
  constructor(id, src, priority = 0) {
    super();

    this.id = id;
    this.src = src;
    this.priority = priority;
    this.img = new Image();

    this._loaded = false;

    this._onLoad = this._onLoad.bind(this);
    this._onError = this._onError.bind(this);
  }

  load() {
    this._bindEvents();
    this.img.src = this.src;

    //console.log('load', this.id);
  }
  destroy() {
    this._unbindEvents();

    this.id = null;
    this.src = null;
    this.priority = null;
    this.img = null;

    this._loaded = null;

    this._onLoad = null;
    this._onError = null;
  }

  _bindEvents() {
    on(this.img, 'load', this._onLoad);
    on(this.img, 'error', this._onError);
  }
  _unbindEvents() {
    off(this.img, 'load', this._onLoad);
    off(this.img, 'error', this._onError);
  }
  _confirm(loaded) {
    this._loaded = loaded;
    this.emit('load', this);
  }

  _onLoad() {
    this._unbindEvents();
    this._confirm(true);
  }
  _onError() {
    this._unbindEvents();
    this._confirm(false);
  }

  // getter - setter
  get loaded() { return this._loaded; }
}

export default ImagesSequence;
