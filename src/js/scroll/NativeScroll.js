import { SCROLL_TO_OPTIONS } from "@scroll/constants";
import Core from "@scroll/Core";
import { getCall, getOffset, getRepeat, getTarget } from "@scroll/utils";
import { $, $$, rect } from "@utils/dom";
import { on, off } from "@utils/listener";
import { getTranslate } from "@utils/transform";
import Viewport from "@utils/viewport";

class NativeScroll extends Core {
  constructor(options) {
    super(options);

    this._started = false;
    this._onScroll = this._onScroll.bind(this);

    this.init();
  }

  init() {
    this._calcScrollHeight();
    this._addSections();
    this._addElements();

    super.init();
  }
  destroy() {
    super.destroy();

    this._started = null;
    this._onScroll = null;
  }

  update() {
    this._addSections();
    this._addElements();
    this._onScroll();
  }
  resize() {
    this._updateEssentials(window.scrollY);
    this._calcScrollHeight();
    this._resizeSections();
    this._resizeElements();

    super.resize();
    this._onScroll();
  }

  start() {
    if( this._started ) return;
    this._started = true;

    this._checkSections();
    this._checkElements();
  }
  stop() {
    if( !this._started ) return;
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
    if (typeof target !== 'number') offset += rect(target).top + this._data.y;
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
        top: offset,
        behavior: options.smooth === true ? 'smooth' : 'auto'
    });
  }

  _bindEvents() {
    super._bindEvents();
    on(window, 'scroll', this._onScroll);
  }
  _unbindEvents() {
    off(window, 'scroll', this._onScroll);
    super._unbindEvents();
  }
  
  _addElements() {
    this._elements.clear();

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

      const bcr = rect(target);
      const translate = getTranslate(target);

      let top = bcr.top - translate.y + this._data.y;
      const bottom = top + bcr.height - offset[1];

      top += offset[0];
      //console.log(id, top, bottom, offset);

      this._elements.set(id, {
        id,
        el: element,
        target,
        top,
        bottom,
        offset,
        repeat,
        call,
        inView: false,
      });
    });
  }
  _resizeElements() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;

    this._elements.forEach(element => {
      const offset = getOffset(element.el) ?? this._options.offset;
      const bcr = rect(element.target);
      const translate = getTranslate(element.target);

      const top = bcr.top - translate.y + this._data.y + offset[0];
      const bottom = top + bcr.height - offset[1];

      // update data & save in Map
      element.offset = offset;
      element.top = top;
      element.bottom = bottom;

      this._elements.set(element.id, element);
    });
  }

  _onScroll() {
    if( !this._started ) return;

    this._updateEssentials(window.scrollY);
    //console.log(this._data.y);

    this._checkSections();
    this._checkElements();

    this.emit('scroll', this._data.y);

    // if we are scrolling to a particular offset defined by scrollTo
    if( this._data.scrollTo ) {
      // if offset as been reached, run callback & destroy saved scrollTo's offset
      if( this._data.scrollTo.offset === this._data.y >> 0 ) {
        this._data.scrollTo.callback();
        this._data.scrollTo = null;
      }
    }
  }
  _calcScrollHeight() {
    this._data.height = Math.max(Viewport.height, Math.round( rect(this._el).height - Viewport.height ));
  }
}

export default NativeScroll;
