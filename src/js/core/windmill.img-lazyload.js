/**
* @core/windmill.img-lazyload
* <br><br>
* ## Windmill Images Lazyloading.
*
* - Run IntersectionObserver that remove [loading=lazy] on images that are soon to be in viewport.
* - You can specify a custom IO.root using [data-lazyload-clip=".my-css-selector"]
* - You can specify a custom IO target using [data-lazyload-target=".my-css-selector"]
*
* @module windmill
* @preferred
*/

import { $, $$, rect } from "@utils/dom";
import { mobile } from "@utils/mobile";
import Viewport from "@utils/viewport";

const CLIP_ATTRIBUTE = "data-lazyload-clip";
const TARGET_ATTRIBUTE = "data-lazyload-target";

const SELECTOR = "img[loading=lazy]:not([data-lazyload-ignore])";
const ROOT_MARGIN = "0px 0px 100%";
const CLIP_MARGIN = "500px 0px 0px";

export class WindmillImgLazyload {  

  constructor() {
    this._rootIO = null;
    this._ios = null;
    this._targets = null;
    this._images = null;
    this._windmill = null;

    this._onIO = this._onIO.bind(this);
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    this._windmill = windmill;
    this._rootIO = new IntersectionObserver(this._onIO, { rootMargin: ROOT_MARGIN });
    this._ios = new Map();
    this._targets = new Map();
    this._images = [];

    windmill.on('init', this._onInit, this);
    windmill.on('added', this._onInit, this);
    windmill.on('exiting', this._onExiting, this);
    windmill.on('done', this._onDone, this);
  }

  _onInit(data) {
    // get query selector target
    const container = data.next.container || data.current.container;
    const scrollY = data.next.scrollY || 0;

    // query images and filter the one who are in viewport
    const images = [ ...$$(SELECTOR, container) ].filter(img => {
      const target = (img.hasAttribute(TARGET_ATTRIBUTE) ? $(img.getAttribute(TARGET_ATTRIBUTE), container) : img) || img;
      const offset = this._getOffset(img);
      const offsetTop = offset ? offset[0] : 0;
      const offsetBottom = offset && offset.length > 1 ? offset[1] : 0;
      const { top, bottom, left, right } = rect(target);

      return top - scrollY + offsetTop < Viewport.height && bottom - scrollY - offsetBottom > 0 && left < Viewport.width && right > 0;
    });

    if( !images || images.length < 1 ) return;

    // output debug informations
    if( this._windmill.debug ) console.log(`force load ${images.length} lazyloading images`);

    // remove loading attribute of all images who are visible in viewport
    // they will be load during Windmill's next step
    images.forEach(img => img.removeAttribute('loading'));
  }
  _onExiting() {
    // clear all customs IntersectionObserver & clear array
    this._ios.forEach(io => io.disconnect());
    this._ios.clear();

    // clear all custom targets
    this._targets.clear();

    // unobserve all images from root IO & empty array
    this._images.forEach(img => this._rootIO.unobserve(img));
    this._images.length = 0;
  }
  _onDone(data) {
    // get query selector target
    const container = data.next.container || data.current.container;

    // query images
    const images = $$(SELECTOR, container);
    if( !images || images.length < 1 ) return;

    // observe each images to an IntersectionObserver
    images.forEach(img => {
      // default IO
      let io = this._rootIO;
      let target = null;

      // find image's custom IO's root
      if( img.hasAttribute(CLIP_ATTRIBUTE) ) {
        // find image's root element
        const clip = $(img.getAttribute(CLIP_ATTRIBUTE), container);
        if( clip ) {
          // if this custom IO already exists, use it
          // otherwise, create a new IO
          if( this._ios.has(clip) ) io = this._ios.get(clip);
          else {
            io = new IntersectionObserver(this._onIO, { root: clip, rootMargin: CLIP_MARGIN });
            this._ios.set(clip, io);
          }
        }
      }

      // find image's custom target
      if( img.hasAttribute(TARGET_ATTRIBUTE) ) {
        // find image's target element
        target = $(img.getAttribute(TARGET_ATTRIBUTE), container);
      }

      // set target to image if not specified by custom attribute
      if( !target ) target = img;

      // save custom target if exists
      if( target !== img ) {
        // add img to target's stack
        const imgs = this._targets.has(target) ? this._targets.get(target) : [];
              imgs.push(img);

        this._targets.set(target, imgs);
      }
      
      // observe image
      io.observe(target);

      // add images to array if using default IO
      if( io === this._rootIO ) this._images.push(target);
    });
  }
  _onIO(entries, observer) {
    entries.forEach(entry => {
      const { isIntersecting, target } = entry;
      if( !isIntersecting ) return;

      observer.unobserve(target);

      // if target is a custom reference
      if( this._targets.has(target) ) {
        const imgs = this._targets.get(target);
        imgs.forEach(img => img.removeAttribute('loading'));

        this._targets.delete(target);
      }
      
      // if target is an image, remove lazyload to start loading immediately
      if( target.tagName.toLowerCase() === 'img' ) target.removeAttribute('loading');
    });
  }


  _getOffset(img) {
    // if image doesn't have [data-lazyload-offset] attribute, return null
    if( !img.hasAttribute('data-lazyload-offset') ) return null;
  
    // get value from [data-lazyload-offset] attribute or [data-lazyload-offset-native] and split into array
    const offset = (mobile && img.hasAttribute('data-lazyload-offset-native') ? img.dataset.lazyloadOffsetNative : img.dataset.lazyloadOffset ).split(',');
  
    // if offset is empty after splitting, return null
    if( !offset ) return null;
  
    // loop through each values in offset to transform into readable values
    offset.forEach((value, index) => {
      // if offset is not a string, continue to next value
      if( typeof value != 'string' ) return;
  
      // if value is in percentage, convert to pixels from vh
      if( value.includes('%') ) offset[index] = parseInt( (value.replace('%', '') * Viewport.height) / 100 );
      // otherwise, parse as integer
      else offset[index] = parseInt(value);
    });
    
    return offset;
  }
}

export default WindmillImgLazyload;
