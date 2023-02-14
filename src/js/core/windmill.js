/**
* WINDMILL : Transitions system between for your Wordpress's website.
* 
* --------------
*  How it works
* --------------
* Windmill listen for click on all links on the page.
* If link's URL passes all tests, his URL is loaded via AJAX. (Tests suite will be describe later.)
* 
* While waiting for AJAX response, Windmill emit a series of events to perform beautiful transition 
* between current page and the next one.
* 
* It's important to note that Windmill always wait for the exiting transition to complete before
* removing current page content. Then, it wait for AJAX response to inject new page's content.
* Once these two steps are completed, enter transition is started.
* 
* In order to complete a full run, Windmill wait for enter transition to complete.
* Afterwards, Windmill will be able to perform another page transition.
* 
* If a new page transition is requested during a run, browser will go directly to requested URL
* without page transition using 'window.location.assign(url)'.
* 
* --------------
*  Installation
* --------------
* You need to add `[data-windmill="container"]` attribute on the DOMElement that will remove/add content during page transition.
* You need to add `[data-windmill="wrapper"]` attribute on the DOMElement that will be added/removed by `[data-windmill="container"]` during page transition.
* 
* Once these two steps are done, you need to initialize Windmill in javascript.
* 
* //
* // import windmill from '@core/windmill'
* // 
* // windmill.init();
* //
* 
* ------------------------------------------
*  How to prevent a link from being tracked
* ------------------------------------------
* To prevent a link from triggering Windmill, add `[data-windmill-prevent]` attribute on the link.
* To prevent all links contained in a DOM element from triggering Windmill, add `[data-windmill-prevent="all"]` attribute on this DOM element.
* 
* ----------------------------------------------
*  Replacing current history instead of pushing
* ----------------------------------------------
* Replacing current history has some benefits over push new URLs each time.
* For example, you want to apply filters on a list of posts and be able to have a shareable URL of this page.
* 
* There is two way to achieve this:
* 
*  1. You can use windmill.replace(url) in your custom Javascript code.
*  2. Add `[data-windmill-method="replace"]` attribute on your link.
* 
* It's also very important to note that replacing current `window.location` will not trigger a page transition.
* It's up to you to perform AJAX request to fulfill the needs of your application.
* 
* 
* ----------------
*  Public API
* ----------------
* - init : Initialize Windmill with options
*    - options [object] : Initialization options (optional)
* - use : Initialize plugin
*    - plugin : Class instance or object with a `install` method
* - on : Add event listener
*    - event [string] : Event to listen (mandatory)
*    - fn [function] : Function to execute when event is emitted (mandatory)
*    - ctx [object] : Javascript context in which to execute function (optional) (default: null)
* - once : Add event listener that will unregister after first execution
*    - event [string] : Event to listen (mandatory)
*    - fn [function] : Function to execute when event is emitted (mandatory)
*    - ctx [object] : Javascript context in which to execute function (optional) (default: null)
* - off : Remove event listener
*    - event [string] : Event to listen (mandatory)
*    - fn [function] : Function to execute when event is emitted (mandatory)
*    - ctx [object] : Javascript context in which to execute function (optional) (default: null)
* - start : Start listening to `history.popstate` and links click 
* - stop : Stop listening to `history.popstate` and links click (do not stop running transition)
* - back : Causes the browser to move back in the session history
*    - delta [integer] : How many times to move back (optional) (default: -1) 
* - forward : Causes the browser to move forward in the session history
*    - delta [integer] : How many times to move forward (optional) (default: 1) 
* - force : Change `window.location`
*    - url [string] : URL to go (mandatory)
* - go : Go to URL and trigger page transition if all tests passes
*    - url [string] : URL to go (mandatory)
*    - el [DOMElement] : Element who triggered the action (optional)
*    - event [Event] : Event related to this action 
* - push : Change current `window.location` with requested URL without triggering page transition.
*    - url [string] : URL to set in `window.location` (mandatory)
* - replace : Change current `window.location` with requested URL without triggering page transition.
*    - url [string] : URL to set in `window.location` (mandatory)
* 
* ---------
*  Options
* ---------
* - autoStart [boolean] : Will call windmill.start() right after windmill.init(). (default: true)
* - cache [boolean] : Save AJAX response to reuse when the same URL is requested later. (default: true)
* - container [string] : CSS selector of Windmill's container. DOMElement removing and adding pages content. (default: [data-windmill="container"])
* - debug [boolean] : If enabled, Windmill will throw error when something critical happen.
* - preloadImages [boolean] : If enabled, Windmill will preload images before `ready` and `entering` events.
* - prevent [function] : 
*    Custom rules to prevent windmill to perform transition. 
*    Method must return a boolean (true|false). 
*    A positive return (true) will result in forcing `window.location` to URL.
* 
*    Method will received these params:
*      - url [string] : URL of the new page
*      - el [DOMElement] : Element who triggered the action
*      - event [Event] : Event related to action
* 
* - runningClassname [string] : Classname added to <html> when Windmill is running. (default: windmill-is-running)
* - scrollRestoration [boolean] : Use `history.scrollRestoration = "manual"` or not. (default: true)
* - timeout [integer] : How long (in milliseconds) we should wait for AJAX response before forcing `window.location` to new URL. (default: 5000)
* - transitions [array] : Array of transitions
* - wrapper [string] : CSS selector of Windmill's wrapper. DOMElement that will be added/removed from Windmill's container. (default: [data-windmill="wrapper"])
* 
* --------
*  Events
* --------
* Windmill give you access to a powerfull events system that let you perform various actions during is page transition process.
* When it emit an event, Windmill run all callback synchroniously. 
* Callback order is preserve and wait for the previous one to complete before execution.
* It enable you to preload images of next page before showing it to the world.
* 
* 
* Events ordering on page load:
*  - init (right after module initialization)
*  - loaded (after images preloading)
*  - ready (ready transition)
*  - done (when ready transition is completed)
* 
* Events ordering on history change:
*  - exiting (before exit transition)
*  - exit (hide current page)
*  - exited (after current page is hidden but before being remove from DOM)
*  - fetched (after current page is removed from DOM but before new page is added to DOM, HTML of new page is accessible in event's data.html param)
*  - entering (before enter transition, new page has been added to DOM)
*  - enter (show current page)
*  - entered (after current page is shown)
*  - done (when page transition is completed and ready for another page transition)
* 
* -------------
*  Transitions 
* -------------
* Windmill accept a array of transitions as options during initialization.
* It means you can perform different page transition depending on the current or new URL.
* 
* During Windmill's initialization process, it find the first transition you own a `ready` method.
* This transition will be set as the current one for the "ready" phase.
* Transition's methods are invoked after all events of the same name are completed.
* 
* Example: 
*  - Imagine a transition with a `exit` and `enter` method.
*  - Windmill start a page transition.
*    - `exiting` event is emitted and all callback are executed.
*    - `exit` event is emitted and all callback are executed.
*      - transition.exit method is executed after all `exit` callback.
*    - `exited` event is emitted and all callback are executed.
*    - `entering` event is emitted and all callback are executed.
*    - `enter` event is emitted and all callback are executed.
*      - transition.enter method is executed after all `exit` callback.
*    - `entered` event is emitted and all callback are executed.
*    - `done` event is emitted and all callback are executed.
*  - Windmill is ready for a new page transition
* 
* The idea behind this transition system is to hide old content as fast as possible, then remove it.
* Wait until AJAX response to add new content, then show it to the world.
* 
* By default, Windmill doesn't come with built-in transition. 
* It simply remove old content after `exited` event and add new page content before `entering` event.
* 
* 
* -------------
*  Tests suite
* -------------
* Various tests are run before triggering a page transition.
* If one of these tests return something different than FALSE, page transition will not be triggered.
* 
* - check if the link is same as window.location (only for link click & windmill.go)
* - check if transition is running
* - check if browser supports 'history.pushState'
* - check if the user is pressing ctrl + click, the browser will open a new tab
* - check if the link has `_blank` target
* - check if the link is cross-domain
* - check if the link is on same port (ex: 80)
* - check if the link has download attribute
* - check if the link contains [data-windmill-prevent]
* - check custom prevent method
*/

import { $, html, body } from "@utils/dom";
import { isFunction } from "@utils/is";
import { on, off } from "@utils/listener";
import ImagesLoaded from "@utils/imagesloaded";

const DEFAULT_OPTIONS = {
  autoStart: true,
  async: false,
  cache: true,
  container: '[data-windmill="container"]',
  debug: false,
  preloadImages: true,
  prevent: () => false,
  runningClassname: 'windmill-is-running',
  scrollRestoration: true,
  timeout: 5000,
  transitions: [],
  wrapper: '[data-windmill="wrapper"]',
};

const PREVENT_RUNNING = 1;
const PREVENT_HISTORY_PUSHSTATE = 2;
const PREVENT_CTRL_CLICK = 3;
const PREVENT_BLANK = 4;
const PREVENT_CROSSDOMAIN = 5;
const PREVENT_PORT = 6;
const PREVENT_DOWNLOAD = 7;
const PREVENT_DATA_WINDMILL_PREVENT = 8;
const PREVENT_CUSTOM = 9;

class Windmill {
  constructor() {
    this._cache = new Map();
    this._data = {current: {url: null, container: null, html: null}, next: {url: null, container: null, html: null}};
    this._fetched = false;
    this._fetchPromise = null;
    this._listeners = new Map();
    this._options = { ...DEFAULT_OPTIONS };
    this._parser = null;
    this._plugins = new Set();
    this._running = false;
    this._transition = null;
    
    this._onPopStateBnd = this._onPopState.bind(this);
    this._onLinkClickBnd = this._onLinkClick.bind(this);
    this._onTimeoutBnd = this._onTimeout.bind(this);
  }
  
  init(options = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
    
    // get and check wrapper
    this._wrapper = $(this._options.wrapper);
    if( !this._wrapper && this._options.debug === true ) throw new Error('[windmill] Can\'t find wrapper.');
    
    // check container
    if( !$(this._options.container) && this._options.debug === true ) throw new Error('[windmill] Can\'t find container.');
    
    // enable scroll restoration
    if (this._options.scrollRestoration === true && "scrollRestoration" in history) history.scrollRestoration = "manual";
    
    // find first transition with "ready" method
    this._transition = this._options.transitions.find(transition => isFunction(transition.ready));
    
    // collect current data
    this._data.current.url = cleanURL();
    this._data.current.container = $(this._options.container);
    this._data.current.html = html.innerHTML;

    // install plugins
    this._plugins.forEach(plugin => {
      if( plugin && isFunction(plugin.install) ) plugin.install(this);
    });
    
    // start automatically
    if (this._options.autoStart === true) this.start();
    
    // start ready phase
    this._emit('init')
      .then(() => this._preloadImages())
      .then(() => this._emit('loaded'))
      .then(() => this._emit('ready'))
      .then(() => this._emit('done'));
  }
  use(plugin) { this._plugins.add(plugin); }
  
  // Event listening system
  on(event, fn, ctx = null) {
    // if first time listening to this event, create a new set
    if( !this._listeners.has(event) ) this._listeners.set(event, new Set());
    
    // get set from this event
    const set = this._listeners.get(event);
    
    // register event
    set.add({
      ctx: ctx,
      fn,
    });
  }
  once(event, fn, ctx = null) {
    const onceFn = (...args) => {
      this.off(event, onceFn);
      fn.apply(ctx, args);
    };
    
    this.on(event, onceFn);
  }
  off(event, fn, ctx = null) {
    // if there is no listeners for this event, stop here
    if( !this._listeners.has(event) ) return;
    
    // get set from this event
    const set = this._listeners.get(event);
    
    // unregister event
    set.forEach((listener) => {
      if( fn === listener.fn && listener.ctx === ctx ) set.delete(listener);
    });
  }
  
  // start listening to `history.popstate` and links click
  start() {
    on(window, 'popstate', this._onPopStateBnd);
    on(document, 'click', this._onLinkClickBnd);
  }
  
  // stop listening to `history.popstate` and links click
  stop() {
    off(window, 'popstate', this._onPopStateBnd);
    off(document, 'click', this._onLinkClickBnd);
  }
  
  back(delta = -1) { history.go(delta); }
  forward(delta = 1) { history.go(delta); }
  force(url) { window.location.assign(url); }
  
  // go to URL and trigger page transition if all tests passes
  go(url, el = null, event = null) {
    // if url was not defined, stop here
    if( !url ) {
      if( this._options.debug === true ) throw new Error('[windmill] Go without url is forbidden.');
      return;
    }
    
    // if same URL as window.location or url is prevented, force URL
    if( sameURL(url) || this._checkPrevent(url, el, event) !== false ) {
      this.force(url);
      return;
    }
    
    // push new state into history
    history.pushState({ scrollY: window.scrollY }, '', url);
    
    // perform transition
    this._run(url);
  }
  
  // push URL to history without triggering page transition
  push(url) {
    this._data.current.url = url;
    history.pushState({ scrollY: 0 }, '', url);
  }
  
  // replace URL from history without triggering page transition
  replace(url) {
    this._data.current.url = url;
    history.replaceState({ scroll: 0 }, '', url);
  }
  
  
  
  _checkPrevent(url, el = null, event = null) {
    // check if transition is running
    if( this._running ) return PREVENT_RUNNING;
    
    // check if browser supports 'history.pushState'
    if( !window.history.pushState ) return PREVENT_HISTORY_PUSHSTATE;
    
    // check if the user is pressing ctrl + click, the browser will open a new tab
    if( event && (event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) ) return PREVENT_CTRL_CLICK;
    
    // check if the link has `_blank` target
    if( el && el.hasAttribute && el.hasAttribute('target') && el.target === '_blank' ) return PREVENT_BLANK;
    
    // check if the link is cross-domain
    if( el && (
      (el.protocol !== undefined && window.location.protocol !== el.protocol) || 
      (el.hostname !== undefined && window.location.hostname !== el.hostname))
    ) return PREVENT_CROSSDOMAIN;
      
    // check if the link is on same port
    if( el && el.port !== undefined && el.href !== undefined && getURLPort() !== getURLPort(el.href) ) return PREVENT_PORT;
    
    // check if the link has download attribute
    if( el && el.getAttribute && el.getAttribute('download') === 'string' ) return PREVENT_DOWNLOAD;
    
    // check if the link contains [data-windmill-prevent]
    if( el && el.hasAttribute && el.hasAttribute('data-windmill-prevent') ) return PREVENT_DATA_WINDMILL_PREVENT;
    
    // check if ancestor of link contains [data-windmill-prevent="all"]
    if( el ) {
      let element = el;
      while( element && element.getAttribute ) {
        if( element.getAttribute('data-windmill-prevent') === 'all' ) return PREVENT_DATA_WINDMILL_PREVENT;
        element = element.parentNode;
      }
    }
    
    // check custom prevent method
    if( this._options.prevent(url, el, event) === true ) return PREVENT_CUSTOM;
    
    // if all tests passes, perform page transition
    return false;
  }
  _run(url) {
    // update data
    this._data.next.url = url;
    
    // update running status to prevent performing two transitions simultaneously
    this._running = true;
    
    // find first transition with exit & enter methods
    this._transition = this._options.transitions.find(transition => isFunction(transition.exit) && isFunction(transition.enter));
    
    // add special classname to html
    html.classList.add(this._options.runningClassname);
    
    // restore cache is available and enabled
    if( this._options.cache === true && this._cache.has(cleanURL(url)) ) {
      this._fetched = true;
      this._onFetch( this._cache.get( cleanURL(url) ) ); 
    }
    else {
      // start timeout handler
      this._timeout = setTimeout(this._onTimeoutBnd, this._options.timeout);
      
      // fetch URL
      this._fetched = false;
      
      fetch(url)
        .then(response => {
          // cancel timeout
          if( this._timeout ) clearTimeout(this._timeout);
          this._timeout = null;
          
          // return html (promise)
          return response.text()
        })
        .then(this._onFetch.bind(this))
        .catch(this._onTimeoutBnd);
    }
    
    
    // chaining events
    if( this.async ) {
      this._emit('exiting')
        .then(() => this._emit('exit'))
        .then(() => this._onAsyncFetch())
        .then(() => this._emit('exited'))
        .then(() => this._emit('fetched'))
        .then(() => this._addNewPage())
        //.then(() => this._preloadImages())
        .then(() => this._emit('entering'))
        .then(() => this._restoreScroll())
        .then(() => this._emit('enter'))
        .then(() => this._emit('entered'))
        .then(() => this._removeOldPage())
        .then(() => this._performCompletion())
        .then(() => this._emit('done'))
        .then(() => this._switchData());
    } else {
      this._emit('exiting')
        .then(() => this._emit('exit'))
        .then(() => this._emit('exited'))
        .then(() => this._removeOldPage())
        .then(() => this._onAsyncFetch())
        .then(() => this._emit('fetched'))
        .then(() => this._addNewPage())
        .then(() => this._preloadImages())
        .then(() => this._emit('entering'))
        .then(() => this._restoreScroll())
        .then(() => this._emit('enter'))
        .then(() => this._emit('entered'))
        .then(() => this._performCompletion())
        .then(() => this._emit('done'))
        .then(() => this._switchData());
    }
  }
  _emit(event) {
    // let's start a chain of promises
    let chain = Promise.resolve();
    
    // Chain async functions if there is listeners
    if( this._listeners.has(event) ) {
      this._listeners.get(event).forEach(({ctx, fn}) => {
        chain = chain.then(() => fn.call(ctx, this._data));
      });
    }
    
    // chain transition method if it exists
    if( this._transition && isFunction(this._transition[event]) ) {
      chain = chain.then(() => this._transition[event].call(this._transition, this._data));
    }
    
    return chain;
  }
  _removeOldPage() {
    // remove old content from DOM
    this._data.current.container.remove();
    this._data.current.container = null;
  }
  _addNewPage() {
    // create DOMParser once
    if( !this._parser) this._parser = new DOMParser();
    
    const source = this._parser.parseFromString(this._data.next.html, "text/html");
    const classNames = $('body', source).classList;
    const inlinedStyles = $("body", source).getAttribute('style');
    const title = $('title', source);
    
    // apply new classList to body
    if( classNames ) body.classList = classNames;
    
    // remove all previous inlined style on body
    if( body.hasAttribute('style') ) body.removeAttribute('style');
    
    // apply new inlined styles to body
    if( inlinedStyles ) body.style = inlinedStyles;

    // update document title
    if( title ) document.title = title.innerHTML;
    
    // add new content in DOM
    if( this._wrapper && this._data.next.container ) this._wrapper.appendChild(this._data.next.container);
    
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  _preloadImages() {
    // if images preloading is disable, stop here
    if( !this._options.preloadImages ) return;
    
    // preload images before ready transition
    return new Promise((resolve) => {
      this._imgLoader = new ImagesLoaded(this._data.next.container || this._data.current.container, () => {
        this._imgLoader.destroy();
        this._imgLoader = null;
        
        resolve();
      });
    });
  }
  _restoreScroll() {
    // if scrollRestoration is enabled, try to restore scroll
    if( this._options.scrollRestoration === true ) {
      if( this._scrollY > 0 ) window.scrollTo({ top: this._scrollY, behavior: 'instant' });
      this._scrollY = 0;
    }
  }
  _performCompletion() {
    this._running = false;
    
    // remove special classname from html
    html.classList.remove(this._options.runningClassname);
  }
  _switchData() {
    this._data.current.url = this._data.next.url;
    this._data.current.container = this._data.next.container;
    this._data.current.html = this._data.next.html;
    
    this._data.next = { url: null, container: null, html: null };
  }
  
  
  _onPopState(event) {
    // if scrollRestoration is enabled, get scrollY from history state
    if( this._options.scrollRestoration === true ) {
      this._scrollY = event.state && event.state.scrollY ? event.state.scrollY | 0 : 0;
    }
    
    const url = window.location.href;
    
    // check prevent & force URL for these scenarios
    switch( this._checkPrevent(url, window, event) ) {
      case PREVENT_RUNNING:
      case PREVENT_CUSTOM: 
      this.force(url);
      return;
    }
    
    this._run(url, window, event);
  }
  _onLinkClick(event) {
    // get nearest link from event.target
    const link = getLinkElementFromEvent(event);
    
    // if we can't find link, windmill will not interfere with this link
    if (!link) return;
    
    // get href from link
    const href = getHref(link);
    
    // if same URL as window.location or url is prevented, follow link default behavior
    if( sameURL(href) || this._checkPrevent(href, link, event) !== false ) return;
    
    // prevent link default behavior
    if( event && event.cancelable ) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // check if link replace current history instead of pushing a new one
    if( link.getAttribute('data-windmill-method') === 'replace' ) this.replace(href);
    else {
      // push new state into history
      history.pushState({ scrollY: window.scrollY }, '', href);
      
      // perform transition
      this._run(href, link, event);
    }
  }
  _onFetch(html) {
    // save new content
    this._data.next.html = html;
    
    // set cache if enabled
    if( this._options.cache === true ) this._cache.set(cleanURL(this._data.next.url), html);
    
    // DOMParser.parseFromString fails with img[srcset] on iOS. 
    // see https://github.com/metafizzy/infinite-scroll/issues/770
    const newDocument = document.createElement('div');
          newDocument.innerHTML = html;

    // get & check container
    const container = $(this._options.container, newDocument);
    if( !container && this._options.debug === true ) throw new Error('[windmill] Can\'t find container in new page.');

    // save next container
    this._data.next.container = container;

    // update fetching status
    this._fetched = true;

    // if windmill was waiting for fetch to respond, resolve promise to continue events chain
    if( this._fetchPromise ) this._fetchPromise();
 
    // remove reference to promise
    this._fetchPromise = null;
  }
  _onAsyncFetch() {
    return new Promise(resolve => {
      // if fetch as not responded, wait for it to resolve promise
      if( this._fetched ) resolve();
      else this._fetchPromise = resolve;
    });
  }
  _onTimeout() {
    // if request is fetched, stop here
    if( this._fetched ) return;
    
    // force reload
    this.force(window.location.href);
  }
  
  
  // getter - setter
  get async() { return this._options.async }
  get debug() { return this._options.debug }
}

// loop through parent until we find <a> with href
function getLinkElementFromEvent(event) {
  let el = event.target;
  while( el && !getHref(el) ) el = el.parentNode;
  
  // if we can't find <a>, stop here
  if( !el ) return;
  
  return el;
}

// get href from a DOMElement and make sure element is a <a>
function getHref(el) {
  // HTML tagName is UPPERCASE, xhtml tagName keeps existing case.
  if (el.tagName && el.tagName.toLowerCase() === 'a') {
    // HTMLAnchorElement, full URL available
    if (typeof el.href === 'string') return el.href;
  }
  
  return null;
}

// check if url is the current url
function sameURL(url) {
  if( url && getURLPort(url) === getURLPort() && cleanURL(url) === cleanURL() ) return true;
}

// Get port from URL
function getURLPort(url = window.location.href) {
  const matches = url.match(/:\d+/);
  
  if (matches === null) {
    if (/^http/.test(url)) return 80;  
    if (/^https/.test(url)) return 443;
  } else {
    const portString = matches[0].substring(1);
    return parseInt(portString, 10);
  }
  
  return undefined;
}

// Clean URL, remove "hash" and/or "trailing slash".
function cleanURL(url = window.location.href) {
  return url.replace(/(\/#.*|\/|#.*)$/, '');
}

const windmill = new Windmill();
export default windmill;
