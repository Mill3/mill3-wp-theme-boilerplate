import EventEmitter2 from "eventemitter2";

import { $$ } from "./dom";
import { isArray, isNodeList } from "./is";
import { on, off } from "./listener";


//const IMG_SELECTOR = 'img';
const IMG_SELECTOR = 'img:not([loading="lazy"])';
const ELEMENT_NODE_TYPES = {
  1: true,
  9: true,
  11: true
};


class ImagesLoaded extends EventEmitter2 {
  /**
   * @param {Array, Element, NodeList, String} elem
   * @param {Object or Function} options - if function, use as callback
   * @param {Function} onAlways - callback function
   */
  constructor(elem, onAlways = null) {
    super();

    this.hasAnyBroken = false;
    this.isComplete = false;
    this.images = null;
    this.progressedCount = 0;

    // use elem as selector string
    var queryElem = elem;
    if ( typeof elem == 'string' ) queryElem = [ ...$$( elem ) ];
    
    // bail if bad element
    if ( !queryElem ) {
      console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
      return;
    }

    // make sure this.elements is an array
    this.elements = isArray(queryElem) || isNodeList(queryElem) ? queryElem : [ queryElem ];

    // bind always listener
    if ( onAlways ) this.on('always', onAlways);

    // collect images
    this.getImages();

    // HACK check async to allow time to bind listeners
    setTimeout( this.check.bind( this ) );
  }

  destroy() {
    if( this.images ) this.images.forEach(img => img.destroy());

    this.hasAnyBroken = null;
    this.isComplete = null;
    this.images = null;
    this.progressedCount = null;
    this.elements = null;
  }

  getImages() {
    // clear images
    this.images = [];
  
    // filter & find items if we have an item selector
    this.elements.forEach( this.addElementImages, this );
  }

  addElementImages(el) {
    // filter siblings
    if ( el.nodeName == 'IMG' ) this.addImage(el);
  
    // find children
    // no non-element nodes, #143
    const { nodeType } = el;
    if ( !nodeType || !ELEMENT_NODE_TYPES[ nodeType ] ) return;
    
    // find each image to preload
    [ ...$$(IMG_SELECTOR, el) ].forEach(img => this.addImage(img));
  }

  /**
   * @param {Image} img
   */
  addImage(img) {
    this.images.push( new LoadingImage( img ) );
  }

  check() {
    var _this = this;

    this.progressedCount = 0;
    this.hasAnyBroken = false;

    // complete if no images
    if ( !this.images.length ) {
      this.complete();
      return;
    }
  
    const onProgress = function( image, elem, message ) {
      // HACK - Chrome triggers event before object properties have changed. #83
      setTimeout(() => {
        _this.progress( image, elem, message );
      });
    }
  
    this.images.forEach(loadingImage => {
      loadingImage.once('progress', onProgress);
      loadingImage.check();
    });
  }
  progress(image, elem/*, message*/) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;

    // progress event
    this.emit('progress', this, image, elem);

    // check if completed
    if ( this.progressedCount == this.images.length ) this.complete();
  }
  complete() {
    this.isComplete = true;

    this.emit(this.hasAnyBroken ? 'fail' : 'done', this);
    this.emit('always', this);
  }
}



class LoadingImage extends EventEmitter2 {
  constructor(img) {
    super();

    this.img = img;
    this.isLoaded = false;

    this._onLoad = this._onLoad.bind(this);
    this._onError = this._onError.bind(this);
  }

  destroy() {
    this._unbindEvents();

    this.img = null;
    this.proxyImage = null;
    this.isLoaded = null;

    this._onLoad = null;
    this._onError = null;
  }
  check() {
    // If complete is true and browser supports natural sizes, try to check for image status manually.
    var isComplete = this.getIsImageComplete();
    if ( isComplete ) {
      // report based on naturalWidth
      this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
      return;
    }
  
    // If none of the checks above matched, simulate loading on detached element.
    this.proxyImage = new Image();

    this._bindEvents();

    this.proxyImage.src = this.img.currentSrc;
  }
  getIsImageComplete() {
    // check for non-zero, non-undefined naturalWidth
    return this.img.complete && this.img.naturalWidth;
  }
  confirm(isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emit('progress', this, this.img, message);
  }

  _bindEvents() {
    if( this.proxyImage ) {
      on(this.proxyImage, 'load', this._onLoad);
      on(this.proxyImage, 'error', this._onError);
    }    

    // bind to image as well for Firefox
    if( this.img ) {
      on(this.img, 'load', this._onLoad);
      on(this.img, 'error', this._onError);
    }
  }
  _unbindEvents() {
    if( this.proxyImage ) {
      off(this.proxyImage, 'load', this._onLoad);
      off(this.proxyImage, 'error', this._onError);
    }

    if( this.img ) {
      off(this.img, 'load', this._onLoad);
      off(this.img, 'error', this._onError);
    }
  }
  
  _onLoad() {
    this._unbindEvents();
    this.confirm(true, 'onload');
  }
  _onError() {
    this._unbindEvents();
    this.confirm(false, 'onerror');
  }
}

export default ImagesLoaded;
