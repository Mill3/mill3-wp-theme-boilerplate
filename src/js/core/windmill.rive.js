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

const SELECTOR = "canvas.rive-animation[data-lazyload]:not([data-lazyload-ignore])";
const TARGET_ATTRIBUTE = "data-lazyload-target";

export class WindmillRive {  
  constructor() {
    this._windmill = null;
  }

  /**
   * Plugin installation.
   */
  install(windmill) {
    this._windmill = windmill;

    windmill.on('init', this._onInit, this);
    windmill.on('init', this._preloadInViewportAnimations, this);
    windmill.on('added', this._preloadInViewportAnimations, this);
  }

  _onInit() {
    // this force Rive to use the rive.wasm resource URL injected in <head> with rive.php file
    const wasmURL = getRiveWASMLink();
    if( wasmURL ) RuntimeLoader.setWasmUrl( wasmURL );

    return new Promise(resolve => {
      RuntimeLoader.getInstance(resolve);
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
