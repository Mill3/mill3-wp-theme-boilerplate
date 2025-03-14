/**
* SCROLL PARALLAX (NON MOBILE BROWSERS ONLY)
*
***************
* How to use: *
***************
* Add [data-scroll] attribute to your HTML element.
*
* Example:
* <h1 class="hello-world" data-scroll>Hello World</h1>
* 
* Scroll Intersection will check when your element enter viewport and add .is-inview classname.
* 
***********
* OPTIONS *
***********
* You can customize parallax by playing with these options.
* All of these options are optional.
* 
* [data-scroll-speed] (float) : Element parallax speed. Negative value will invert direction.
*                               For example, an element with [data-scroll-speed="2"] will scroll 2 times faster than usual.
*                               Important to note that each element translateY will equal 0 when their center meet viewport's center.
*                               This behavior can be modified by using [data-scroll-position].  
* 
* [data-scroll-delay] (float) : Element parallax linear interpolation (LERP).
*                               Accepted values: [0, 1].
*                               The lower the value, the slower the element will snap to his position.
*                               [data-scroll-speed] is required for this to work.
* 
* [data-scroll-position] (string) : Will modify how element parallax speed is applied.
*                                   Accepted values: top, bottom.
* 
*                                   default: translateY = ( distance from element's center to viewport's center ) * speed
*                                   top: translateY = page scroll * speed
*                                   bottom: translateY = distance from page's bottom * speed
* 
*                                   ** Most of the time, you don't need to change [data-scroll-position].
*                                      If you want to achieve a particular effect and don't quite get it, 
*                                      try changing [data-scroll-position] to see how it react in your project.
* 
* [data-scroll-progress] (string) : Track element progression.
*                                   Accepted values: easing function name (see: @utils/easings)
*                                   If you omit easing function name or set a non-valid value, linear easing is applied.
*                                   See js/utils/easings.js for available easing functions.
*
* [data-scroll-progress-event] (bool) : Dispatch scroll:progress event when element progression is updated.
*                                       Do not set this data-attribute if you don't need to listen to scroll:progress event.
*
* 
* Example:
* <div
*  class="position-relative d-block w-100 vh-50"
*  data-scroll
*  data-scroll-speed="2.5"
*  data-scroll-delay="0.1"
*  data-scroll-position="top|bottom"
*  data-scroll-progress="easeInOutCubic"
*  data-scroll-progress-event
* >
*  <img src="image-path.jpg" class="image-as-background" />
* </div>
*/

import { EVENT_PROGRESS } from "@scroll/constants";
import { getDelay, getOffset, getPosition, getProgress, getSpeed, getTarget } from "@scroll/utils";
import { $$, body, rect } from "@utils/dom";
import { lerp2, limit } from "@utils/math";
import { motion_reduced } from "@utils/mobile";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";

const DEFAULT_OPTIONS = {
  offset: [0, 0],
};

class ScrollParallax {
  constructor(scroll, options = DEFAULT_OPTIONS) {
    this.scroll = scroll;
    
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._started = false;
    this._delta = 1;
    
    this._elements = new Map();
    this._parallaxElements = new Map();
  }
  
  init($target = body) {
    this._addElements($target);
    this._checkElementsProgress();
    this._transformElements(true);
  }
  update($target = body) {
    this._addElements($target);
    this._checkElements();
    this._transformElements(true);
  }
  start() {
    if( this._started ) return;
    this._started = true;
  }
  stop() {
    if( !this._started ) return;
    this._started = false;
  }
  raf(delta = 1) {
    if( !this._started ) return;
    
    this._delta = delta;
    
    this._checkElements();
    this._transformElements();
  }
  resize() {
    this._resizeElements();
    this._checkElements();
    this._transformElements();
  }
  reset() {
    this._parallaxElements.clear();
    this._elements.clear();
    
    this._started = false;
    this._delta = 1;
  }
  
  _addElements($target = body) {
    this._elements.clear();
    this._parallaxElements.clear();
    
    $$('[data-scroll][data-scroll-speed], [data-scroll][data-scroll-progress]', $target).forEach(element => {      
      const offset = getOffset(element) ?? this._options.offset;
      const target = getTarget(element) ?? element;
      const delay = getDelay(element);
      const position = getPosition(element);
      const speed = getSpeed(element);
      const [ progress, progressEasing ] = getProgress(element);
      const [ top, middle, bottom ] = this._computeElementConstraints(target, offset, position);
      
      const data = {
        el: element,
        y: getTranslate(element).y,
        target,
        top,
        middle,
        bottom,
        offset,
        position,
        progress,
        progressEasing,
        progressEvent: element.hasAttribute('data-scroll-progress-event'),
        delay: delay,
        speed: speed,
        inView: false,
      };
      
      // save element to Map
      this._elements.set(element, data);
      
      // if element has data-speed, save into another Map
      if( speed !== false ) this._parallaxElements.set(element, data);
    });
  }
  _resizeElements() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;
    
    this._elements.forEach(element => {
      const offset = getOffset(element.el) ?? this._options.offset;
      const [ top, middle, bottom ] = this._computeElementConstraints(element.target, offset, element.position);
      
      // update data & save in Map
      element.offset = offset;
      element.top = top;
      element.middle = middle;
      element.bottom = bottom;
      element.inView = false;
      
      this._elements.set(element.el, element);
    });
  }
  _transformElements(force = false) {
    if( this._parallaxElements.size === 0 ) return;
    
    const scrollBottom = this.scroll.y + Viewport.height;
    const scrollMiddle = this.scroll.y + Viewport.height / 2;
    
    this._parallaxElements.forEach(element => {
      let transformDistance = false;
      
      if( force ) transformDistance = 0;
      
      if( element.inView || force ) {
        switch( element.position ) {
          case 'top':
          transformDistance = this.scroll.y * element.speed * -1;
          break;
          
          /*
          case 'elementTop':
          transformDistance = (scrollBottom - element.top) * element.speed * -1;
          break;
          */
          
          case 'bottom':
          transformDistance = (this.scroll.limit - scrollBottom + Viewport.height) * element.speed;
          break;
          
          default:
          transformDistance = (scrollMiddle - element.middle) * element.speed * -1;
          break;
        }
      }
      
      // apply transformation
      if( transformDistance !== false ) this._transform(element, transformDistance, force);
    });
  }
  _transform(obj, y, ignoreDelay = false) {
    // apply delay if not ignored
    if( obj.delay && !ignoreDelay ) {
      // calculate linear interpolation
      //const lerpY = lerp(obj.y, y, obj.delay * this._delta);
      const lerpY = lerp2(obj.y, y, obj.delay, this._delta);
      
      // check if delay is completed
      const delayCompleted = Math.abs(y - lerpY) < this._options.threshold;
      
      // set y if delay isn't completed
      if( !delayCompleted ) y = lerpY;
    }
    
    obj.y = y;
    if( !motion_reduced ) obj.el.style.transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,${y},0,1)`;
  }
  
  _checkElements() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;
    
    const vh = Viewport.height;
    const scrollTop = this.scroll.y;
    const scrollBottom = scrollTop + vh;
    
    this._elements.forEach(element => {
      // update element progress
      if( element.progress !== false ) this._updateElementProgress(element);
      
      if( element.inView ) {
        // check if element is out of viewport
        const outView = scrollBottom < element.top || scrollTop > element.bottom;
        if( outView ) this._setOutView(element);
      } else {
        // check if element is in viewport
        const inView = scrollBottom >= element.top && scrollTop < element.bottom;
        if( inView ) this._setInView(element);
      }
    });
  }
  _checkElementsProgress() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;
    
    this._elements.forEach(element => {
      // update element progress
      if( element.progress !== false ) this._updateElementProgress(element);
    });
  }
  _updateElementProgress(element) {
    let height, distance, progress;
    
    if( element.position === 'bottom' ) {
      height = element.bottom - element.top;
      distance = limit(0, height, Viewport.height + this.scroll.y - element.top);
      progress = distance / height;
    } else {
      height = Math.min(element.bottom, Viewport.height + element.bottom - element.top);
      distance = limit(0, height, element.bottom - this.scroll.y);
      progress = 1 - distance / height;
    }
    
    //console.log('_checkProgress', progress);
    
    // apply easing function if defined
    if( element.progressEasing ) progress = element.progressEasing(progress, 0, 1, 1);
    
    if( progress !== element.progress ) {
      element.progress = progress;
      element.el.style.setProperty('--scroll-progress', progress);
      
      // dispatch event if requested by user
      if( element.progressEvent ) {
        element.el.dispatchEvent(new CustomEvent(EVENT_PROGRESS, { bubbles: false, detail: { data: element, scroll: this.scroll } }));
      }
    }
  }
  _setInView(element) {
    // if element is already in view, stop here
    if( element.inView ) return;
    
    // update inView status
    element.inView = true;
  }
  _setOutView(element) {
    // if element is already out of view, stop here
    if( !element.inView ) return;
    
    // update inView status
    element.inView = false;
  }
  
  _computeElementConstraints(element, offset, position) {
    const bcr = rect(element);
    const translate = getTranslate(element);
    //const max = position === 'bottom' ? this.scroll.limit : Infinity;
    const max = position === 'bottom' ? Infinity : Infinity;
    
    let top = bcr.top - translate.y + this.scroll.y;
    //let bottom = limit(top, max, top + bcr.height);
    let bottom = Math.min(max, top + bcr.height);
    let middle = (bottom - top) * 0.5 + top;
    
    top   += offset[0];
    //bottom = limit(top, max, bottom - offset[1]);
    bottom = Math.min(max, bottom - offset[1]);
    
    return [top, middle, bottom];
  }
}

export default ScrollParallax;
