/**
* SCROLL Intersection Observer
*
***************
* How to use: *
***************
* Add [data-scroll] attribute to your HTML element.
*
* Example:
* <h1 class="hello-world" data-scroll>Hello World</h1>
* 
* Scroll IO will check when your element enter viewport and add .is-inview classname.
* 
***********
* OPTIONS *
***********
* You can customize intersection calculations by playing with these options.
* All of these options are optional.
* 
* [data-scroll-target] (string) : CSS Selector specifying which HTML element to use as in-view position.
* 
* [data-scroll-offset] (string) : Element in-view trigger offset.
*                                 Offset is composed of 2 comma separated values. 
*                                 First value is added to [data-scroll-target] in-view calculation.
*                                 Second value is added to [data-scroll-target] out-view calculation.
*                                 Values can be integer or percentage or calc().
*                                 You can perform calculations by using calc(100% - 100px);
*                                 Percentage is relative to viewport height, otherwise it's absolute pixels.
* 
* [data-scroll-call] (string) : Event dispatched when element enter/exit viewport.
*                               Event will be dispatched globally by @core/emitter prepended by SiteScroll.event-name.
*                               You can dispatch multiple events from the same element by separate event with commas. 
*                               E.g. [data-scroll-call="event1,event2,event3"]
*                               
* [data-scroll-repeat] (boolean) : Add .is-inview classname and execute [data-scroll-call] every time element enter/exit viewport. (default = false)
* 
* [data-scroll-root] (string) : CSS Selector specifying which HTML element to use as IntersectionObserver root.
* 
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
*  data-scroll-root=".my-root"
* >
*  Hello World
* </h1>
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
* EMITTER.on("SiteScroll.HelloWorld", (direction, obj, scroll) => {
*    console.log(direction, obj, scroll);
* });
* 
* 
************************************************
* Different scroll offset for native scrolling *
************************************************
* Add [data-scroll-offset-native="0,0"] to your element. 
* See [data-scroll-offset] for details.
*/

import EMITTER from "@core/emitter";
import { OUTVIEW_CLASSNAME, INVIEW_CLASSNAME, INVIEW_ENTER, INVIEW_EXIT, EVENT_ENTER, EVENT_EXIT } from "@scroll/constants";
import { getCall, getRepeat, getRoot, getRootMargin, getTarget } from "@scroll/utils";
import { $, $$, getBody } from "@utils/dom";

const DEFAULT_OPTIONS = {
  offset: ['-1px', '-1px'],
  repeat: false,
  globalEmitter: true,
};

class ScrollIO {
  constructor(scroll, options = DEFAULT_OPTIONS) {
    this.scroll = scroll;
    
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._started = false;
    
    this._elements = new Map();
    this._targets = new Map();
    this._IOs = new Map();
    this._roots = new Map();

    this._onIO = this._onIO.bind(this);
    this._onRoot = this._onRoot.bind(this);

    this._rootIO = new IntersectionObserver(this._onRoot, { rootMargin: this._formatRootMargin(DEFAULT_OPTIONS.offset) });
  }
  
  init($target) {
    if( !$target ) $target = getBody();

    this._addElements($target);
  }
  update($target) {
    if( !$target ) $target = getBody();

    this._addElements($target);
    //this._checkElements();
  }
  start() {
    if( this._started ) return;
    this._started = true;
  }
  stop() {
    if( !this._started ) return;
    this._started = false;
  }
  resize() {
    this._resizeElements();
    //this._checkElements();
  }
  reset() {
    this._rootIO.disconnect();
    this._IOs.forEach(io => io.disconnect());
    this._IOs.clear();
    this._targets.clear();
    this._elements.clear();
    this._roots.clear();
    
    this._started = false;
  }
  exit() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;
    
    this._elements.forEach(element => {
      if( element.inView && element.rootInView ) element.el.classList.add(OUTVIEW_CLASSNAME);
    });
  }
  
  _addElements($target) {
    if( !$target ) $target = getBody();
    
    this._rootIO.disconnect();
    this._IOs.forEach(io => io.disconnect());
    this._targets.forEach(targets => targets.clear());
    this._elements.clear();
    this._roots.clear();
    
    $$('[data-scroll]', $target).forEach(element => {    
      const root = getRoot(element) ?? null;
      const rootMargin = getRootMargin(element) ?? this._options.offset;
      const repeat = getRepeat(element) ?? this._options.repeat;
      const target = getTarget(element) ?? element;
      const call = getCall(element);
      const io = this._getIOFromRootMargin(rootMargin, root);
      
      const data = {
        el: element,
        target,
        root,
        rootEl: root ? $(root) : null,
        rootMargin,
        repeat,
        call,
        io,
        called: false,
        inView: false,
        rootInView: root ? false : true,
      };

      // save element to Map
      this._elements.set(element, data);

      // save references for this IO
      this._targets.get(io).add(data);

      // observe element's root
      if( root ) {
        this._roots.set(element, data);
        this._rootIO.observe(data.rootEl);
      }

      // observe element's target
      io.observe(target);
    });

    //console.log(this._IOs.size);
  }
  _resizeElements() {
    // if there is no elements, stop here
    if( this._elements.size === 0 ) return;
    
    this._elements.forEach(element => {
      const rootMargin = getRootMargin(element.el) ?? this._options.offset;

      // if rootMargin has changed
      if( rootMargin[0] !== element.rootMargin[0] || rootMargin[1] !== element.rootMargin[1] ) {
        console.log('rootMargin has changed:', 'OLD:', element.rootMargin, 'NEW:', rootMargin);

        // remove references from IO
        this._targets.get(element.io).delete(element);

        // stop observing this target if not required anymore
        //if( this._targets.get(element.io). ) element.io.unbserve(element.target);

        // save new rootMargin, IO & update inView status
        element.rootMargin = rootMargin;
        element.io = this._getIOFromRootMargin(rootMargin, element.root);
        element.rootInView = element.root ? false : true;
        element.inView = false;
        element.called = false;

        // save references for this new IO
        this._targets.get(element.io).add(element);

        // observe element's target
        element.io.observe(element.target);
      }
      
      // update reference in Map
      this._elements.set(element.el, element);
    });

    //console.log(this._IOs.size);
  }
  /*
  _checkElements() {
    console.log('check elements');
  }
  */
  _notify(element, direction, event) {
    if( this._options.globalEmitter ) {
      const func = Array.isArray(element.call) ? element.call : [element.call];
      func.forEach(call => EMITTER.emit(`SiteScroll.${call}`, direction, element, this.scroll));
    } else {
      element.el.dispatchEvent(new CustomEvent(event, { bubbles: false, detail: { element, scroll: this.scroll } }));
    }
  }
  _getIOFromRootMargin(rootMargin, root = null) {
    const formattedRootMargin = this._formatRootMargin(rootMargin);
    const udid = root ? `${root}_${formattedRootMargin}` : formattedRootMargin;

    // create Intersection Observer if doesn't exist
    if( !this._IOs.has(udid) ) {
      const io = new IntersectionObserver(this._onIO, { root: root ? $(root) : null, rootMargin: formattedRootMargin });
      
      this._IOs.set(udid, io);
      this._targets.set(io, new Set());
    }

    // return Intersection Observer from udid
    return this._IOs.get(udid);
  }

  _setInView(element, silent = false, force = false) {
    // if element is already in view, stop here
    if( element.inView && !force ) return;
    
    // update inView status
    element.inView = true;

    // stop here if root isn't in view
    if( !element.rootInView ) return;
    
    // add inView classname
    element.el.classList.add(INVIEW_CLASSNAME);
    
    // emit call event
    if( element.call && !element.called && !silent ) {
      // if repeat != true, set has called to prevent recalling method when re-entering viewport
      if( !element.repeat ) element.called = true;
      
      this._notify(element, INVIEW_ENTER, EVENT_ENTER);
    }
  }
  _setOutView(element, silent = false, weak = false) {
    // if element is already out of view, stop here
    if( !element.inView ) return;
    
    // update inView status
    if( !weak ) element.inView = false;
    
    // emit call event
    if( element.call && element.repeat && !silent ) this._notify(element, INVIEW_EXIT, EVENT_EXIT);
    
    // if repeat = true, remove inView classname
    if( element.repeat ) element.el.classList.remove(INVIEW_CLASSNAME);
  }
  _formatRootMargin(rootMargin) {
    return `${rootMargin[1]} -1px ${rootMargin[0]} -1px`;
  }
  
  _onIO(entries, io) {
    if( !this._started ) return;

    const targets = this._targets.get(io);

    entries.forEach(entry => {
      targets.forEach(element => {
        // if this entry is not linked to this element's [data-scroll-target], stop here
        if( element.target !== entry.target ) return;

        // if element is inView
        if( entry.isIntersecting ) {
          // if element wasn't inView, set inView
          if( !element.inView ) this._setInView(element);
        } else {
          // if element was inView, set outView
          if( element.inView ) this._setOutView(element);
        }
      });
    });
  }
  _onRoot(entries) {
    if( !this._started ) return;

    entries.forEach(entry => {
      this._roots.forEach(element => {
        // if this entry is not linked to this element's [data-scroll-root], stop here
        if( element.rootEl !== entry.target ) return;

        // if element's [data-scroll-root] is inView
        if( entry.isIntersecting ) {
          element.rootInView = true;

          // if element's was set inView by his [data-scroll-target], set inView
          if( element.inView ) this._setInView(element, false, true);
        } else {
          element.rootInView = false;

          // if element's is still inView from his [data-scroll-target], set outView
          if( element.inView ) this._setOutView(element, false, true);
        }
      })
    });
  }
}

export default ScrollIO;
