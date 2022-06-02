import EventEmitter2 from "eventemitter2";

import { INVIEW_CLASSNAME, INVIEW_ENTER, INVIEW_EXIT, DIRECTION_DOWN, DIRECTION_UP } from "@scroll/constants";
import { getOffset } from "@scroll/utils";
import { $, $$, html, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import { lerp } from "@utils/math";
import ResizeOrientation, { MILL3_SCROLL_PRIORITY } from "@utils/resize";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";
import smoothScrollToPolyfill from "@vendors/smooth-scroll-polyfill";


export const DEFAULT_OPTIONS = {
  el: '[data-scroll-container]',
  autoStart: true,
  offset: [0, 0],
  repeat: false,
  smooth: false,
};


class Core extends EventEmitter2 {
  constructor(options = DEFAULT_OPTIONS) {
    super();

    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._el = $(this._options.el);

    this._sections = new Map();
    this._elements = new Map();
    this._data = {
      y: window.scrollY,
      height: 0,
      direction: null,
      scrollTo: null,
    };

    this._onScrollToClick = this._onScrollToClick.bind(this);
    this._resize = this.resize.bind(this);

    smoothScrollToPolyfill();

    html.classList.add('has-scroll-init', this.smooth ? 'has-scroll-smooth' : 'has-scroll-native');
  }

  init() {
    this._bindEvents();

    if( this._options.autoStart ) this.start();
    if( window.location.hash ) {
      // Get the hash without the '#' and find the matching element
      const id = window.location.hash.slice(1, window.location.hash.length);
      let target = $(`#${id}`);

      // If found, scroll to the element
      if (target) this.scrollTo(target);
    }
  }
  destroy() {
    this._unbindEvents();

    if( this._sections ) this._sections.clear();
    if( this._elements ) this._elements.clear();

    this._options = null;
    this._el = null;

    this._sections = null;
    this._elements = null;
    this._data = null;

    this._onScrollToClick = null;

    html.classList.remove('has-scroll-init', this.smooth ? 'has-scroll-smooth' : 'has-scroll-native');
  }

  update() {
    console.warn('MILL3Scroll.update must be overriden.');
  }
  resize() {
    this.emit('resize');
  }
  scrollTo(target, options = SCROLL_TO_OPTIONS) {
    console.warn('MILL3Scroll.scrollTo must be overriden.');
  }

  start() {
    console.warn('MILL3Scroll.start must be overriden.');
  }
  stop() {
    console.warn('MILL3Scroll.stop must be overriden.');
  }

  _bindEvents() {
    on('[data-scroll-to]', 'click', this._onScrollToClick);
    ResizeOrientation.add(this._resize, MILL3_SCROLL_PRIORITY);
  }
  _unbindEvents() {
    off('[data-scroll-to]', 'click', this._onScrollToClick);
    ResizeOrientation.remove(this._resize);
  }
  
  _addSections() {
    this._sections.clear();

    // select all sections inside this.el
    let sections = $$('[data-scroll-section]', this._el);

    // if there is no section, set this.el as section
    if( sections.length === 0 ) {
      this._el.setAttribute('data-scroll-section', '');
      sections = [ this._el ];
    }

    // loop through all sections and create a mapping object
    sections.forEach((section, index) => {
      // get section's [data-scroll-id]
      let id = section.dataset.scrollId;

      // if [data-scroll-id] doesn't exists, create one by default
      if( typeof id !== 'string' ) {
        id = `section${index}`;

        // set section's [data-scroll-id]
        section.setAttribute('data-scroll-id', id);
      }

      // get section limits
      const [ offset, limit ] = this._calcSectionLimits(section);

      // get inView status from [data-scroll-section-inview] attribute
      const inView = section.hasAttribute('data-scroll-section-inview');

      // add section to map
      this._sections.set(id, {
        id,
        el: section,
        y: 0,
        top: offset,
        bottom: limit,
        inView,
      });
    });
  }
  _resizeSections() {
    // if there is no sections, stop here
    if( this._sections.size === 0 ) return;

    this._sections.forEach(section => {
      // get section limits
      const [ offset, limit ] = this._calcSectionLimits(section.el);

      // update data & save in Map
      section.top = offset;
      section.bottom = limit;

      this._sections.set(section.id, section);
    });
  }
  _checkSections(force = false) {
    this._sections.forEach(section => {
      // check if section is in viewport
      const inView = this._data.y >= section.top && this._data.y <= section.bottom;
      const willChange = inView === section.inView ? false : true;

      // transform element if is inView or inView status will change (smooth only)
      if( force || (this.smooth && (inView || willChange)) ) this._transform(section, this._data.y * -1);

      // if inView status will not change, stop here
      if( !willChange ) return;

      // update inView status
      if( inView ) {
        section.inView = true;
        section.el.setAttribute(`data-scroll-section-inview`, '');
      } else {
        section.inView = false;
        section.el.removeAttribute(`data-scroll-section-inview`);
      }
    });
  }
  _checkElements(silent = false) {
    const scrollTop = this._data.y;
    const scrollBottom = scrollTop + Viewport.height;

    this._elements.forEach(element => {

      // inView detection for sticky elements is different
      //if( element.sticky ) {
      //  return;
      //}

      // if element is already inView and not repeat, stop here
      //if( element.inView && !element.repeat ) return;

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
    if( element.call && !silent ) this.emit('call', element.call, INVIEW_ENTER, element);
  }
  _setOutView(element, silent = false) {
    // if element is already out of view, stop here
    if( !element.inView ) return;

    // update inView status
    element.inView = false;

    // emit call event
    if( element.call && !silent ) this.emit('call', element.call, INVIEW_EXIT, element);

    // if repeat = true, remove inView classname
    if( element.repeat ) element.el.classList.remove(INVIEW_CLASSNAME);
  }
  _transform(obj, y, ignoreDelay = false) {

    let delayCompleted = true;

    // apply delay if not ignored
    if( obj.delay && !ignoreDelay ) {
      // calculate linear interpolation
      const lerpY = lerp(obj.y, y, obj.delay);

      // check if delay is completed
      delayCompleted = Math.abs(y - lerpY) < this._options.threshold;

      // set y if delay isn't completed
      if( !delayCompleted ) y = lerpY;
    }

    obj.y = y;
    obj.el.style.transform = `translate3d(0, ${y}px, 0)`;

    return delayCompleted;
  }
  _updateEssentials(y) {
    // calculation scroll direction
    const prop = this.smooth ? 'targetY' : 'y';
    const distance = y - this._data[prop];
    const direction = distance >= 0 ? DIRECTION_DOWN : DIRECTION_UP;

    // update scroll y
    this._data[prop] = y;

    // update direction AND trigger event if value has changed
    if( direction !== this._data.direction ) {
      const oldDirection = this._data.direction;
      this._data.direction = direction;
      
      this.emit('direction', direction, oldDirection);
    }
  }
  _calcSectionLimits(sectionEL) {
    const { top, height } = rect(sectionEL);
    let offset;

    if( this.smooth ) offset = (top - getTranslate(sectionEL).y) >> 0;
    else offset = top + this._data.y;
    
    offset = Math.max(0, offset) - Viewport.height * 1.5;
    const limit = offset + height + Viewport.height * 2;

    return [ Math.max(0, offset), limit ];
  }


  _onScrollToClick(event) {
    if( event ) event.preventDefault();

    const { currentTarget } = event;

    // get scroll to target
    let target = (currentTarget.getAttribute('data-scroll-to') ?? '').trim();

    // if target is not provided, try to get from href attribute
    if( target === '' ) target = (currentTarget.getAttribute('href') ?? '').trim();

    // if target is empty, stop here
    if( target === '' ) return;

    // start scrollTo
    this.scrollTo(target, {
      offset: getOffset(currentTarget) ?? 0,
    });
  }


  // getter - setter
  get y() { return this._data.y; }
  set y(value = 0) {
    this._data.y = value;
  }

  get direction() { return this._data.direction; }
  get smooth() { return false; }
}

export default Core;
