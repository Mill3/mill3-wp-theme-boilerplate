/**
* @core/windmill.rive
* <br><br>
* ## Windmill Rive Integration.
*
* Preload Rive WASM runtime before everything else.
*
* @module windmill
* @preferred
*/

//import { RuntimeLoader } from "@rive-app/canvas-lite";
//import { RuntimeLoader } from "@rive-app/canvas";
import { RuntimeLoader } from "@rive-app/webgl2";

import { $, $$, rect } from "@utils/dom";
import { mobile } from "@utils/mobile";
import { getRiveWASMLink } from "@utils/rive";
import Viewport from "@utils/viewport";

const TARGET_ATTRIBUTE = "data-lazyload-target";

const SELECTOR = "canvas.rive-animation[data-lazyload]:not([data-lazyload-ignore])";
const ROOT_MARGIN = "0px 0px 100%";

export class WindmillRive {  
  constructor() {
    this._rootIO = null;
    this._targets = null;
    this._animations = null;
    this._windmill = null;

    this._onIO = this._onIO.bind(this);
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    this._windmill = windmill;
    this._rootIO = new IntersectionObserver(this._onIO, { rootMargin: ROOT_MARGIN });
    this._targets = new Map();
    this._animations = [];

    windmill.on('init', this._onInit, this);
    windmill.on('added', this._onAdded, this);
    windmill.on('exiting', this._onExiting, this);
    windmill.on('done', this._onDone, this);
  }

  _onInit(data) {
    // this force Rive to use the rive.wasm resource URL injected in <head> with rive.php file
    const wasmURL = getRiveWASMLink();
    if( wasmURL ) RuntimeLoader.setWasmUrl( wasmURL );

    // remove data-lazyload on animation that are in viewport
    this._preloadInViewportAnimations(data);

    return new Promise(resolve => {
      RuntimeLoader.getInstance(resolve);
    });
  }
  _onAdded(data) {
    // remove data-lazyload on animation that are in viewport
    this._preloadInViewportAnimations(data);
  }
  _onExiting() {
    // clear all custom targets
    this._targets.clear();

    // unobserve all animations from root IO & empty array
    this._animations.forEach(animation => this._rootIO.unobserve(animation));
    this._animations.length = 0;
  }
  _onDone(data) {
    // get query selector target
    const container = data.next.container || data.current.container;

    // query animations
    const animations = $$(SELECTOR, container);
    if( !animations || animations.length < 1 ) return;

    // observe each animations to an IntersectionObserver
    animations.forEach(animation => {
      // default IO
      let io = this._rootIO;
      let target = null;

      // find animation's custom target
      if( animation.hasAttribute(TARGET_ATTRIBUTE) ) {
        // find animation's target element
        target = $(animation.getAttribute(TARGET_ATTRIBUTE), container);
      }

      // set target to animation if not specified by custom attribute
      if( !target ) target = animation;

      // save custom target if exists
      if( target !== animation ) {
        // add animation to target's stack
        const anims = this._targets.has(target) ? this._targets.get(target) : [];
              anims.push(animation);

        this._targets.set(target, anims);
      }

      // observe animation
      io.observe(target);

      // add animations to array
      this._animations.push(target);
    });
  }
  
  _onIO(entries, observer) {
    entries.forEach(entry => {
      const { isIntersecting, target } = entry;
      if( !isIntersecting ) return;

      observer.unobserve(target);

      // if target is a custom reference
      if( this._targets.has(target) ) {
        const anims = this._targets.get(target);
        anims.forEach(animation => animation.removeAttribute('data-lazyload'));

        this._targets.delete(target);
      }
      
      // if target is an animation, remove lazyload to start loading immediately
      if( target.tagName.toLowerCase() === 'canvas' ) target.removeAttribute('data-lazyload');
    });
  }

  _preloadInViewportAnimations(data) {
    // get query selector target
    const container = data.next.container || data.current.container;
    const scrollY = data.next.scrollY || 0;

    // query animations and filter the one who are in viewport
    const animations = [ ...$$(SELECTOR, container) ].filter(animation => {
      const target = (animation.hasAttribute(TARGET_ATTRIBUTE) ? $(animation.getAttribute(TARGET_ATTRIBUTE), container) : animation) || animation;
      const offset = this._getOffset(animation);
      const offsetTop = offset ? offset[0] : 0;
      const offsetBottom = offset && offset.length > 1 ? offset[1] : 0;
      const { top, bottom, left, right } = rect(target);

      return top - scrollY + offsetTop < Viewport.height && bottom - scrollY - offsetBottom > 0 && left < Viewport.width && right > 0;
    });

    if( !animations || animations.length < 1 ) return;

    // output debug informations
    if( this._windmill.debug ) console.log(`force load ${animations.length} lazyloading animations`);

    // remove loading attribute of all animations who are visible in viewport
    // they will be load during Windmill's next step
    animations.forEach(animation => animation.removeAttribute('data-lazyload'));
  }
  _getOffset(animation) {
    // if animation doesn't have [data-lazyload-offset] attribute, return null
    if( !animation.hasAttribute('data-lazyload-offset') ) return null;
  
    // get value from [data-lazyload-offset] attribute or [data-lazyload-offset-native] and split into array
    const offset = (mobile && animation.hasAttribute('data-lazyload-offset-native') ? animation.dataset.lazyloadOffsetNative : animation.dataset.lazyloadOffset ).split(',');
  
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

export default WindmillRive;
