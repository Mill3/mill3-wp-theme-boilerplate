/**
 * SCROLL INTERSECTION
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
 * You can customize intersection calculations by playing with these options.
 * All of these options are optional.
 * 
 * [data-scroll-id] (string) : If you do not provide an ID, one will be attributed automatically. 
 *                             Useful if you want to scope your element and get the progress of your element in the viewport for example.
 * 
 * [data-scroll-target] (string) : CSS Selector specifying which HTML element to use as in-view position.
 * 
 * [data-scroll-offset] (string) : Element in-view trigger offset.
 *                                 Offset is composed of 2 comma separated values. 
 *                                 First value is added to [data-scroll-target] in-view calculation.
 *                                 Second value is added to [data-scroll-target] out-view calculation.
 *                                 Values can be integer or percentage.
 *                                 Percentage is relative to viewport height, otherwise it's absolute pixels.
 * 
 * [data-scroll-call] (string) : Event dispatched when element enter/exit viewport.
 *                               Event will be dispatched globally by @core/emitter prepended by SiteScroll.event-name.
 *                               You can dispatch multiple events from the same element by separate event with commas. 
 *                               E.g. [data-scroll-call="event1,event2,event3"]
 *                               
 * [data-scroll-repeat] (boolean) : Add .is-inview classname and execute [data-scroll-call] every time element enter/exit viewport. (default = false)
 * 
 * [data-scroll-position] (string) : Change in-view calculation.
 *                                   Accepted values: bottom
 * 
 *                                   default: in-view when element's top reach viewport's bottom
 *                                            out-view when element's bottom reach viewport's top (can be bigger than scroll maximum)
 *                                            ** This is what you want for 99% of the time.
 * 
 *                                   bottom:  in-view when element's top reach viewport's bottom
 *                                            out-view when element's bottom reach viewport's top (maxed to scroll maximum if element can't reach viewport's top)
 *                                            ** This is what you want for elements in .site-footer using [data-scroll-timeline].
 * 
 * Example:
 * <h1
 *  class="hello-world"
 *  data-scroll
 *  data-scroll-id="hello-world"
 *  data-scroll-target=".my-other-element"
 *  data-scroll-offset="100px,25%"
 *  data-scroll-call="HelloWorld"
 *  data-scroll-repeat="true"
 *  data-scroll-position="bottom"
 * >
 *  Hello World
 * </h1>
 * 
 ****************************************
 * OPTIONS FOR NON-MOBILE BROWSERS ONLY *
 ****************************************
 * For desktop, you can create parallax effect by playing with various [data-scroll-speed] and [data-scroll-delay].
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
 * Example:
 * <div
 *  class="position-relative d-block w-100 vh-50"
 *  data-scroll
 *  data-scroll-speed="2.5"
 *  data-scroll-delay="0.1"
 *  data-scroll-position="top|bottom"
 * >
 *  <img src="image-path.jpg" class="image-as-background" />
 * </div>
 * 
 ***************************************
 * HOW TO LISTEN TO [data-scroll-call] *
 ***************************************
 * 
 * HTML:
 *  
 * <h1 class="hello-world" data-scroll data-scroll-call="HelloWorld">Hello World</h1>
 * 
 * 
 * Javascript: 
 * 
 * import EMITTER from "@core/emitter";
 * 
 * EMITTER.on("SiteScroll.HelloWorld", (direction, obj) => {
 *    console.log(direction, obj);
 * });
 * 
 */

 import EMITTER from "@core/emitter";
 import { INVIEW_CLASSNAME, INVIEW_ENTER, INVIEW_EXIT } from "@scroll/constants";
 import { getCall, getDelay, getOffset, getPosition, getRepeat, getSpeed, getTarget } from "@scroll/utils";
 import { $$, rect } from "@utils/dom";
 import { lerp, limit } from "@utils/math";
 import { mobile } from "@utils/mobile";
 import { getTranslate } from "@utils/transform";
 import Viewport from "@utils/viewport";
 
 const DEFAULT_OPTIONS = {
   offset: [0, 0],
   repeat: false,
   threshold: 0.2,
 };
 
 class ScrollIntersection {
   constructor(scroll, options = DEFAULT_OPTIONS) {
     this.scroll = scroll;
 
     this._options = { ...DEFAULT_OPTIONS, ...options };
     this._started = false;
     this._delta = 1;
 
     this._elements = new Map();
     this._parallaxElements = new Map();
   }
 
   init() {
     this._addElements();
     this._transformElements(true);
   }
   update() {
     this._addElements();
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
 
   _addElements() {
     this._elements.clear();
     this._parallaxElements.clear();
 
     $$('[data-scroll]', this._el).forEach((element, index) => {
 
       // get element's [data-scroll-id]
       let id = element.dataset.scrollId;
 
       // if [data-scroll-id] doesn't exists, create one by default
       if( typeof id !== 'string' ) {
         id = `el${index}`;
 
         // set element's [data-scroll-id]
         element.setAttribute('data-scroll-id', id);
       }
 
       const offset = getOffset(element) ?? this._options.offset;
       const repeat = getRepeat(element) ?? this._options.repeat;
       const target = getTarget(element) ?? element;
       const call = getCall(element);
       const delay = getDelay(element);
       const position = getPosition(element);
       const speed = getSpeed(element);
       const [ top, middle, bottom ] = this._computeElementConstraints(target, offset, position);
 
       const data = {
         id,
         el: element,
         y: getTranslate(element).y,
         target,
         top,
         middle,
         bottom,
         offset,
         position,
         repeat,
         call,
         called: false,
         delay: delay,
         speed: speed,
         inView: false,
       };
 
       // save element to Map
       this._elements.set(id, data);
 
       // if element has data-speed, save into another Map
       if( speed !== false && !mobile ) this._parallaxElements.set(id, data);
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
       element.called = false;
 
       this._elements.set(element.id, element);
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
       const lerpY = lerp(obj.y, y, obj.delay * this._delta);
 
       // check if delay is completed
       const delayCompleted = Math.abs(y - lerpY) < this._options.threshold;
 
       // set y if delay isn't completed
       if( !delayCompleted ) y = lerpY;
     }
 
     obj.y = y;
     obj.el.style.transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0,${y},0,1)`;
   }
   _notify(element, direction) {
     const func = Array.isArray(element.call) ? element.call : [element.call];
     func.forEach(call => EMITTER.emit(`SiteScroll.${call}`, direction, element));
   }
 
   _checkElements(silent = false) {
     // if there is no elements, stop here
     if( this._elements.size === 0 ) return;
     
     const scrollTop = this.scroll.y;
     const scrollBottom = scrollTop + Viewport.height;
 
     this._elements.forEach(element => {
       if( element.inView ) {
         // check if element is out of viewport
         const outView = scrollBottom < element.top || scrollTop > element.bottom;
         if( outView ) this._setOutView(element, silent);
       } else {
         // check if element is in viewport
         const inView = scrollBottom >= element.top && scrollTop < element.bottom;
         if( inView ) this._setInView(element, silent);
       }
     });
   }
   _setInView(element, silent = false) {
     // if element is already in view, stop here
     if( element.inView ) return;
 
     // update inView status
     element.inView = true;
 
     // add inView classname
     element.el.classList.add(INVIEW_CLASSNAME);
 
     // emit call event
     if( element.call && !element.called && !silent ) {
       // if repeat != true, set has called to prevent recalling method when re-entering viewport
       if( !element.repeat ) element.called = true;
 
       this._notify(element, INVIEW_ENTER);
     }
   }
   _setOutView(element, silent = false) {
     // if element is already out of view, stop here
     if( !element.inView ) return;
 
     // update inView status
     element.inView = false;
 
     // emit call event
     if( element.call && element.repeat && !silent ) this._notify(element, INVIEW_EXIT);
 
     // if repeat = true, remove inView classname
     if( element.repeat ) element.el.classList.remove(INVIEW_CLASSNAME);
   }
 
   _computeElementConstraints(element, offset, position) {
     const bcr = rect(element);
     const translate = getTranslate(element);
     const max = position === 'bottom' ? this.scroll.limit : Infinity;
 
     let top = bcr.top - translate.y + this.scroll.y;
     let bottom = limit(top, max, top + bcr.height);
     let middle = (bottom - top) * 0.5 + top;
 
     top   += offset[0];
     bottom = limit(top, max, bottom - offset[1]);
 
     return [top, middle, bottom];
   }
 }
 
 export default ScrollIntersection;
 