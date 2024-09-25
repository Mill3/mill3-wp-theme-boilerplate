/*

──────────────────────────────────────────
──────────────────────────────────────────
RESIZE & ORIENTATION
──────────────────────────────────────────
──────────────────────────────────────────

import ResizeOrientation from '@utils/resize';

function callback(event) {
  // do something
}

// start listening to window's resize & orientation change events
//  - callback (function) : code to execute on window's resize
//  - priority (integer) : execution priority [-999, 999], the higher will run first
ResizeOrientation.add(callback, priority);


// stop listening to window's resize & orientation change events
ResizeOrientation.remove(callback);

*/

import { on, off } from "./listener";
import { mobile } from "./mobile";
import Throttle from "./throttle";


export const AFTER_SCROLL_UPDATE = -999;
export const MILL3_SCROLL_PRIORITY = -450;
export const BEFORE_SCROLL_UPDATE = 999;

class ResizeOrientation {
  constructor() {
    this._event = null;
    this._listening = false;
    this._listeners = [];
    this._tick = null;

    this._getThrottleBnd = this._getThrottle.bind(this);
    this._getRafBnd = this._getRAF.bind(this);
    this._runBnd = this._run.bind(this);

    this.init();
  }

  init() {
    // create throttler
    this._throttle = Throttle({ cb: this._getRafBnd, delay: 200, onlyAtEnd: false });
  }

  add(callback, priority = 0) {
    // if callback is already registered, stop here
    if( this._exists(callback) ) return;

    // add callback to the list of listeners
    this._listeners.push({ callback, priority });

    // sort callbacks by priority (higher the better)
    this._listeners.sort((a, b) => {
      if( b.priority > a.priority ) return 1;
      else if( b.priority < a.priority ) return -1;
      
      return 0;
    });

    // if not already listening to window's resize event AND
    // if list of listeners is not empty
    if( !this._listening && this._listeners.length > 0 ) this._bindEvents();
  }
  remove(callback) {
    // if callback is not registered, stop here
    if( !this._exists(callback) ) return;

    // remove callback from list of listeners
    const index = this._listeners.findIndex(listener => listener.callback === callback);
    this._listeners.splice(index, 1);

    // if was listening to window's resize event AND
    // if list of listeners is empty
    if( this._listening && this._listeners.length === 0 ) this._unbindEvents();
  }
  trigger() {
    if( this._tick ) return;

    this._tick = true;
    this._event = new Event("resize");
    this._run();
  }

  _bindEvents() {
    if( this._listening ) return;
    this._listening = true;

    on(window, mobile ? "orientationchange" : "resize", this._getThrottleBnd);
  }
  _unbindEvents() {
    if( !this._listening ) return;

    off(window, mobile ? "orientationchange" : "resize", this._getThrottleBnd);
    this._listening = false;
  }

  _exists(callback) {
    return this._listeners.find(listener => listener.callback === callback);
  }

  _getThrottle(event) {
    // save event for later
    this._event = event;

    // start throttler
    this._throttle.init();
  }
  _getRAF() {
    // if already waiting for RAF to run, stop here
    if ( this._tick ) return;

    // save tick to prevent 
    this._tick = true;

    // RAF
    requestAnimationFrame( this._runBnd );
  }
  _run() {
    // execute all callbacks
    this._listeners.forEach(({callback}) => callback(this._event));

    // enable another run for later
    this._tick = false;
  }
}

const SINGLETON = new ResizeOrientation();
export default SINGLETON;
