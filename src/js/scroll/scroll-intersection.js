import EMITTER from "@core/emitter";
import { INVIEW_CLASSNAME, INVIEW_ENTER, INVIEW_EXIT } from "@scroll/constants";
import { getCall, getDelay, getOffset, getPosition, getRepeat, getSpeed, getTarget } from "@scroll/utils";
import { $$, rect } from "@utils/dom";
import { lerp } from "@utils/math";
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
  raf() {
    if( !this._started ) return;

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

      const bcr = rect(target);
      const translate = getTranslate(target);

      let top = bcr.top - translate.y + this.scroll.y;
      let bottom = Math.min(top + bcr.height, this.scroll.limit);
      let middle = (bottom - top) * 0.5 + top;

      top   += offset[0];
      bottom = Math.min(bottom - offset[1], this.scroll.limit);

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
      const bcr = rect(element.target);
      const translate = getTranslate(element.target);

      let top = bcr.top - translate.y + this.scroll.y;
      let bottom = Math.min(top + bcr.height, this.scroll.limit);
      let middle = (bottom - top) * 0.5 + top;

      top   += offset[0];
      bottom = Math.min(bottom - offset[1], this.scroll.limit);

      // update data & save in Map
      element.offset = offset;
      element.top = top;
      element.middle = middle;
      element.bottom = bottom;

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

                case 'elementTop':
                    transformDistance = (scrollBottom - element.top) * element.speed * -1;
                    break;

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
      const lerpY = lerp(obj.y, y, obj.delay);

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
    if( element.call && !silent ) this._notify(element, INVIEW_ENTER);
  }
  _setOutView(element, silent = false) {
    // if element is already out of view, stop here
    if( !element.inView ) return;

    // update inView status
    element.inView = false;

    // emit call event
    if( element.call && !silent ) this._notify(element, INVIEW_EXIT);

    // if repeat = true, remove inView classname
    if( element.repeat ) element.el.classList.remove(INVIEW_CLASSNAME);
  }
}

export default ScrollIntersection;
