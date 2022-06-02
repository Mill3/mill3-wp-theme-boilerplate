import { SCROLL_TO_OPTIONS } from "@scroll/constants";
import Core from "@scroll/Core";

import { getCall, getDelay, getOffset, getPosition, getRepeat, getSpeed, getSticky, getTarget } from "@scroll/utils";
import { $, $$, html, body, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import { lerp, limit } from "@utils/math";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";

const DEFAULT_OPTIONS = {
  lerp: 0.1,
  threshold: 0.2,
};

const KEY_CODES = {
  TAB: 9,
};

class SmoothScroll extends Core {
  constructor(options = DEFAULT_OPTIONS) {
    super({ ...DEFAULT_OPTIONS, ...options });

    this._data.targetY = this._data.y;
    this._parallaxElements = new Map();

    this._isResizing = false;
    this._started = false;
    this._raf = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onRAF = this._onRAF.bind(this);

    this.init();
  }

  init() {
    this._updateScrollContainer();
    this._addSections();
    this._addElements();
    this._checkSections(true);
    this._transformElements(true);

    super.init();
  }
  destroy() {
    super.destroy();

    this._parallaxElements.clear();

    this._parallaxElements = null;
    this._isResizing = null;
    this._started = null;
    this._raf = null;

    this._onKeyDown = null;
    this._onScroll = null;
    this._onRAF = null;

    html.classList.remove('smooth-scroll-ready');
  }

  start() {
    if( this._started ) return;
    this._started = true;

    if( !this._raf ) this._onRAF();
  }
  stop() {
    if( !this._started ) return;

    if( this._raf ) cancelAnimationFrame(this._raf);
    this._raf = null;

    this._started = false;
  }
  scrollTo(target, options = SCROLL_TO_OPTIONS) {
    // extends options from default
    options = { ...SCROLL_TO_OPTIONS, ...options };

    // An offset to apply on top of given `target` or `sourceElem`'s target
    let offset = parseInt(options.offset) || 0; 

    // function called when scrollTo completes (note that it won't wait for lerp to stabilize)
    const callback = options.callback ? options.callback : false;


    if (typeof target === 'string') {
      // Selector or boundaries
      if (target === 'top') target = 0;
      else if (target === 'bottom') target = this._data.height;
      else {
        target = $(target);
        
        // If the query fails, stop here
        if (!target) return;
      }
    } else if (typeof target === 'number') {
      // Absolute coordinate
      target = parseInt(target);
    } else if (target && target.tagName) {
      // DOM Element
      // We good 👍
    } else {
      console.warn('`target` parameter is not valid');
      return;
    }

    // We have a target that is not a coordinate yet, get it
    if (typeof target !== 'number') {
      const bcr = rect(target);
      const { y } = getTranslate(target);
      const parentSection = target.hasAttribute('data-scroll-section') ? false : target.closest('[data-scroll-section]');

      offset += bcr.top - y;

      if( parentSection ) offset -= getTranslate(parentSection).y;     
    }
    else offset += target;

    // if a callback as been provided, save offset and callback for scroll event
    if( callback ) {
      this._data.scrollTo = {
        offset: parseInt(offset),
        callback,
      };
    } 
    // otherwise, remove scrollTo saved callback
    else this._data.scrollTo = null;

    window.scrollTo({
      top: limit(0, this._data.height, offset),
      behavior: options.smooth === true ? 'smooth' : 'auto'
  });
  }

  update() {
    this._isResizing = true;

    this._updateEssentials(window.scrollY);
    this._updateScrollContainer();
    this._addSections();
    this._addElements();

    this._isResizing = false;

    this._onScroll();
  }
  resize() {
    this._isResizing = true;

    this._updateEssentials(window.scrollY);
    this._updateScrollContainer();
    this._resizeSections();
    this._addElements();

    this._checkSections(true);
    this._checkElements();
    this._transformElements(true);

    super.resize();

    this._isResizing = false;
  }

  _bindEvents() {
    super._bindEvents();

    on(window, 'keydown', this._onKeyDown);
    on(window, 'scroll', this._onScroll);
  }
  _unbindEvents() {
    off(window, 'keydown', this._onKeyDown);
    off(window, 'scroll', this._onScroll);

    super._unbindEvents();
  }

  _updateScrollContainer() {
    html.classList.remove('smooth-scroll-ready');

    const bcr = rect(this._el);
    const height = Math.floor( bcr.height );

    this._data.height = Math.max(Viewport.height, height - Viewport.height);
    this._el.style.setProperty('--top', `${bcr.top + window.scrollY}px`);
    body.style.setProperty('--scrollHeight', `${height}px`);

    html.classList.add('smooth-scroll-ready');
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

      // Find element's parent section
      const parentSection = element.closest('[data-scroll-section]');

      // stop here if we can't find it
      if( !parentSection ) {
        console.warn(`[data-scroll-id="${id}"] will not be enabled cause is not a descendant of [data-scroll-section.]`);
        return;
      }

      const offset = getOffset(element) ?? this._options.offset;
      const repeat = getRepeat(element) ?? this._options.repeat;
      const target = getTarget(element) ?? element;
      const call = getCall(element);
      const sticky = getSticky(element);
      const delay = getDelay(element);
      const position = getPosition(element);
      const speed = getSpeed(element);

      const section = this._sections.get(parentSection.getAttribute('data-scroll-id'));
      const bcr = rect(target);
      const translate = getTranslate(target);
      const sectionTranslate = getTranslate(section.el);

      //let top = Math.ceil(bcr.top - translate.y - sectionTranslate.y);
      let top = bcr.top - translate.y - sectionTranslate.y;
      let bottom, middle;

      // if element is sticky
      if (sticky) {
        // if element is the same as target, get previously calculated BCR to speed things up
        const elBCR = element === target ? bcr : rect(element);
        const elDistance = elBCR.top - top;

        top   += Viewport.height;
        bottom = Math.min(elBCR.top + bcr.height - elBCR.height - elDistance, this._data.height);
      }
      else {
        bottom = Math.min(top + bcr.height, this._data.height);
      }

      middle = (bottom - top) * 0.5 + top;
      top   += offset[0];
      bottom = Math.min(bottom - offset[1], this._data.height);


      const data = {
        id,
        el: element,
        y: getTranslate(element).y,
        section,
        target,
        top,
        middle,
        bottom,
        offset,
        call,
        sticky,
        position,
        repeat,
        delay: sticky ? false : delay,
        speed: sticky ? false : speed,
        inView: false,
      };

      // save element to Map
      this._elements.set(id, data);

      // if element has parallax or is sticky, save into another Map
      if( speed !== false || sticky ) this._parallaxElements.set(id, data);
    });
  }
  _transformElements(force = false) {
    const scrollBottom = this._data.y + Viewport.height;
    const scrollMiddle = this._data.y + Viewport.height / 2;

    let delaysCompleted = true;

    this._parallaxElements.forEach(element => {
        let transformDistance = false;

        if( force ) transformDistance = 0;

        if( element.inView || force ) {
            switch( element.position ) {
                case 'top':
                    transformDistance = this._data.y * element.speed * -1;
                    break;

                case 'elementTop':
                    transformDistance = (scrollBottom - element.top) * element.speed * -1;
                    break;

                case 'bottom':
                    transformDistance = (this._data.height - scrollBottom + Viewport.height) * element.speed;
                    break;

                default:
                    transformDistance = (scrollMiddle - element.middle) * element.speed * -1;
                    break;
            }
        }

        if( element.sticky ) {
          if( element.inView ) {
            transformDistance = this._data.y - element.top + Viewport.height;

            //const percentage = transformDistance / 100;
            //if( percentage < 1 ) {
            //  transformDistance = lerp(0, 30, percentage)
            //  console.log('lerp');
            //  //transformDistance = 100 * percentage;
            //}
          } else {
            if( this._data.y < element.top - Viewport.height && this._data.y < element.top - Viewport.height / 2 ) {
              transformDistance = 0;
            } else if( this._data.y > element.bottom && this._data.y > element.bottom ) {
              transformDistance = element.bottom - element.top + Viewport.height;
            } else transformDistance = false;
          }
        }

        if( transformDistance !== false ) {
          // apply transformation and receive if element delay is completed
          const delayCompleted = this._transform(element, transformDistance, force);

          // if delay isn't completed AND is first element's delay to be incompleted completed, set return value to false
          if( !delayCompleted && delaysCompleted ) delaysCompleted = false;
        }
    });

    return delaysCompleted;
  }

  _onKeyDown(event) {
    // If we are stopped, we don't want any scroll to occur because of a keypress
    // Prevent tab to scroll to activeElement
    if( !this._started ) return;

    switch (event.keyCode) {
      case KEY_CODES.TAB:
        // Request scrollTo on the focusedElement, putting it at the center of the screen
        // We need a RAF because document.activeElement is not updated during keydown event
        requestAnimationFrame(() => {
          this.scrollTo(document.activeElement, { offset: Viewport.height * -0.5 });
        });
      break;
    }
  }
  _onScroll() {
    if( !this._started ) return;

    this._updateEssentials(window.scrollY);    
    //console.log('scroll', this._data.targetY);

    // start RAF is not running
    if( !this._raf ) this._onRAF();
  }
  _onRAF() {
    // if not trying to perform resize calculations
    if( !this._isResizing ) {
      // lerp scroll
      this._data.y = lerp(this._data.y, this._data.targetY, this._options.lerp);

      // check if y is so near targetY that we can snap to it
      const diff = Math.abs(this._data.targetY - this._data.y);
      if( diff < this._options.threshold ) this._data.y = this._data.targetY;

      //console.log('raf', this._data.targetY, this._data.y);

      this._checkSections();
      this._checkElements();
      const delaysCompleted = this._transformElements(false, true);

      // if we are scrolling to a particular offset defined by scrollTo
      if( this._data.scrollTo ) {
        const scrollToDiff = Math.abs(this._data.scrollTo.offset - this._data.y);

        // if offset as been reached, run callback & destroy saved scrollTo's offset
        if( scrollToDiff < 1 ) {
          this._data.scrollTo.callback();
          this._data.scrollTo = null;
        }
      }

      // trigger event
      this.emit('scroll', this._data.y);

      // if y as reached targetY AND all delays are done, no need to continue RAF
      if( this._data.y === this._data.targetY && delaysCompleted ) {
        this._raf = null;
        return;
      }
    }

    // get another RAF
    this._raf = requestAnimationFrame(this._onRAF);
  }


  // getter - setter
  get smooth() { return true; }
}

export default SmoothScroll;
